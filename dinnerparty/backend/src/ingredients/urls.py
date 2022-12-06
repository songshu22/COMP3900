################################################################
# ingredients/url.py                                           #
# Written by: UNSW COMP3900 NewWorld                           #
# Date: 4-Aug-2022                                             #
#                                                              #
# Django Rest Framework url.py file for ingredients            #
################################################################


from django.urls import path

from .views import *

ingredient_list = IngredientViewSet.as_view(
    {
        "get": "list",
    }
)

urlpatterns = [
    path("new/", IngredientNewView.as_view(), name="Add Ingredient"),
    path("", IngredientListView.as_view()),  
]
