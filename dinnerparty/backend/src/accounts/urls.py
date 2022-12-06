################################################################
# accounts/urls.py                                             #
# Written by: UNSW COMP3900 NewWorld                           #
# Date: 4-Aug-2022                                             #
#                                                              #
# Django Rest Framework urls.py file for accounts              #
################################################################


from django.urls import path

from .views import *

user_list = UserViewSet.as_view(
    {
        "get": "list",
        "post": "create",
    }
)

# user/auth/
urlpatterns = [
    path("list/", user_list, name="user-list"),
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/", LoginView.as_view()),
    path("auth/logout/", LogoutView.as_view()),
    path("auth/users/", UserListView.as_view()),
    path("auth/register/<int:user_id>/", UpdateGhostUserView.as_view()),
    # user/
    path("", UserView.as_view()),
    path("sessions/", UserSessionView.as_view()),
]
