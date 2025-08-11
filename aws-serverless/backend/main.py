from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import Response
from routes import (
    auth,
    jobs,
    preferences,
    recommendations,
    google_sheets,
    user,
    contact,
    payment
)
from dotenv import load_dotenv
from mangum import Mangum
import re

load_dotenv()

app = FastAPI()

# This is the handler that AWS Lambda will invoke
handler = Mangum(app)

# Middleware to normalize URL paths
@app.middleware("http")
async def normalize_path(request: Request, call_next):
    # Use regex to replace multiple slashes with a single slash
    # and remove a trailing slash if it's not the root path
    path = request.scope["path"]
    normalized_path = re.sub(r'/+', '/', path)
    if len(normalized_path) > 1 and normalized_path.endswith('/'):
        normalized_path = normalized_path[:-1]
    
    if path != normalized_path:
        request.scope["path"] = normalized_path

    response = await call_next(request)
    return response


origins = [
    "http://localhost",
    "http://localhost:3000",
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
app.include_router(preferences.router, prefix="/preferences", tags=["Preferences"])
app.include_router(google_sheets.router, prefix="/sheets", tags=["Google Sheets"])
app.include_router(user.router, prefix="/user", tags=["User"])
app.include_router(contact.router, tags=["Contact"])
app.include_router(payment.router, prefix="/payment", tags=["Payment"])  # ✅ Payment router


@app.get("/warmup")
async def warmup():
    return {"message": "Backend is warm and ready!"}


@app.get("/")
async def root():
    return {"message": "Welcome to the Tackleit API"}