################################################################
# event_sessions/views.py                                      #
# Written by: UNSW COMP3900 New World                          #
# Date: 4-Aug-2022                                             #
#                                                              #
# Django Rest Framework views.py file for even_sessions        #
################################################################


import datetime as dt
import threading
import uuid

from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User, UserSession
from accounts.serializers import UserSerializer, UserSessionSerializer
from helper.auth import auth_token, get_user_id_from_request
from helper.emails import check_email_format, send_email
from ingredients.models import Ingredient
from recipes.models import Recipe, RecipeIngredient

from .models import Session
from .serializers import SessionSerializer


def iso_to_datetime(iso_datetime_str):
    """
        Convert iso to datetime
    """
    return dt.datetime.strptime(iso_datetime_str, "%Y-%m-%dT%H:%M:%S.%fZ")


def calc_contribution_possible(session_start_time, contribution_time_limit):
    """
        Checks if contributing to a sessions is still allowed based on the current time
        and the contribution time limit on the sessions
        Checks that the diff. between start and now is larger than cont. limit

        Parameters:
            session_start_time (datetime object): The start time of the session
            contribution_time_limit (int): Number of minutes before the session, that contribution is disabled

        Returns:
            True / False
    """
    # Calculate the exact session cutoff time
    cutoff_time = session_start_time - dt.timedelta(minutes=contribution_time_limit)

    # Check if the current time is past the session cutoff time
    present = dt.datetime.now()
    if present < cutoff_time:
        return True
    return False


def get_recipe_objects_from_id(session_recipes):
    """
        Get recipe by id
    """
    recipe_list = []
    for recipe_id in session_recipes:
        rec = dict()
        recipe = Recipe.objects.get(id=recipe_id)
        rec["id"] = recipe.id
        rec["title"] = recipe.title
        rec["cuisine"] = recipe.cuisine
        rec["tags"] = recipe.tags
        rec["rating"] = recipe.rating
        rec["cook_time"] = recipe.cook_time
        rec["course"] = recipe.course
        rec["image"] = recipe.image
        recipe_list.append(rec)

    return recipe_list


def get_guest_id_name_from_emails(session):
    """
        Get guests ids by emails
    """
    guests = list()
    index = 0
    for email in session.email_list:
        # Create object
        temp = dict()

        # get db users based on guest list emails
        cur_user = User.objects.get(email=email)
        temp["id"] = cur_user.id

        # If the user is a ghost user (indicated with the -1)
        # then use the name given by the host
        # but if the user is registered, use the registered name attached to the email address
        if cur_user.name == "-1":
            temp["name"] = session.name_list[index]
        else:
            temp["name"] = cur_user.name

        pair = UserSession.objects.get(user_id=cur_user.id, session_id=session.id)
        temp["is_going"] = pair.is_going

        # increase the index incase we need to get the stored name from the session
        index += 1
        guests.append(temp)

    return guests


def build_ingredient_details(ingredient_list):
    result = list()

    for ingredient in ingredient_list:
        ing = dict()
        ing["name"] = ingredient["ingredient_name"]
        ing["id"] = ingredient["ingredient_id"]
        ing["qty"] = ingredient["qty"]
        ing["unit"] = ingredient["unit"]
        ing["user_id"] = int(ingredient["user_id"])

        result.append(ing)

    return result


def get_guest_id_and_status(session):
    """
    Get guests id and status from session
    """
    guests = list()
    temp = dict()
    for email in session.email_list:
        user = User.objects.get(email=email)
        pair = UserSession.objects.get(user_id=user.id, session_id=session.id)
        temp = {"id": user.id, "is_going": pair.is_going}
        guests.append(temp)

    return guests


def get_short_ingredient_list(ingredient_list):
    result = list()

    for ingredient in ingredient_list:
        ing = dict()
        ing["id"] = ingredient["ingredient_id"]
        ing["user_id"] = int(ingredient["user_id"])

        result.append(ing)

    return result


class CompileListView(APIView):
    def post(self, request):

        multiplier = request.data["num_people"]

        # Key = Ingredient ID
        # Value = qty
        ingredients_qty = dict()

        # For recipe, get all ingredients and add to a dictionary
        for recipe in request.data["recipes"]:
            for ri in RecipeIngredient.objects.filter(recipe=recipe).all():

                # Add qty to cumulative list
                # this allowed / accounts for duplicate recipes
                # and actually combines the ingredients across multiple recipes
                if ri.ingredient.id in ingredients_qty:
                    ingredients_qty[ri.ingredient.id] += ri.qty
                else:
                    ingredients_qty[ri.ingredient.id] = ri.qty

        ingredient_list = list()
        for ingredient_id in ingredients_qty.keys():

            ing = dict()
            ing_obj = Ingredient.objects.get(id=ingredient_id)
            ing["id"] = ingredient_id
            ing["name"] = ing_obj.name
            ing["qty"] = ingredients_qty[ingredient_id] * multiplier
            ing["unit"] = ing_obj.unit

            ingredient_list.append(ing)

        ingredient_list.sort(key=lambda x: x["name"])

        return Response({"ingredient_list": ingredient_list})


class CreateSessionView(APIView):
    def generate_session_code(self):
        return str(uuid.uuid4())[:6]

    def get_emails_from_data(self, request_data):
        emails = []
        for guest in request_data["guest_list"]:
            emails.append(guest["email"])
        return emails

    def get_names_from_data(self, request_data):
        names = []
        for guest in request_data["guest_list"]:
            names.append(guest["name"])
        return names

    def get_ingredients_from_data(self, request_data):
        """
            request ingredient_list:
                {
                    "ingredient_id": 2,
                    "qty": 10
                },
        """
        ingredients = []
        """        
            model dict format:
            {
                ingredient_name: '',
                ingredient_id : int,
                qty: int ,
                user_id: int
                unit: str
            }
        """
        for ingredient in request_data["ingredient_list"]:
            # not validating ingredient_id here
            ing = {
                "ingredient_id": ingredient["ingredient_id"],
                "ingredient_name": Ingredient.objects.get(
                    id=ingredient["ingredient_id"]
                ).name,
                "qty": ingredient["qty"],
                "unit": Ingredient.objects.get(id=ingredient["ingredient_id"]).unit,
                "user_id": -1,
            }
            ingredients.append(ing)

        return ingredients

    def create_ghost_user(self, ghost_email):
        # create a ghost user with name and password = "-1"
        ghost_user = dict()
        ghost_user["name"] = "-1"
        ghost_user["email"] = ghost_email
        ghost_user["password"] = "-1"
        ghost_user["sign_up_date"] = None

        serializer = UserSerializer(data=ghost_user)
        serializer.is_valid(raise_exception=True)
        serializer.save()

    def create_user_session_pair(self, user_id, session_id):
        us_data = dict()
        us_data["user"] = user_id
        us_data["session"] = session_id
        us_serializer = UserSessionSerializer(data=us_data)
        us_serializer.is_valid(raise_exception=True)
        us_serializer.save()

    @swagger_auto_schema(request_body=SessionSerializer)
    @auth_token
    def post(self, request):
        """
            Request Body:
                {
                    "session_name": "Bob Dylan's Birthday",
                    "session_date": "2027-02-08",
                    "session_start_time": "2027-02-08 13: 30",
                    "session_end_time": "2027-02-08 16: 30",
                    "contribution_limit_time": 30,
                    "recipes": [
                        1,
                        2,
                        3
                    ],
                    "guest_list": [
                        {
                            "email": "t.killingback@unsw.edu.au",
                            "name": "Tom Killingback"
                        },
                        {
                            "email": "t.liu@unsw.edu.au",
                            "name": "Tiger Liu"
                        }
                    ],
                    "ingredient_list": [
                        {
                            "ingredient_id": 2,
                            "qty": 10
                        },
                        {
                            "ingredient_id": 31,
                            "qty": 8
                        }
                    ]
                }
        """
        request_data = request.data
        # this assumes that the host is the user creating the session and making create request
        host_user_id = get_user_id_from_request(request)
        request_data["host_user_id"] = host_user_id
        request_data["email_list"] = self.get_emails_from_data(request_data)
        request_data["name_list"] = self.get_names_from_data(request_data)
        request_data["ingredient_list"] = self.get_ingredients_from_data(request_data)
        request_data["session_code"] = self.generate_session_code()

        cur_sess_serializer = SessionSerializer(data=request_data)
        cur_sess_serializer.is_valid(raise_exception=True)
        cur_sess_serializer.save()

        # check that for each email in the session, there is a user, or create one if not
        for curr_email in request_data["email_list"]:
            if not check_email_format(curr_email):
                return Response(
                    {"error": "Invalid email."}, status=status.HTTP_400_BAD_REQUEST
                )
            try:
                user = User.objects.get(email=curr_email)
            except User.DoesNotExist:
                user = self.create_ghost_user(curr_email)
            finally:
                user = User.objects.get(email=curr_email)
                self.create_user_session_pair(user.id, cur_sess_serializer.data["id"])

        # add user_id of the host and session_id to usersession
        self.create_user_session_pair(
            get_user_id_from_request(request), cur_sess_serializer.data["id"]
        )

        # send email via threading with ics file when session is created
        host_obj = User.objects.get(pk=host_user_id)
        t = threading.Thread(
            target=send_email,
            args=(
                request_data["session_start_time"],
                request_data["session_end_time"],
                request_data["email_list"],
                request_data["session_code"],
                host_obj.name,
                host_obj.email,
                cur_sess_serializer.data["session_name"],
            ),
        )
        t.setDaemon(True)
        t.start()

        return Response(
            {"session_id": cur_sess_serializer.data["id"]},
            status=status.HTTP_201_CREATED,
        )


def get_session_details(session):

    # Convert from ISO8601 date/time string, to datetime object
    can_contribute = calc_contribution_possible(
        iso_to_datetime(session.session_start_time), session.contribution_limit_time
    )

    # Get Guests
    guests = get_guest_id_name_from_emails(session)
    host = User.objects.get(id=session.host_user_id)
    guests.append({"id": session.host_user_id, "name": host.name})

    return_body = {
        "session_name": session.session_name,
        "session_start_time": session.session_start_time,
        "session_end_time": session.session_end_time,
        "session_date": session.session_date,
        "session_code": session.session_code,
        "can_contribute": can_contribute,
        "contribution_time_limit": session.contribution_limit_time,
        "host_user_id": session.host_user_id,
        "guests": guests,
        "ingredient_list": build_ingredient_details(session.ingredient_list),
        "recipes": get_recipe_objects_from_id(session.recipes),
    }

    return return_body


class GetSessionView(APIView):
    @auth_token
    # Requesting user must be a host or member of the session
    def get(self, request, session_id):

        # Check valid session
        try:
            session = Session.objects.get(pk=session_id)
        except Session.DoesNotExist:
            return Response(
                {"error": "Hmmm... I couldn't find that session."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Requesting user must be a host or member of the session
        user_id = get_user_id_from_request(request)
        try:
            UserSession.objects.get(user_id=user_id, session_id=session_id)
        except UserSession.DoesNotExist:
            return Response(
                {"error": "Whoops, looks like you're not allowed to be here!"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # record the user has opened this session
        opened_users = session.opened_users
        if opened_users is None:
            opened_users = list()

        if user_id not in opened_users:
            opened_users.append(user_id)
            session.opened_users = opened_users
            session.save()

        return_body = get_session_details(session)

        return Response(return_body, status=status.HTTP_200_OK)


class GetSessionCodeView(APIView):
    def get(self, request, session_code):
        """
            # Get session from request.data session code
            # Set session_code to lower from user input
        """

        try:
            session_code = session_code.lower()
            session = Session.objects.get(session_code=session_code)
        except Session.DoesNotExist:
            return Response(
                {"error": "Hmmm... I couldn't find that session."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if iso_to_datetime(session.session_end_time) < dt.datetime.now():
            return Response(
                {
                    "error": "You're a bit late to the party! Sorry but that session has already ended!"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get all common details about a sessions
        return_body = get_session_details(session)

        # Add the session id, since this request was via a code, they now need to know the ID!
        return_body["id"] = session.id

        return Response(return_body, status=status.HTTP_200_OK)


class UpdateIngredientContributionView(APIView):
    def put(self, request, session_code):
        """
            Request Body:
                {
                    "ingredient_id": int,
                    "user_id": int (-1 if unassigning user from ingredient)
                }

            Response Body:
                {}
                200 ok
                400 - server time is before (session start time - session contribution time)
                404 - no session
        """
        try:
            session_code = session_code.lower()
            session = Session.objects.get(session_code=session_code)
        except:
            return Response(
                {
                    "error": "Hmmm... I couldn't find the session attached to this ingredient list."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        can_contribute = calc_contribution_possible(
            iso_to_datetime(session.session_start_time), session.contribution_limit_time
        )
        if not can_contribute:
            return Response(
                {"error": "Not in contribution time."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session.update_ingredient_list(
            request.data["ingredient_id"], request.data["user_id"]
        )
        # print(session.ingredient_list)
        return Response({}, status=status.HTTP_200_OK)


class GetSessionSyncView(APIView):
    def get(self, request, session_code):
        """
            request body = {}
            return body = {
                "can_contribute": true,
                "guests": [
                    {
                        "id": 78,
                        "is_going": "tentative"
                    },
                    {
                        "id": 79,
                        "is_going": "tentative"
                    }
                ],
                "ingredient_list": [
                    {
                        "id": 56,
                        "user_id": -1
                    },
                    ..
                ]
            }
        """
        try:
            session_code = session_code.lower()
            session = Session.objects.get(session_code=session_code)
        except Session.DoesNotExist:
            return Response(
                {"error": "Hmmm... I couldn't find that session."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Requesting user must be a host or member of the session
        user_id = get_user_id_from_request(request)
        try:
            UserSession.objects.get(user_id=user_id, session_id=session.id)
        except UserSession.DoesNotExist:
            return Response(
                {"error": "Whoops, looks like you're not allowed to be here!"},
                status=status.HTTP_403_FORBIDDEN,
            )

        return_body = {
            "can_contribute": calc_contribution_possible(
                iso_to_datetime(session.session_start_time),
                session.contribution_limit_time,
            ),
            "guests": get_guest_id_and_status(session),
            "ingredient_list": get_short_ingredient_list(session.ingredient_list),
        }

        return Response(return_body, status=status.HTTP_200_OK)
