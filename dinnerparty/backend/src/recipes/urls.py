################################################################
# recipes/url.py                                               #
# Written by: UNSW COMP3900 NewWorld                           #
# Date: 4-Aug-2022                                             #
#                                                              #
# Django Rest Framework url.py file for recipes                #
################################################################


from django.urls import path

from .views import *

urlpatterns = [
    path("contribute/", ContributeView.as_view()),
    path("update/", UpdateView.as_view()),
    path("", RecipeListView.as_view()),
    path("<int:recipe_id>/", SingleRecipeView.as_view()),
    path("rate/<int:recipe_id>/", RateRecipeView.as_view()),
]
