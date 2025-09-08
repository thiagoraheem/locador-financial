"""
Routes for Conta (Bank Account) module
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.funcionario import TblFuncionarios
from app.schemas.conta import ContaCreate, ContaUpdate, ContaResponse
from app.services.conta_service import ContaService

router = APIRouter(prefix="/contas", tags=["contas"])


@router.get("/", response_model=List[ContaResponse], summary="Listar contas")
async def listar_contas(
    skip: int = Query(0, ge=0, description="Registros a pular"),
    limit: int = Query(100, ge=1, le=1000, description="Limite de registros"),
    ativas_apenas: bool = Query(True, description="Apenas contas ativas"),
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Lista todas as contas com filtros opcionais
    """
    service = ContaService(db)
    contas = service.list_contas(skip=skip, limit=limit, ativas_apenas=ativas_apenas)
    return [ContaResponse.from_orm(conta) for conta in contas]


@router.get("/{conta_id}", response_model=ContaResponse, summary="Obter conta por ID")
async def obter_conta(
    conta_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Obtém uma conta específica pelo ID
    """
    service = ContaService(db)
    conta = service.get_conta_by_id(conta_id)
    return ContaResponse.from_orm(conta)


@router.get("/empresa/{empresa_id}", response_model=List[ContaResponse], summary="Listar contas por empresa")
async def listar_contas_por_empresa(
    empresa_id: int,
    ativas_apenas: bool = Query(True, description="Apenas contas ativas"),
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Lista todas as contas de uma empresa específica
    """
    service = ContaService(db)
    contas = service.list_contas_by_empresa(empresa_id=empresa_id, ativas_apenas=ativas_apenas)
    return [ContaResponse.from_orm(conta) for conta in contas]


@router.post("/", response_model=ContaResponse, summary="Criar conta", status_code=status.HTTP_201_CREATED)
async def criar_conta(
    conta: ContaCreate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Cria uma nova conta bancária
    """
    service = ContaService(db)
    nova_conta = service.create_conta(conta, current_user)
    return ContaResponse.from_orm(nova_conta)


@router.put("/{conta_id}", response_model=ContaResponse, summary="Atualizar conta")
async def atualizar_conta(
    conta_id: int,
    conta: ContaUpdate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Atualiza uma conta existente
    """
    service = ContaService(db)
    conta_atualizada = service.update_conta(conta_id, conta, current_user)
    return ContaResponse.from_orm(conta_atualizada)


@router.delete("/{conta_id}", summary="Excluir conta")
async def excluir_conta(
    conta_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Exclui uma conta (apenas se não houver registros relacionados)
    """
    service = ContaService(db)
    service.delete_conta(conta_id, current_user)
    return {"message": f"Conta {conta_id} excluída com sucesso"}