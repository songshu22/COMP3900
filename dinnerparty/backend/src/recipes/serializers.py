################################################################
# recipes/serializer.py                                        #
# Written by: UNSW COMP3900 NewWorld                           #
# Date: 4-Aug-2022                                             #
#                                                              #
# Django Rest Framework serializer.py file for recipes         #
################################################################


from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers

from accounts.models import User

from .models import Recipe, RecipeIngredient, RecipeRating


class CreatableSlugRelatedField(serializers.SlugRelatedField):
    def to_internal_value(self, data):
        try:
            return self.get_queryset().get_or_create(**{self.slug_field: data})[0]
        except ObjectDoesNotExist:
            self.fail("does_not_exist", slug_name=self.slug_field, value=str(data))
        except (TypeError, ValueError):
            self.fail("invalid")


class RecipeIngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeIngredient
        fields = (
            "ingredient",
            "qty",
        )


class RecipeSerializer(serializers.ModelSerializer):

    title = serializers.CharField(required=True)
    ingredients = RecipeIngredientSerializer(source="recipeingredient_set", many=True)

    class Meta:
        model = Recipe
        fields = [
            "id",
            "creator_user_id",
            "title",
            "cuisine",
            "tags",
            "ingredients",
            "steps",
            "rating",
            "cook_time",
            "course",
            "image",
            "click_count",
        ]

    def create(self, validated_data):
        ingredients_data = validated_data.pop("recipeingredient_set")
        recipe = Recipe.objects.create(**validated_data)
        for ingredient_data in ingredients_data:
            RecipeIngredient.objects.create(
                recipe=recipe,
                ingredient=ingredient_data["ingredient"],
                qty=ingredient_data["qty"],
            )
        return recipe

    def update(self, instance, validated_data):
        """       
        modifiable Recipe model attrs:
        title, cuisine, rating, cook_time, course, image
        steps, tags, ingredients
        """
        instance.title = validated_data.get("title", instance.title)
        instance.cuisine = validated_data.get("cuisine", instance.cuisine)
        instance.cook_time = validated_data.get("cook_time", instance.cook_time)
        instance.course = validated_data.get("course", instance.course)
        instance.image = validated_data.get("image", instance.image)
        instance.steps = validated_data.get("steps", instance.steps)
        instance.tags = validated_data.get("tags", instance.tags)
        instance.id = validated_data.get("id", instance.id)

        ingredients_data = validated_data.pop("recipeingredient_set")
        for ingredient_data in ingredients_data:
            RecipeIngredient.objects.filter(recipe=instance.id).delete()
            RecipeIngredient.objects.create(
                recipe=Recipe.objects.get(pk=instance.id),
                ingredient=ingredient_data["ingredient"],
                qty=ingredient_data["qty"],
            )
        instance.save()
        return instance


class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeRating
        fields = ["id", "rating"]

    def create(self, validated_data):

        # Get IDs
        recipe_id = self.context.get("recipe_id")
        user_id = self.context.get("user_id")

        # Get recipe and user object to pair
        recipe = Recipe.objects.get(id=recipe_id)
        user = User.objects.get(id=user_id)

        # Delete the rating if it already exits
        RatingObj = RecipeRating.objects.filter(recipe=recipe_id, user=user_id).delete()

        # Create the object
        RatingObj = RecipeRating.objects.create(
            recipe=recipe, user=user, rating=validated_data["rating"]
        )

        return RatingObj
