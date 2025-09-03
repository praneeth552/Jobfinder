from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from starlette.responses import Response
from slowapi import _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dependencies import limiter
from routes import (
    auth,
    jobs,
    preferences,
    recommendations,
    google_sheets,
    user,
    contact,
    payment,
    webhooks,
    applications
)
from dotenv import load_dotenv
from mangum import Mangum
import re

load_dotenv()

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# This is the handler that AWS Lambda will invoke
handler = Mangum(app)

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
    "https://jobfinder-frontend-pied.vercel.app",
    "https://main.d1yb9ogprne3f8.amplifyapp.com",
    "http://tackleit.xyz",
    "https://tackleit.xyz",
    "http://www.tackleit.xyz",
    "https://www.tackleit.xyz"
]  # Add your prod domain here later

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(recommendations.router)
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
app.include_router(applications.router, prefix="/jobs", tags=["Jobs"])
app.include_router(preferences.router, prefix="/preferences", tags=["Preferences"])
app.include_router(google_sheets.router, prefix="/sheets", tags=["Google Sheets"])
app.include_router(user.router, prefix="/user", tags=["User"])
app.include_router(contact.router, tags=["Contact"])
app.include_router(payment.router, prefix="/payment", tags=["Payment"])  # ✅ Payment router
app.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])


@app.get("/warmup")
async def warmup():
    return {"message": "Backend is warm and ready!"}


@app.get("/")
async def root():
    return RedirectResponse(url="/docs")
