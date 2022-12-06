################################################################
# recipes/views.py                                             #
# Written by: UNSW COMP3900 NewWorld                           #
# Date: 4-Aug-2022                                             #
#                                                              #
# Django Rest Framework views.py file for recipes              #
################################################################


import threading  # for update recommendation tasks

import jwt
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from helper.auth import JWT_SECRET, auth_token, get_user_id_from_request

from .models import Recipe, RecipeIngredient, RecipeRating
from .recommendations import get_personalised_recommendation_recipes
from .serializers import RatingSerializer, RecipeSerializer


class RecipeViewSet(viewsets.ModelViewSet):
    model = Recipe
    queryset = Recipe.objects
    serializer_class = RecipeSerializer


class ContributeView(APIView):
    @swagger_auto_schema(request_body=RecipeSerializer)
    @auth_token
    def post(self, request):
        cache.clear() # clear the cache when new recipe is contributed
        """
        Request body:
        {
            "title": "Multi ingredient 3",
            "cuisine": "Thai",
            "tags": ["good", "hello"],
            "ingredients": [
                {
                    "ingredient": 37,
                    "qty": 2
                },
                {
                    "ingredient": 38,
                    "qty": 10
                }
            ],
            "steps": ["step 1", "step 2", "step 3"],
            "rating": 5.12,
            "cook_time": 69,
            "course": "main",
            "image": "no image data"
        }
        """
        data = request.data
        data["creator_user_id"] = get_user_id_from_request(request)
        serializer = RecipeSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"recipe_id": serializer.data["id"]}, status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )


def build_return_recipe(recipe):
    """
    Build a dictionary to return a recipe dict to frontend
    """
    return {
        "id": recipe.id,
        "title": recipe.title,
        "cuisine": recipe.cuisine,
        "tags": recipe.tags,
        "rating": recipe.rating,
        "cook_time": recipe.cook_time,
        "course": recipe.course,
        "recommendation_score": recipe.recommendation_score,
        "image": recipe.image,
    }


class RecipeListView(APIView):
    @swagger_auto_schema(responses={200: RecipeSerializer(many=True)})
    def get(self, request):
        """        
        Recipe rank: recommended recipes first, sorted by personalised_score,
                     then follow by other recipes sorted by recommendation_score

        Response body:
        {
            "recipes": [
                {
                    "id": 151,
                    "title": "Cooked Books",
                    "cuisine": "western",
                    "tags": [
                        "disgusting"
                    ],
                    "rating": 2,
                    "cook_time": 420,
                    "course": "1",
                    "image": "data:image/gif;base64,...",
                    # "recommendation_score": 0.2,

                    "personalised_score": 4.5, # if user is logged in
                },
            ]
        }

        """
        return_body = {"recipes": []}

        # If token is given, give personalized recommendations
        try:
            user_id = get_user_id_from_request(request)

            cf_score_dict = get_personalised_recommendation_recipes(user_id)

            NUM_RECOMMENDATIONS = 5
            CF_SCORE_THRESHOLD = (
                2.8  # will recommend if CF score is above this threshold
            )

            recommended_recipe_ids = []
            for recipe_id, value in cf_score_dict.items():
                if value < CF_SCORE_THRESHOLD:
                    break

                recipe = Recipe.objects.get(id=recipe_id)
                r = build_return_recipe(recipe)
                r.update({"personalised_score": value})
                return_body["recipes"].append(r)
                recommended_recipe_ids.append(recipe_id)

                # Return only top 5 recommendations
                if len(return_body["recipes"]) >= NUM_RECOMMENDATIONS:
                    break

            recipes = Recipe.objects.all()
            other_recipes = []
            for recipe in recipes:
                if recipe.id not in recommended_recipe_ids:
                    r = build_return_recipe(recipe)
                    other_recipes.append(r)

            other_recipes = sorted(
                other_recipes, key=lambda k: k["recommendation_score"], reverse=True
            )
            return_body["recipes"] += other_recipes

        except:
            recipes = Recipe.objects.all()
            for recipe in recipes:
                r = build_return_recipe(recipe)
                return_body["recipes"].append(r)

            # Sort the return recipe_list by recommendation_score, highest first
            return_body["recipes"] = sorted(
                return_body["recipes"],
                key=lambda k: k["recommendation_score"],
                reverse=True,
            )

        # Delete the recommendation_score field, frontend will not need it
        for recipe in return_body["recipes"]:
            recipe.pop("recommendation_score")
        return Response(return_body, status=status.HTTP_200_OK)


class UpdateView(APIView):
    @auth_token
    def put(self, request):
        cache.clear()
        """
        All fields required even though only updating one field
        request body:
        {
            "id":117,
            "title": "Multitestupdate",
            "cuisine": "Thai",
            "tags": ["hello"],
            "ingredients": [
                {
                    "ingredient": 37,
                    "qty": 4
                }
            ],
            "steps": ["step 1", "step 2"],
            "rating": 5.12,
            "cook_time": 69,
            "course": "main",
            "image": "no image data"
        }
        """

        try:
            recipe = Recipe.objects.get(pk=request.data["id"])
        except Recipe.DoesNotExist:
            return Response(
                {
                    "error": "Hmmm... I wasn't able to find the recipe you want to update. Try again later."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            requestor = get_user_id_from_request(request)
            recipe = Recipe.objects.get(
                pk=request.data["id"], creator_user_id=requestor
            )
        except Recipe.DoesNotExist:
            return Response(
                {
                    "error": "Whoops! You're not allowed to update this recipe, you didn't create it in the first place!"
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = RecipeSerializer(recipe, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"recipe_id": serializer.data["id"]}, status=status.HTTP_200_OK
            )
        return Response(
            {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
        )


class SingleRecipeView(APIView):
    def get(self, request, recipe_id):
        """
        response_body:
        {
            "id": 151,
            "editable": false,
            "title": "Cooked Books",
            "cuisine": "western",
            "tags": [
                "disgusting"
            ],
            "ingredients": [
                {
                    "ingredient": 42,
                    "ingredient_name": "Books",
                    "unit": "ea",
                    "qty": 69.0
                },
                {
                    "ingredient": 43,
                    "ingredient_name": "Fire",
                    "unit": "g",
                    "qty": 1.0
                }
            ],
            "steps": [
                "Get elected",
                "Resign disgracefully",
                "Go to ICAC"
            ],
            "rating": null,
            "cook_time": 420,
            "course": "1",
            "image": "",
            "contributor": "Gladys B"
        """
        try:
            token = request.headers["Authorization"].split(" ")[1]
            payload = jwt.decode(token, JWT_SECRET, algorithm=["HS256"])
            user_id = int(payload["user_id"])
        except Exception:
            user_id = -1

        try:
            recipe = Recipe.objects.get(pk=recipe_id)
        except Recipe.DoesNotExist:
            return Response(
                {
                    "error": "Hmmm... I couldn't get the details of the recipe you're looking for."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        recipe.update_click_count()
        # Update recommendation_score via threading (save response time)
        t = threading.Thread(target=recipe.update_recommendation_score)
        t.setDaemon(True)
        t.start()

        editable = False
        if recipe.creator_user_id == user_id:
            editable = True
        user = User.objects.get(pk=recipe.creator_user_id)
        ingredients_to_return = []
        for ing in recipe.ingredients.all():
            recipe_ingredient_object = RecipeIngredient.objects.get(
                recipe=recipe.id, ingredient=ing.id
            )
            ingredient = {
                "ingredient": ing.id,
                "ingredient_name": ing.name,
                "unit": ing.unit,
                "qty": recipe_ingredient_object.qty,
            }
            ingredients_to_return.append(ingredient)

        # Check if the requesting user has rated this recipe before,
        # if not, or if they're a guest, set the user_rating field to 0
        user_rating = 0
        user_recipe_rating = RecipeRating.objects.filter(
            recipe=recipe_id, user=user_id
        ).first()
        if user_recipe_rating is not None:
            user_rating = user_recipe_rating.rating

        # Sort ingredients
        sorted_list = sorted(ingredients_to_return, key=lambda d: d["ingredient_name"])

        return_body = {
            "id": recipe.id,
            "editable": editable,
            "title": recipe.title,
            "cuisine": recipe.cuisine,
            "tags": recipe.tags,
            "ingredients": sorted_list,
            "steps": recipe.steps,
            "rating": recipe.rating,
            "user_rating": user_rating,
            "cook_time": recipe.cook_time,
            "course": recipe.course,
            "contributor": user.get_name(),
            "image": recipe.image,
        }

        return Response(return_body, status=status.HTTP_200_OK)


class RateRecipeView(APIView):
    @auth_token
    def put(self, request, recipe_id):
        cache.clear()
        """
        Request body:
        {
            rating: int (1-5)
        }
        """
        try:
            if request.data["rating"] not in [0, 1, 2, 3, 4, 5]:
                return Response(
                    {
                        "error": "Whoops! The rating must be a whole number between 0 and 5, inclusive."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except:
            return Response(
                {"error": "Whoops! You must provide a rating!"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get the requesting user from the token
        user_id = get_user_id_from_request(request)

        serializer = RatingSerializer(
            data=request.data,
            context={
                "user_id": user_id,
                "recipe_id": recipe_id,
            },
        )

        if serializer.is_valid():
            serializer.save()

            recipe = Recipe.objects.get(id=recipe_id)
            new_rating = recipe.rating

            # Update recommendation_score via threading (save response time)
            t = threading.Thread(target=recipe.update_recommendation_score)
            t.setDaemon(True)
            t.start()

            return Response({"rating": new_rating})
        else:
            return Response({"error": serializer.error_messages})

    def get(self, request, recipe_id):
        return Response({"rating": Recipe.objects.get(id=recipe_id).rating})
