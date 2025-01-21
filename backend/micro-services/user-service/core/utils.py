from django.core.signing import TimestampSigner,BadSignature,SignatureExpired

signer = TimestampSigner()

def generate_signed_token(user_email:str):
    return signer.sign(user_email)

def verify_signed_token(token):
    try:
        return signer.unsign(token, max_age=86400)  # 86400 seconds in a day
    except (BadSignature, SignatureExpired):
        return None