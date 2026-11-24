from fastapi import APIRouter, HTTPException
from app.schemas.models import ChatRequest, ChatResponse
from app.services.gemini_service import ask_gemini_assistant

router = APIRouter(prefix="/api/assistant", tags=["AI Assistant"])

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        return await ask_gemini_assistant(
            message=request.message,
            history=request.history or [],
            aqi_data=request.current_aqi,
            prefs=request.user_preferences
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assistant error: {str(e)}")
