################################################################
# recipes/models.py                                            #
# Written by: UNSW COMP3900 NewWorld                           #
# Date: 4-Aug-2022                                             #
#                                                              #
# Django Rest Framework models.py file for recipes             #
################################################################


import math

from django.db import models

from accounts.models import User
from ingredients.models import Ingredient


class Recipe(models.Model):
    id = models.AutoField(primary_key=True)
    creator_user_id = models.IntegerField(default=0)
    title = models.CharField(max_length=255, default="")
    cuisine = models.CharField(max_length=255, default="")
    cook_time = models.IntegerField(default=0)
    course = models.CharField(max_length=50, blank=True, default="")
    image = models.CharField(max_length=9999999999, default="")
    steps = models.JSONField(encoder=None, decoder=None)
    tags = models.JSONField(encoder=None, decoder=None)
    ingredients = models.ManyToManyField(Ingredient, through="RecipeIngredient")
    click_count = models.IntegerField(default=0)

    """ non-personalised recommendation_score: Based on Bayesian probability

    Initial Belief: R=2.3
        we assume a default rating is 2.3 
    Initial Belief weight: W=5
        adjustable, depends on the scale of the application,
        we assume a typical item will be rated 5*W ~ 20*W times

    click_count will also be included in the calculation, maximum 2 recommendation_score will
    be added from click_count

    recommendation_score = (W*R + sum_ratings) / (W + num_ratings) + min(alpha*log(click_count+1, B), MAX_CLICK_SCORE)
    """

    R = 2.3
    W = 5
    # B is base for log(click_count)
    # B^2 is the maximum click_count will add to recommendation_score
    B = 20
    MAX_CLICK_SCORE = 2
    # alpha is log(click_count) weight
    ALPHA = 0.5
    recommendation_score = models.FloatField(blank=True, default=2.3)

    def __str__(self):
        return self.title

    @property
    def rating(self):
        """
        Calculates the average rating from the RecipeRating field
        """
        if self.num_ratings == 0:
            return 0
        else:
            return round((self.sum_ratings / self.num_ratings), 1)

    @property
    def num_ratings(self):
        """
        Returns the number of ratings for this recipe
        """
        cnt = 0
        for rating in RecipeRating.objects.filter(recipe=self.id):
            # exclude rating 0, which is unrated
            if rating.rating > 0:
                cnt += 1
        return cnt

    @property
    def sum_ratings(self):
        """
        Returns the sum of all ratings
        """
        return sum(
            rating.rating
            for rating in RecipeRating.objects.filter(recipe=self.id).all()
        )

    # update the recommendation_score when there is a new rating
    def update_recommendation_score(self):
        """
        Updates the recommendation_score based on the average rating
        """
        self.recommendation_score = (self.W * self.R + self.sum_ratings) / (
            self.W + self.num_ratings
        ) + min(
            self.ALPHA * math.log(self.click_count + 1, self.B), self.MAX_CLICK_SCORE
        )
        self.save()
        return self.recommendation_score

    def update_click_count(self):
        """
        increment click_count
        """
        self.click_count += 1
        self.save()
        return self.click_count


class RecipeIngredient(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.SET_NULL, null=True)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.SET_NULL, null=True)
    qty = models.FloatField(default=1.0)

    def __str__(self):
        return (
            f"Recipe: '{self.recipe}' Ingredient: '{self.ingredient}' qty: {self.qty}"
        )


class RecipeRating(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.SET_NULL, null=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    rating = models.FloatField(default=0.0)

    class Meta:
        unique_together = ("recipe", "user")

    def __str__(self):
        return f"Recipe: '{self.recipe}' user: '{self.user.name}' rating: {self.rating}"
