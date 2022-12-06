################################################################
# accounts/serializers.py                                      #
# Written by: UNSW COMP3900 NewWorld                           #
# Date: 4-Aug-2022                                             #
#                                                              #
# Django Rest Framework serializers.py file for accounts       #
################################################################


from django.contrib.auth.password_validation import validate_password
from requests import request
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .models import User, UserSession


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=True)
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())],  # check uniqueness
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        # Optional password strength validation
        # validators=[validate_password]  # check password strength
    )

    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "email",
            "password",
            "sign_up_date",
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        if password is not None:
            instance.set_password(password)
            instance.name = validated_data.get("name", instance.name)
        instance.save()
        return instance


class UserSessionSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserSession
        fields = [
            "user",
            "session",
        ]
