"""
Rotas para dashboard e relatórios
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.funcionario import TblFuncionarios

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/resumo", summary="Resumo financeiro")
async def resumo_financeiro(
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Retorna resumo financeiro com indicadores principais
    """
    # TODO: Implementar indicadores
    return {
        "total_receitas": 0,
        "total_despesas": 0,
        "saldo": 0,
        "contas_a_pagar": 0,
        "contas_a_receber": 0
    }

@router.get("/fluxo-caixa", summary="Fluxo de caixa")
async def fluxo_caixa(
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Retorna dados do fluxo de caixa
    """
    # TODO: Implementar fluxo de caixa
    return {
        "periodo": "2024-01",
        "entradas": [],
        "saidas": [],
        "saldo_final": 0
    }