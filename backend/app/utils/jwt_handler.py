import jwt
from ..config import settings

def decode_jwt(token: str):
    try:
        return jwt.decode(
            token, 
            settings.CASDOOR_CONFIG["certificate"], 
            algorithms=["RS256"]
        )
    except jwt.InvalidTokenError:
        return None