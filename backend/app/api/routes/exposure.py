from fastapi import APIRouter
from app.models.schemas import ExposureRequest, ExposureResponse
from app.engines.exposure_calculator import calculate_exposure

router = APIRouter(prefix="/api/exposure", tags=["Respiratory Dosimetry Engine"])

@router.post("/calculate", response_model=ExposureResponse)
async def calculate_particulate_exposure(req: ExposureRequest):
    return calculate_exposure(req)
