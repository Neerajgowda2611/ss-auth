from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth
from .config import settings

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)