################################################################
# accounts/models.py                                           #
# Written by: UNSW COMP3900 NewWorld                           #
# Date: 4-Aug-2022                                             #
#                                                              #
# Django Rest Framework models.py file for accounts            #
################################################################


from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models

from event_sessions.models import Session


class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None):
        """
            Creates and saves a User with the given email, name and password.
        """
        if not email:
            raise ValueError("Users must have an email address")
        if not password:
            raise ValueError("Users must have a password")
        if not name:
            raise ValueError("Users must have a name")

        user = self.model(email=self.normalize_email(email), name=name)

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password):
        user = self.create_user(
            email,
            name,
            password=password,
        )
        user.admin = True
        user.save(using=self._db)
        return user

    def create_ghost_user(self, email):
        """
            Create a ghost user with a given email, setting pass and name to empty strings
        """
        if not email:
            raise ValueError("Users must have an email address")
        user = self.model(
            email=self.normalize_email(email),
            name=None,
            password=None,
            sign_up_date=None,
        )

        # this is a ghost empty string password
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    """UserSession"""
    email = models.EmailField(
        verbose_name="email address",
        max_length=255,
        unique=True,
    )
    name = models.CharField(max_length=255, blank=True, null=True, default="")
    sign_up_date = models.DateTimeField(auto_now_add=True, null=True)
    admin = models.BooleanField(default=False)  # a superuser
    is_staff = True

    session_list = models.ManyToManyField(Session, through="UserSession")

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]  # Email & Password are required by default.

    def get_email(self):
        return self.email

    def get_name(self):
        return self.name

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @property
    def is_admin(self):
        return self.admin

    @property
    def is_ghost(self):
        if (
            (self.check_password("-1"))
            and (self.name == "-1")
            and (self.email is not None)
        ):
            return True
        else:
            return False

    def __str__(self):
        return f"{self.id} Name: {self.name} Email: {self.email}"

    objects = UserManager()

    class Meta:
        indexes = [
            models.Index(
                fields=[
                    "email",
                ]
            )
        ]


class UserSession(models.Model):
    """UserSession model"""
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    session = models.ForeignKey(Session, on_delete=models.SET_NULL, null=True)

    date_invited = models.DateTimeField(auto_now_add=True, null=True)
    is_going = models.CharField(max_length=50, default="tentative")

    class Meta:
        unique_together = (
            "user",
            "session",
        )  #  unique row for user session combination
