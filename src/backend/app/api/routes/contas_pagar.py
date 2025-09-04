"""
Placeholder routes for contas a pagar
"""
from fastapi import APIRouter

router = APIRouter(prefix="/contas-pagar", tags=["contas a pagar"])

@router.get("/")
async def listar_contas_pagar():
    """Lista contas a pagar - TODO: Implementar"""
    return {"message": "Contas a pagar - Em desenvolvimento"}

@router.post("/")
async def criar_conta_pagar():
    """Cria conta a pagar - TODO: Implementar"""
    return {"message": "Criar conta a pagar - Em desenvolvimento"}