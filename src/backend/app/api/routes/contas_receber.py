"""
Rotas para contas a receber
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.funcionario import TblFuncionarios
from app.schemas.conta_receber import (
    AccountsReceivableCreate, 
    AccountsReceivableUpdate, 
    AccountsReceivableResponse,
    AccountsReceivablePaymentCreate,
    AccountsReceivablePaymentUpdate,
    AccountsReceivablePaymentResponse
)
from app.services.conta_receber_service import ContaReceberService

router = APIRouter(prefix="/contas-receber", tags=["contas a receber"])

@router.get("/", response_model=List[AccountsReceivableResponse], summary="Listar contas a receber")
async def listar_contas_receber(
    skip: int = Query(0, ge=0, description="Registros a pular"),
    limit: int = Query(100, ge=1, le=1000, description="Limite de registros"),
    status: Optional[str] = Query(None, description="Filtrar por status: A, R, V, C"),
    empresa_id: Optional[int] = Query(None, description="Filtrar por empresa"),
    cliente_id: Optional[int] = Query(None, description="Filtrar por cliente"),
    data_vencimento_inicio: Optional[datetime] = Query(None, description="Filtrar por data de vencimento (início)"),
    data_vencimento_fim: Optional[datetime] = Query(None, description="Filtrar por data de vencimento (fim)"),
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Lista todas as contas a receber com filtros opcionais
    """
    service = ContaReceberService(db)
    contas = service.list_contas_receber(
        skip=skip,
        limit=limit,
        status=status,
        empresa_id=empresa_id,
        cliente_id=cliente_id,
        data_vencimento_inicio=data_vencimento_inicio,
        data_vencimento_fim=data_vencimento_fim
    )
    return [AccountsReceivableResponse.model_validate(conta) for conta in contas]

@router.get("/{conta_receber_id}", response_model=AccountsReceivableResponse, summary="Obter conta a receber por ID")
async def obter_conta_receber(
    conta_receber_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Obtém uma conta a receber específica pelo ID
    """
    service = ContaReceberService(db)
    conta = service.get_conta_receber_by_id(conta_receber_id)
    return AccountsReceivableResponse.model_validate(conta)

@router.post("/", response_model=AccountsReceivableResponse, summary="Criar conta a receber", status_code=status.HTTP_201_CREATED)
async def criar_conta_receber(
    conta: AccountsReceivableCreate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Cria uma nova conta a receber
    """
    service = ContaReceberService(db)
    nova_conta = service.create_conta_receber(conta, current_user)
    return AccountsReceivableResponse.model_validate(nova_conta)

@router.put("/{conta_receber_id}", response_model=AccountsReceivableResponse, summary="Atualizar conta a receber")
async def atualizar_conta_receber(
    conta_receber_id: int,
    conta: AccountsReceivableUpdate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Atualiza uma conta a receber existente
    """
    service = ContaReceberService(db)
    conta_atualizada = service.update_conta_receber(conta_receber_id, conta, current_user)
    return AccountsReceivableResponse.model_validate(conta_atualizada)

@router.delete("/{conta_receber_id}", summary="Cancelar conta a receber")
async def cancelar_conta_receber(
    conta_receber_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Cancela uma conta a receber (exclusão lógica)
    """
    service = ContaReceberService(db)
    service.delete_conta_receber(conta_receber_id, current_user)
    return {"message": f"Conta a receber {conta_receber_id} cancelada com sucesso"}

@router.post("/{conta_receber_id}/receber", response_model=AccountsReceivableResponse, summary="Registrar recebimento")
async def receber_conta_receber(
    conta_receber_id: int,
    recebimento: AccountsReceivablePaymentCreate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Registra um recebimento para uma conta a receber
    """
    service = ContaReceberService(db)
    conta_atualizada = service.receive_conta_receber(conta_receber_id, recebimento, current_user)
    return AccountsReceivableResponse.model_validate(conta_atualizada)

@router.put("/recebimentos/{payment_id}", response_model=AccountsReceivablePaymentResponse, summary="Atualizar recebimento")
async def atualizar_recebimento(
    payment_id: int,
    recebimento: AccountsReceivablePaymentUpdate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Atualiza um recebimento de conta a receber
    """
    service = ContaReceberService(db)
    recebimento_atualizado = service.update_payment(payment_id, recebimento, current_user)
    return AccountsReceivablePaymentResponse.model_validate(recebimento_atualizado)

@router.delete("/recebimentos/{payment_id}", summary="Excluir recebimento")
async def excluir_recebimento(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Exclui um recebimento de conta a receber
    """
    service = ContaReceberService(db)
    service.delete_payment(payment_id, current_user)
    return {"message": f"Recebimento {payment_id} excluído com sucesso"}