################################################################
# event_sessions/models.py                                     #
# Written by: UNSW COMP3900 NewWorld                           #
# Date: 4-Aug-2022                                             #
#                                                              #
# Django Rest Framework models.py file for even_sessions       #
################################################################


from django.db import models


class Session(models.Model):
    """Session model"""
    id = models.AutoField(primary_key=True)
    host_user_id = models.IntegerField(default=0, blank=True)

    session_name = models.CharField(max_length=40, blank=True, default="")

    session_date = models.CharField(
        max_length=100, blank=True, default=""
    )  # ISO 8601 str '2020-02-08',
    session_start_time = models.CharField(
        max_length=100, blank=True, default=""
    )  # ISO 8601 str '2020-02-08 09:30'
    session_end_time = models.CharField(max_length=100, blank=True, default="")
    session_code = models.CharField(max_length=100, blank=True, default="")
    contribution_limit_time = models.IntegerField(blank=True, default=0)

    # a list of string: email
    email_list = models.JSONField(encoder=None, decoder=None, blank=True, default=dict)
    # a list of string: name
    name_list = models.JSONField(encoder=None, decoder=None, blank=True, default=dict)
    # a list of integers: recipe_id
    recipes = models.JSONField(
        encoder=None, decoder=None, blank=True, default=dict
    )  # list of integers: recipe_id

    # a list of user_ids who has opened this session
    opened_users = models.JSONField(
        encoder=None, decoder=None, blank=True, default=list
    )

    # a list of dicts
    ingredient_list = models.JSONField(
        encoder=None, decoder=None, blank=True, default=dict
    )
    """
        dict format:
        {
            ingredient_name: '',
            ingredient_id : int,
            qty: int ,
            user_id: int
            unit: str
        }
    """

    # update user_id in ingredient_list by ingredient_id
    def update_ingredient_list(self, ingredient_id, user_id):
        # invalid ingredient_id is handled in the frontend
        for ing in self.ingredient_list:
            if ing["ingredient_id"] == ingredient_id:
                ing["user_id"] = user_id
                break
        self.save()

    class Meta:
        indexes = [
            models.Index(
                fields=[
                    "session_code",
                ]
            )
        ]
