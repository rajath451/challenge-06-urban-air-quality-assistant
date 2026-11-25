from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import air_quality, decisions, forecast, indoor, exposure, assistant, transparency, auth, admin, notifications

app = FastAPI(
    title="VayuCoach — AI Environmental Decision Intelligence",
    description="Deterministic Decision Engine & Grounded Gemini AI for Urban Air Quality, HomeBreath Indoor Simulation, Exposure Dosimetry, and Centralized SMTP Notifications",
    version="2.5.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(notifications.router)
app.include_router(air_quality.router)
app.include_router(decisions.router)
app.include_router(forecast.router)
app.include_router(indoor.router)
app.include_router(exposure.router)
app.include_router(assistant.router)
app.include_router(transparency.router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "VayuCoach Environmental Decision Intelligence API",
        "version": "2.5.0",
        "cpcb_naqi": "Active",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "product": "VayuCoach",
        "focus_city": "Mangaluru, Karnataka, India",
        "decision_engine": "Active (CPCB NAQI Standard)",
        "security_auth": "Enabled (JWT & Bcrypt RBAC)",
        "gemini_ready": bool(settings.GEMINI_API_KEY)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
