################################################################
# ingredients/serializer.py                                    #
# Written by: UNSW COMP3900 NewWorld                           #
# Date: 4-Aug-2022                                             #
#                                                              #
# Django Rest Framework serializer.py file for ingredients     #
################################################################


from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .models import Ingredient


class IngredientSerializer(serializers.ModelSerializer):

    name = serializers.CharField(
        required=True,
        validators=[
            # check uniqueness)
            UniqueValidator(queryset=Ingredient.objects.all())
        ],  
    )

    class Meta:
        model = Ingredient
        fields = [
            "id",
            "creator_user_id",
            "name",
            "unit",
        ]
