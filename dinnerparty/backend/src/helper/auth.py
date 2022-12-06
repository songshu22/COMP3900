################################################################
# helper/auth.py                                               #
# Written by: UNSW COMP3900 NewWorld                           #
# Date: 4-Aug-2022                                             #
#                                                              #
# Functions to authenticate users using JWT token.             #
# Functions:                                                   #
#     auth_token(): decorator to authenticate users for        #
#                  functions that needs to login               #
#     get_user_id_from_request(): to get user_id from request  #                                  
################################################################


import jwt
from jwt.exceptions import PyJWTError
from rest_framework import status
from rest_framework.response import Response

JWT_SECRET = "New World"

# Token will remain valid for 3 days
TOKEN_EXPIRE_TIME = 4320  # mins


def auth_token(func):
    """
    Decorator to authenticate users for functions that needs to login
    """
    def inner(*args, **kwargs):
        try:
            headers = args[1].headers
        except Exception:
            raise Exception(
                "To use auth_token decorator, you must pass request as the second argument"
            )

        try:
            token = headers["Authorization"].split(" ")[1]
        except:
            return Response(
                {"error": "You need to login."}, status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            jwt.decode(token, JWT_SECRET, algorithm=["HS256"])
        except PyJWTError as e:
            return Response(
                {"error": f"Invalid Token: {e}"}, status=status.HTTP_401_UNAUTHORIZED
            )

        return func(*args, **kwargs)

    return inner


def get_user_id_from_request(request):
    """
    Return user_id from request be decoding JWT token
    """
    try:
        token = request.headers["Authorization"].split(" ")[1]
        payload = jwt.decode(token, JWT_SECRET, algorithm=["HS256"])
        user_id = payload["user_id"]
        return user_id
    except Exception:
        raise Exception("Did you put @auth_token to decorate the functions?")
