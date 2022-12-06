################################################################
# ingredients/models.py                                        #
# Written by: UNSW COMP3900 NewWorld                           #
# Date: 4-Aug-2022                                             #
#                                                              #
# Django Rest Framework models.py file for ingredients         #
################################################################


from django.db import models


class Ingredient(models.Model):
    id = models.AutoField(primary_key=True)
    creator_user_id = models.IntegerField(default=0)
    name = models.CharField(max_length=255)
    unit = models.CharField(max_length=20)

    def __str__(self):
        return self.name
