"""
Routes for Banco (Bank) module
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.funcionario import TblFuncionarios
from app.schemas.banco import BancoCreate, BancoUpdate, BancoResponse
from app.services.banco_service import BancoService

router = APIRouter(prefix="/bancos", tags=["bancos"])


@router.get("/", response_model=List[BancoResponse], summary="Listar bancos")
async def listar_bancos(
    skip: int = Query(0, ge=0, description="Registros a pular"),
    limit: int = Query(100, ge=1, le=1000, description="Limite de registros"),
    ativos_apenas: bool = Query(True, description="Apenas bancos ativos"),
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Lista todos os bancos com filtros opcionais
    """
    service = BancoService(db)
    bancos = service.list_bancos(skip=skip, limit=limit, ativos_apenas=ativos_apenas)
    return [BancoResponse.model_validate(banco) for banco in bancos]


@router.get("/{banco_id}", response_model=BancoResponse, summary="Obter banco por código")
async def obter_banco(
    banco_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Obtém um banco específico pelo código
    """
    service = BancoService(db)
    banco = service.get_banco_by_id(banco_id)
    return BancoResponse.model_validate(banco)


@router.post("/", response_model=BancoResponse, summary="Criar banco", status_code=status.HTTP_201_CREATED)
async def criar_banco(
    banco: BancoCreate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Cria um novo banco
    """
    service = BancoService(db)
    novo_banco = service.create_banco(banco, current_user)
    return BancoResponse.model_validate(novo_banco)


@router.put("/{banco_id}", response_model=BancoResponse, summary="Atualizar banco")
async def atualizar_banco(
    banco_id: int,
    banco: BancoUpdate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Atualiza um banco existente
    """
    service = BancoService(db)
    banco_atualizado = service.update_banco(banco_id, banco, current_user)
    return BancoResponse.model_validate(banco_atualizado)


@router.delete("/{banco_id}", summary="Excluir banco")
async def excluir_banco(
    banco_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Exclui um banco (apenas se não houver contas vinculadas)
    """
    service = BancoService(db)
    service.delete_banco(banco_id, current_user)
    return {"message": f"Banco {banco_id} excluído com sucesso"}