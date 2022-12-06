################################################################
# helper/emails_test.py                                        #
# Written by: UNSW COMP3900 NewWorld                           #
# Date: 4-Aug-2022                                             #
#                                                              #
# Test file to send emails from dinnerparty@gmail.com          #
################################################################


from emails import send_email

session_start_time = "2022-07-21T12:00:00.000Z"
session_end_time = "2022-07-21T13:59:00.000Z"
session_code = "1d4316fe"
host_email = "dinner-party-test-script@test.com"
invitees = [
    host_email,
    "z5254617@unsw.edu.au",
    "z5289988@unsw.edu.au",
    "tomkillingback@gmail.com",
]
send_email(
    session_start_time,
    session_end_time,
    invitees,
    session_code,
    "Bruce",
    host_email,
    "PARTAYYYY",
)
