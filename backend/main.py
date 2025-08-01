from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

load_dotenv()

app = FastAPI()

origins = ["http://localhost", "http://localhost:3000", "https://jobfinder-frontend-pied.vercel.app"]  # Add your prod domain here later

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

@app.get("/")
async def root():
    return {"message": "Welcome to the Tackleit API"}
