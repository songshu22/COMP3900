################################################################
# helper/pass.py                                               #
# Written by: UNSW COMP3900 NewWorld                           #
# Date: 4-Aug-2022                                             #
#                                                              #
# Information to seed email from dinnerparty@gmail.com         #
################################################################


# Default from Antoinette system password
DEFAULT_PASS = "Dinner-Party-3900"
DEVICE_MAIL_PASS = ""


def get_pass():
    input_pass = input("Enter gmail password generated for device:")
    if input_pass and (len(input_pass) == 16):
        DEVICE_MAIL_PASS = input_pass
    else:
        DEVICE_MAIL_PASS = DEFAULT_PASS
