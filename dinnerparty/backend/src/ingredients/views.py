################################################################
# ingredients/views.py                                         #
# Written by: UNSW COMP3900 NewWorld                           #
# Date: 4-Aug-2022                                             #
#                                                              #
# Django Rest Framework views.py file for ingredients          #
################################################################


from drf_yasg.utils import swagger_auto_schema
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from helper.auth import auth_token, get_user_id_from_request

from .models import Ingredient
from .serializers import IngredientSerializer


class IngredientViewSet(viewsets.ModelViewSet):
    model = Ingredient
    queryset = Ingredient.objects
    serializer_class = IngredientSerializer


class IngredientNewView(APIView):
    @swagger_auto_schema(request_body=IngredientSerializer)
    @auth_token
    def post(self, request):
        """
        Request body:
        {
            "name": "Salt",
            "unit": "g"
        }
        """
        data = request.data
        data["creator_user_id"] = get_user_id_from_request(request)
        serializer = IngredientSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"ingredient_id": serializer.data["id"]}, status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )


class IngredientListView(APIView):
    def get(self, request):
        """
        Respond body:
        {
            "id": 39,
            "creator_user_id" 23,
            "name": "Salt",
            "unit": "g"
        }
        """
        ingredients = Ingredient.objects.all()
        serializer = IngredientSerializer(ingredients, many=True)
        return Response({"ingredients": serializer.data}, status=status.HTTP_200_OK)
