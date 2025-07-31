import smtplib
from email.mime.text import MIMEText

EMAIL = "your@email.com"
PASSWORD = "rddlxirxqyibnruc"
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

def send_otp_email(to: str, otp: str):
    body = f"Your OTP for password reset is: {otp}"
    msg = MIMEText(body)
    msg["Subject"] = "Password Reset OTP"
    msg["From"] = EMAIL
    msg["To"] = to

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL, PASSWORD)
            server.sendmail(EMAIL, to, msg.as_string())
        return True
    except Exception as e:
        print("Email send failed:", e)
        return False
