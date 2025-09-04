"""
Placeholder routes for contas a receber
"""
from fastapi import APIRouter

router = APIRouter(prefix="/contas-receber", tags=["contas a receber"])

@router.get("/")
async def listar_contas_receber():
    """Lista contas a receber - TODO: Implementar"""
    return {"message": "Contas a receber - Em desenvolvimento"}

@router.post("/")
async def criar_conta_receber():
    """Cria conta a receber - TODO: Implementar"""
    return {"message": "Criar conta a receber - Em desenvolvimento"}