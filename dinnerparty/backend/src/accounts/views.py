################################################################
# accounts/views.py                                            #
# Written by: UNSW COMP3900 NewWorld                           #
# Date: 4-Aug-2022                                             #
#                                                              #
# Django Rest Framework views.py file for accounts             #
################################################################


import datetime
import json

import jwt
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from event_sessions.models import Session
from helper.auth import (
    JWT_SECRET,
    TOKEN_EXPIRE_TIME,
    auth_token,
    get_user_id_from_request,
)
from recipes.models import Recipe

from .models import User, UserSession
from .serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    model = User
    queryset = User.objects
    serializer_class = UserSerializer


def enable_ghost_user(data):

    """
        data:
        {
            'email': '2726599283@qq.com',
            'password':'123abc',
            'name':'zico'
        }
    """

    """
        This will raise User.DoesNotExist if the ghost user hasn't been created before
        This should be throw up
    """
    user = User.objects.get(email=data["email"])

    serializer = UserSerializer(user, data=data)
    if serializer.is_valid():
        serializer.save()
        user_id = serializer.data["id"]

        payload = {
            "user_id": user_id,
            "email": data["email"],
            "exp": datetime.datetime.utcnow()
            + datetime.timedelta(minutes=TOKEN_EXPIRE_TIME),
            "iat": datetime.datetime.utcnow(),
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
        response = Response()
        response.data = {"token": token}
        response.status_code = status.HTTP_201_CREATED
        return response
    else:
        return Response(
            {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
        )


class RegisterView(APIView):
    @swagger_auto_schema(request_body=UserSerializer)
    def post(self, request):
        """
            request body:
            {
                "name": "Bob Dylan",
                "email": "test@test.au",
                "password": "123456"
            }
        """
        try:
            # try find a user that already exists and is not a ghost
            # i.e. check if a full user exists with this email
            user = User.objects.get(email=request.data["email"])
            if not user.is_ghost:
                return Response(
                    {"error": "This email is already in use"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except User.DoesNotExist:
            # if the user doesn't exit, okay to continue registering
            pass

        # distinguish ghost user or normal user
        try:
            return enable_ghost_user(request.data)
        except User.DoesNotExist:  # register for normal user

            serializer = UserSerializer(data=request.data)
            if serializer.is_valid():

                serializer.save()

                email = serializer.data["email"]
                user_id = serializer.data["id"]

                payload = {
                    "user_id": user_id,
                    "email": email,
                    "exp": datetime.datetime.utcnow()
                    + datetime.timedelta(minutes=TOKEN_EXPIRE_TIME),
                    "iat": datetime.datetime.utcnow(),
                }
                token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
                response = Response()
                response.data = {"token": token}
                response.status_code = status.HTTP_201_CREATED
                return response
            else:
                return Response(
                    {"error": json.dumps(serializer.errors)},
                    status=status.HTTP_400_BAD_REQUEST,
                )


class UpdateGhostUserView(APIView):
    def put(self, request, user_id):
        """
            Update email&password&name for a Ghost User
        
            route: /user/auth/register/<int:user_id>/
            user_id is the ghost user_id,
            basically update the user info for the given user_id
            and return a token
            Example:
                [PUT] http://localhost:5005/user/auth/register/38/

            request body:
                {
                    "email": "2726599283@qq.com",
                    "password":"123",
                    "name":"zico"
                }
        """
        try:
            return enable_ghost_user(request.data)
        except User.DoesNotExist:
            return Response(
                {
                    "error": "Woah, something went wrong here! Try again or contact us if the issue persists."
                },
                status=status.HTTP_404_NOT_FOUND,
            )


class LoginView(APIView):
    def post(self, request):
        """
            request body
            {
                "email": "test@test.au",
                "password": "123456"
            }
        """
        email = request.data["email"]
        password = request.data["password"]
        user = User.objects.filter(email=email).first()

        if user is None or user.is_ghost:
            return Response(
                {"error": "No user with that email exists!"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not user.check_password(password):
            return Response(
                {"error": "Incorrect password!"}, status=status.HTTP_400_BAD_REQUEST
            )
        payload = {
            "user_id": user.id,
            "email": user.email,
            "exp": datetime.datetime.utcnow()
            + datetime.timedelta(minutes=TOKEN_EXPIRE_TIME),
            "iat": datetime.datetime.utcnow(),
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
        response = Response()
        response.data = {"token": token}

        return response


class LogoutView(APIView):
    """
        It does noting as we do not use web cookies (cookies are not available in mobile apps)
        nor we are implementing a allowed/blocked list of tokens
        but it will validate the token and return a 403 if it is invalid
    """
    @auth_token
    def post(self, request):
        response = Response()
        # response.delete_cookie('jwt')
        response.data = {
            # 'message': 'success'
        }
        return response


from django.http import JsonResponse


class UserListView(APIView):
    @auth_token
    def get(self, request):
        """
            get all users
            serialize users
            return json
        """
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return JsonResponse({"User": serializer.data}, safe=False)


class UserView(APIView):
    @auth_token
    def get(self, request):
        user_id = get_user_id_from_request(request)
        user = User.objects.get(pk=user_id)

        return_data = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        }

        return Response(return_data, status=status.HTTP_200_OK)


class UserSessionView(APIView):
    @auth_token
    def get(self, request):
        """
            request body = {}
            return body:
            {
                "sessions": [
                    {
                        "id": 62,
                        "name": "testcreatesession",
                        "recipes": [
                            151
                        ],
                        "num_guests": 3,
                        "session_start_time": "2027-02-08 13: 30"
                        "prep_time": 420,
                        "is_host": true,
                        "highest_rated_recipe": "data:image/gif;base64,..."
                    }
                ]
            }
        """ 
        user_id = get_user_id_from_request(request)
        pairs = UserSession.objects.filter(user_id=user_id)
        return_body = {"sessions": []}
        for pair in pairs:
            is_host = False
            try:
                session = Session.objects.get(pk=pair.session_id)
                if session.host_user_id == user_id:
                    is_host = True
                prep_time = 0
                highest_rate = 0
                highest_recipe_id = 0
                for recipe_id in session.recipes:
                    recipe = Recipe.objects.get(pk=recipe_id)
                    prep_time = prep_time + recipe.cook_time
                    if recipe.rating >= highest_rate:
                        highest_rate = recipe.rating
                        highest_recipe_id = recipe.id
                highest_recipe = Recipe.objects.get(pk=highest_recipe_id)
                is_new = True

                # if the user opened current session before
                if session.opened_users is not None:
                    if user_id in session.opened_users:
                        is_new = False

                ss = {
                    "id": session.id,
                    "name": session.session_name,
                    "recipes": session.recipes,
                    "num_guests": len(session.email_list) + 1,
                    "session_start_time": session.session_start_time,
                    "session_end_time": session.session_end_time,
                    "prep_time": prep_time,
                    "is_host": is_host,
                    "is_new": is_new,
                    "highest_rated_recipe": highest_recipe.image,
                }
                return_body["sessions"].append(ss)
            except:
                # If the session has been deleted, just skip it
                pass
        return Response(return_body, status=status.HTTP_200_OK)
