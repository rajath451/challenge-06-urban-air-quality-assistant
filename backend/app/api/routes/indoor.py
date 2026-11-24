from fastapi import APIRouter
from app.models.schemas import IndoorSimulationRequest, IndoorSimulationResponse
from app.engines.indoor_simulator import simulate_indoor_air

router = APIRouter(prefix="/api/indoor", tags=["HomeBreath Indoor Air Simulator"])

@router.post("/simulate", response_model=IndoorSimulationResponse)
async def simulate_indoor_environment(req: IndoorSimulationRequest):
    return simulate_indoor_air(req)
