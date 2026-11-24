from fastapi import APIRouter, HTTPException
from app.models.schemas import AssistantChatRequest, AssistantChatResponse
from app.services.gemini import ask_grounded_assistant

router = APIRouter(prefix="/api/assistant", tags=["Gemini Environmental Copilot"])

@router.post("/chat", response_model=AssistantChatResponse)
async def chat_with_assistant(req: AssistantChatRequest):
    try:
        return await ask_grounded_assistant(
            message=req.message,
            history=req.history or [],
            readings=req.readings,
            loc=req.location
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assistant Error: {str(e)}")
