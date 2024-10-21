from fastapi import APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from ..config import settings
from ..utils.jwt_handler import decode_jwt
import requests
import logging
import jwt  # Make sure you're using PyJWT

router = APIRouter()

class SignInRequest(BaseModel):
    code: str

# Use a set to store used authorization codes
used_codes = set()

@router.post("/api/signin")
async def sign_in(request: SignInRequest, response: Response):
    try:
        logging.info(f"Received signin request with code: {request.code}")

        # Check if the code has been used
        if request.code in used_codes:
            logging.error(f"Authorization code has already been used: {request.code}")
            raise HTTPException(status_code=400, detail="Authorization code has already been used")

        token_url = f"{settings.CASDOOR_CONFIG['endpoint']}/api/login/oauth/access_token"
        
        params = {
            "client_id": settings.CASDOOR_CONFIG["client_id"],
            "client_secret": settings.CASDOOR_CONFIG["client_secret"],
            "grant_type": "authorization_code",
            "code": request.code,
            "redirect_uri": "http://localhost:3000/callback"
        }
        
        logging.info(f"Sending request to Casdoor with params: {params}")
        token_response = requests.post(token_url, data=params)
        
        logging.info(f"Received response from Casdoor: Status {token_response.status_code}")
        logging.info(f"Response content: {token_response.text}")
        
        if token_response.status_code != 200:
            error_data = token_response.json()
            logging.error(f"Error response from Casdoor: {error_data}")
            return JSONResponse(
                status_code=400,
                content={"error": error_data.get("error", "Unknown error"),
                        "error_description": error_data.get("error_description", "No description available")}
            )
            
        token_data = token_response.json()
        access_token = token_data.get('access_token')
        
        if not access_token:
            logging.error("No access token received from Casdoor")
            raise HTTPException(status_code=400, detail="No access token received")
        
        # Decode the token to get user info
        try:
            user_info = decode_jwt(access_token)
        except jwt.InvalidTokenError:
            logging.error("Invalid JWT token")
            raise HTTPException(status_code=400, detail="Invalid token")
        
        if not user_info:
            logging.error("Failed to decode JWT token")
            raise HTTPException(status_code=400, detail="Invalid token")
        
        # Set the token in an HTTP-only cookie
        response.set_cookie(
            key="access_token", 
            value=access_token,
            httponly=True,
            secure=True,  # Use this in production with HTTPS
            samesite='lax'
        )
        
        # Mark the code as used
        used_codes.add(request.code)
        
        logging.info("Signin successful, returning user info")
        return JSONResponse(content={"user": user_info})
        
    except Exception as e:
        logging.error(f"Exception in sign_in: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/api/getUserInfo")
async def get_user_info(request: Request):
    token = request.cookies.get("access_token")
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user_info = decode_jwt(token)
    
    if not user_info:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return JSONResponse(content=user_info)

@router.post("/api/signout")
async def sign_out(response: Response):
    response.delete_cookie("access_token")
    return JSONResponse(content={"status": "ok"})