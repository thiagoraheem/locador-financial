"""
Rotas para dashboard e relatórios
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.funcionario import TblFuncionarios
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])



@router.get("/resumo", summary="Resumo financeiro")
async def resumo_financeiro(
    empresa_id: Optional[int] = Query(None, description="Filtrar por empresa"),
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Retorna resumo financeiro com indicadores principais
    """
    service = DashboardService(db)
    return service.get_financial_summary(empresa_id)

@router.get("/fluxo-caixa", summary="Fluxo de caixa")
async def fluxo_caixa(
    months: int = Query(12, description="Número de meses para exibir"),
    empresa_id: Optional[int] = Query(None, description="Filtrar por empresa"),
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Retorna dados do fluxo de caixa
    """
    service = DashboardService(db)
    return service.get_cash_flow(months, empresa_id)

@router.get("/categorias", summary="Resumo por categorias")
async def resumo_categorias(
    tipo: str = Query("E", description="Tipo: E=Receitas, S=Despesas"),
    empresa_id: Optional[int] = Query(None, description="Filtrar por empresa"),
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Retorna resumo financeiro por categorias
    """
    service = DashboardService(db)
    # Convert string to boolean: E=True (Receitas), S=False (Despesas)
    tipo_bool = tipo.upper() == 'E'
    return service.get_category_summary(tipo_bool, empresa_id)

@router.get("/vencimentos", summary="Resumo de vencimentos")
async def resumo_vencimentos(
    empresa_id: Optional[int] = Query(None, description="Filtrar por empresa"),
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Retorna resumo de contas vencidas e inadimplentes
    """
    service = DashboardService(db)
    return service.get_overdue_summary(empresa_id)

@router.get("/favorecidos", summary="Top favorecidos")
async def top_favorecidos(
    tipo: str = Query("S", description="Tipo: E=Receitas, S=Despesas"),
    limit: int = Query(10, description="Número de registros"),
    empresa_id: Optional[int] = Query(None, description="Filtrar por empresa"),
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Retorna os principais favorecidos/clientes por valor
    """
    service = DashboardService(db)
    # Convert string to boolean: E=True (Receitas), S=False (Despesas)
    tipo_bool = tipo.upper() == 'E'
    return service.get_top_favorecidos(tipo_bool, limit, empresa_id)