################################################################
# event_sessions/urls.py                                       #
# Written by: UNSW COMP3900 New World                          #
# Date: 4-Aug-2022                                             #
#                                                              #
# Django Rest Framework urls.py file for even_sessions         #
################################################################


from django.urls import path

from .views import *

urlpatterns = [
    path("compile_list/", CompileListView.as_view()),
    path("create/", CreateSessionView.as_view()),
    path("<int:session_id>/", GetSessionView.as_view()),
    path("code/<str:session_code>/", GetSessionCodeView.as_view()),
    path("<str:session_code>/", GetSessionCodeView.as_view()),
    path("contribute/<str:session_code>/", UpdateIngredientContributionView.as_view()),
    path("code/sync/<str:session_code>/", GetSessionSyncView.as_view()),
]
