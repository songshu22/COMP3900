###########################################################################################
# helper/emails.py                                                                        #
# Written by: UNSW COMP3900 NewWorld                                                      #
# Date: 4-Aug-2022                                                                        #
#                                                                                         #
# Solution amended from:                                                                  #
#   https://stackoverflow.com/questions/4823574/sending-meeting-invitations-with-python   #
#                                                                                         #
# Functions to send email invitations from dinnerparty@gmail.com                          #
###########################################################################################


import logging
import re
import smtplib
from datetime import datetime, timedelta
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate


def to_dt(iso_datetime_str):
    return datetime.strptime(iso_datetime_str, "%Y-%m-%dT%H:%M:%S.%fZ")


def adj_str_tz(iso_datetime_str):
    return iso_datetime_str + timedelta(hours=10)


def check_email_format(email):
    if re.fullmatch(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", email):
        return True
    else:
        return False


def send_email(
    session_start_time,
    session_end_time,
    session_invitees,
    session_code,
    host_name,
    host_email,
    session_name,
):
    CRLF = "\r\n"
    GMAIL_LOGIN = "dinnerparty3900@gmail.com"
    GMAIL_PASS = "eqmbrdddwmlgduuv"
    REPLY = "DinnerParty <dinnerparty3900@gmail.com>"

    # for recording current time
    dtstamp = datetime.now().strftime("%Y%m%dT%H%M%SZ")
    start_dt = to_dt(session_start_time)
    end_dt = to_dt(session_end_time)

    # EMAIL SUBJECT LINE
    description = "DESCRIPTION: You have been invited to attend "
    description += session_name
    description += ". Please enter with code: "
    description += session_code.upper()
    description += "."
    description += CRLF

    attendee = ""
    for att in session_invitees:
        attendee += (
            "ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-    PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=TRUE"
            + CRLF
            + " ;CN="
            + att
            + ";X-NUM-GUESTS=0:"
            + CRLF
            + " mailto:"
            + att
            + CRLF
        )

    ical = (
        "BEGIN:VCALENDAR"
        + CRLF
        + "PRODID:pyICSParser"
        + CRLF
        + "VERSION:2.0"
        + CRLF
        + "CALSCALE:GREGORIAN"
        + CRLF
        + "BEGIN:VTIMEZONE"
        + CRLF
        + "TZNAME:AEST"
        + CRLF
        + "END:VTIMEZONE"
        + CRLF
    )
    ical += (
        "METHOD:REQUEST"
        + CRLF
        + "BEGIN:VEVENT"
        + CRLF
        + "DTSTART:"
        + to_dt(session_start_time).strftime("%Y%m%dT%H%M%SZ")
        + CRLF
        + "DTEND:"
        + to_dt(session_end_time).strftime("%Y%m%dT%H%M%SZ")
        + CRLF
        + "DTSTAMP:"
        + dtstamp
        + CRLF
        + "ORGANIZER;CN=organiser:mailto:first"
        + CRLF
        + " @gmail.com"
        + CRLF
    )
    ical += "UID:FIXMEUID" + dtstamp + CRLF
    ical += (
        attendee
        + "CREATED:"
        + dtstamp
        + CRLF
        + description
        + "LAST-MODIFIED:"
        + dtstamp
        + CRLF
        + "LOCATION:"
        + CRLF
        + "SEQUENCE:0"
        + CRLF
        + "STATUS:CONFIRMED"
        + CRLF
    )
    ical += (
        "SUMMARY:"
        + "DinnerParty: "
        + session_name
        + adj_str_tz(to_dt(session_start_time)).strftime(" %d-%m-%Y @ %H:%M")
        + CRLF
        + "TRANSP:OPAQUE"
        + CRLF
        + "END:VEVENT"
        + CRLF
        + "END:VCALENDAR"
        + CRLF
    )

    # EMAIL BODY: add host email and session code
    eml_body = host_name
    eml_body += " has invited you to join "
    eml_body += session_name
    eml_body += " on "
    eml_body += adj_str_tz(start_dt).strftime(" %d-%m-%Y")
    eml_body += " from "
    eml_body += adj_str_tz(start_dt).strftime(" %H:%M to ")
    eml_body += adj_str_tz(end_dt).strftime(" %H:%M")
    eml_body += ". Log in on the DinnerParty app with code: "
    eml_body += session_code
    eml_body += "."

    msg = MIMEMultipart("mixed")
    msg["Reply-To"] = REPLY
    msg["Date"] = formatdate(localtime=True)
    msg["Subject"] = (
        "DinnerParty: "
        + host_name
        + " has invited you to their event "
        + session_name
        + "!"
    )
    msg["From"] = REPLY
    msg["To"] = ",".join(session_invitees)

    part_email = MIMEText(eml_body, "html")
    part_cal = MIMEText(ical, "calendar;method=REQUEST")

    # If a recipient’s email program doesn’t display a HTML email, the recipient will see a usual plain-text version
    msgAlternative = MIMEMultipart("alternative")
    msg.attach(msgAlternative)
    msgAlternative.attach(part_email)
    msgAlternative.attach(part_cal)

    ical_atch = MIMEBase("application/ics", ' ;name="%s"' % ("invite.ics"))
    ical_atch.set_payload(ical)
    encoders.encode_base64(ical_atch)
    ical_atch.add_header(
        "Content-Disposition", 'attachment; filename="%s"' % ("invite.ics")
    )

    eml_atch = MIMEText("", "plain")
    encoders.encode_base64(eml_atch)
    eml_atch.add_header("Content-Transfer-Encoding", "")

    """ 
    Solutions from:
    https://stackoverflow.com/questions/72629958/django-smtplib-smtpauthenticationerror-535-b5-7-8-username-and-password-not
    """
    mailServer = smtplib.SMTP("smtp.gmail.com", 587)
    mailServer.ehlo()
    mailServer.starttls()
    mailServer.ehlo()
    mailServer.login(GMAIL_LOGIN, GMAIL_PASS)
    mailServer.sendmail(REPLY, session_invitees, msg.as_string())
    mailServer.close()

    logging.info("Email successfully sent.")
