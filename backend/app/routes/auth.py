# from fastapi import APIRouter, HTTPException, Depends
# from typing import Optional
# from ..config import settings
# import jwt
# import requests

# router = APIRouter()

# @router.get("/api/getUserInfo")
# async def get_user_info(token: Optional[str] = None):
#     if not token:
#         raise HTTPException(status_code=401, detail="No token provided")
    
#     try:
#         decoded = jwt.decode(token, settings.CASDOOR_CONFIG["certificate"], algorithms=["RS256"])
#         return decoded
#     except:
#         raise HTTPException(status_code=401, detail="Invalid token")

# @router.post("/api/signin")
# async def sign_in(code: str):
#     token_url = f"{settings.CASDOOR_CONFIG['endpoint']}/api/login/oauth/access_token"
    
#     params = {
#         "client_id": settings.CASDOOR_CONFIG["client_id"],
#         "client_secret": settings.CASDOOR_CONFIG["client_secret"],
#         "grant_type": "authorization_code",
#         "code": code,
#     }
    
#     response = requests.post(token_url, params=params)
#     if response.status_code != 200:
#         raise HTTPException(status_code=400, detail="Failed to get access token")
    
#     return response.json()

###########################################################################################################


# from fastapi import APIRouter, HTTPException, Depends
# from typing import Optional
# from ..config import settings
# from pydantic import BaseModel
# import jwt
# import requests

# router = APIRouter()

# # Define request model
# class SignInRequest(BaseModel):
#     code: str

# @router.get("/api/getUserInfo")
# async def get_user_info(token: Optional[str] = None):
#     if not token:
#         raise HTTPException(status_code=401, detail="No token provided")
    
#     try:
#         decoded = jwt.decode(token, settings.CASDOOR_CONFIG["certificate"], algorithms=["RS256"])
#         return decoded
#     except:
#         raise HTTPException(status_code=401, detail="Invalid token")

# @router.post("/api/signin")
# async def sign_in(request: SignInRequest):
#     token_url = f"{settings.CASDOOR_CONFIG['endpoint']}/api/login/oauth/access_token"
    
#     params = {
#         "client_id": settings.CASDOOR_CONFIG["client_id"],
#         "client_secret": settings.CASDOOR_CONFIG["client_secret"],
#         "grant_type": "authorization_code",
#         "code": request.code,
#         "redirect_uri": "http://localhost:3000/callback"  # Add this if required by Casdoor
#     }
    
#     try:
#         response = requests.post(token_url, params=params)
#         response.raise_for_status()  # This will raise an exception for non-200 status codes
#         return response.json()
#     except requests.RequestException as e:
#         raise HTTPException(status_code=400, detail=f"Failed to get access token: {str(e)}")



from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from ..config import settings
from pydantic import BaseModel
import jwt
import requests
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
router = APIRouter()
router.add_middleware(CORSMiddleware, allow_origins=["*"])

security = HTTPBearer()

class SignInRequest(BaseModel):
    code: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: Optional[int] = None

@router.get("/api/getUserInfo")
async def get_user_info(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
    
    try:
        decoded = jwt.decode(token, settings.CASDOOR_CONFIG["certificate"], algorithms=["RS256"])
        return decoded
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/api/signin", response_model=TokenResponse)
async def sign_in(request: SignInRequest):
    try:
        token_url = f"{settings.CASDOOR_CONFIG['endpoint']}/api/login/oauth/access_token"
        
        params = {
            "client_id": settings.CASDOOR_CONFIG["client_id"],
            "client_secret": settings.CASDOOR_CONFIG["client_secret"],
            "grant_type": "authorization_code",
            "code": request.code,
            "redirect_uri": "http://localhost:3000/callback"  # Make sure this matches your frontend
        }
        
        response = requests.post(token_url, params=params)
        response.raise_for_status()
        
        token_data = response.json()
        return TokenResponse(**token_data)
        
    except requests.RequestException as e:
        print(f"Error details: {str(e)}")  # For debugging
        raise HTTPException(status_code=400, detail=f"Failed to get access token: {str(e)}")