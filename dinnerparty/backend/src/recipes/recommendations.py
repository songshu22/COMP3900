################################################################
# recipes/recommendations.py                                   #
# Written by: UNSW COMP3900 NewWorld                           #
# Date: 4-Aug-2022                                             #
#                                                              #
# Recommender system to recommend recipes to users             #
# with item-based collaborative filtering technique            #
################################################################


import numpy as np
from numpy import linalg as LA

from accounts.models import User

from .models import Recipe, RecipeRating


def get_rating_list(recipe_id):
    """
    Return rating list in format [0 0 5 0 4 3 0], entry corresponds to user's rating
    0 if it's not rated by the corresponding user
    """
    rating_dict = {}
    for rating in RecipeRating.objects.filter(recipe_id=recipe_id):
        rating_dict.update({rating.user_id: rating.rating})

    rating_list = []
    for i in range(
        User.objects.order_by("id").first().id, User.objects.order_by("id").last().id
    ):
        if i not in rating_dict:
            rating_list.append(0)
        else:
            rating_list.append(rating_dict[i])
    return rating_list


def item_cosine_similarity(a, b):
    """
    Cosine similarity between two items
    """
    a = get_rating_list(a)
    b = get_rating_list(b)
    return np.dot(a, b) / (LA.norm(a, 2) * LA.norm(b, 2))


def item_PCC(a, b):
    """
    Pearson Correlation Coefficient between two items
    """
    a = get_rating_list(a)
    a = a - np.mean(a)
    b = get_rating_list(b)
    b = b - np.mean(b)
    return np.dot(a, b) / (LA.norm(a, 2) * LA.norm(b, 2))


def pred(user_id, recipe_id):
    """
    Predict the item-based collaborative filtering score for given recipe to user
    """
    numerator = 0
    denominator = 0
    user_rated_recipes = RecipeRating.objects.filter(user_id=user_id)

    for recipe in user_rated_recipes:
        if recipe.recipe_id == recipe_id:
            continue
        numerator += recipe.rating * item_PCC(recipe.recipe_id, recipe_id)
        denominator += abs(item_PCC(recipe.recipe_id, recipe_id))

    if denominator == 0:
        return 0

    return numerator / denominator


def get_personalised_recommendation_recipes(user_id):
    """
    Item-based collaborative filtering
    Return: dict{recipe_id: score}
    """
    # Cold_start, no recommendations
    if len(RecipeRating.objects.filter(user_id=user_id)) == 0:
        return {}

    # Calculating the cf_score for the top 100 recommendation_score recipes
    RECOMMENDATION_CHECK_LIMIT = 100
    cf_score_dict = dict()
    for recipe in Recipe.objects.all().order_by("recommendation_score").reverse():
        # Not recommending rated recipes
        if RecipeRating.objects.filter(user_id=user_id, recipe_id=recipe.id).exists():
            continue
        # Recommendation will be based on item-based CF score
        cf_score_dict.update({recipe.id: pred(user_id, recipe.id)})
        if len(cf_score_dict) >= RECOMMENDATION_CHECK_LIMIT:
            break

    cf_score_dict = dict(
        sorted(cf_score_dict.items(), key=lambda x: x[1], reverse=True)
    )

    return cf_score_dict
