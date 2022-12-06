################################################################
# event_sessions/models.py                                     #
# Written by: UNSW COMP3900 NewWorld                           #
# Date: 4-Aug-2022                                             #
#                                                              #
# Django Rest Framework serializers.py file for even_sessions  #
################################################################


from rest_framework import serializers

from .models import Session


class SessionSerializer(serializers.ModelSerializer):
    def validate(self, data):
        """
            validate uniqueness of emails
        """
        if len(data["email_list"]) != len(set(data["email_list"])):
            raise serializers.ValidationError("Duplicate emails have been added.")
        return data

    class Meta:
        model = Session
        fields = [
            "id",
            "session_name",
            "session_date",
            "session_start_time",
            "session_end_time",
            "session_code",
            "contribution_limit_time",
            "recipes",
            "email_list",
            "name_list",
            "ingredient_list",
            "host_user_id",
        ]
