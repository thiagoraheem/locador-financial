"""
Rotas para lançamentos financeiros
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.funcionario import TblFuncionarios
from app.schemas.lancamento import (
    LancamentoCreate, 
    LancamentoUpdate, 
    LancamentoResponse, 
    LancamentoFilter,
    LancamentoConfirm,
    LancamentosPaginatedResponse
)
from app.services.lancamento_service import LancamentoService

router = APIRouter(prefix="/lancamentos", tags=["lançamentos"])

@router.get("/", response_model=LancamentosPaginatedResponse, summary="Listar lançamentos")
async def listar_lancamentos(
    skip: int = Query(0, ge=0, description="Registros a pular"),
    limit: int = Query(100, ge=1, le=1000, description="Limite de registros"),
    filtros: LancamentoFilter = Depends(),
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Lista lançamentos com paginação e filtros opcionais
    """
    service = LancamentoService(db)
    return service.list_lancamentos_paginated(skip=skip, limit=limit, filtros=filtros)

@router.get("/{lancamento_id}", response_model=LancamentoResponse, summary="Obter lançamento por ID")
async def obter_lancamento(
    lancamento_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Obtém um lançamento específico pelo ID
    """
    service = LancamentoService(db)
    lancamento = service.get_lancamento_by_id(lancamento_id)
    return LancamentoResponse.from_orm_with_relations(lancamento)

@router.post("/", response_model=LancamentoResponse, summary="Criar lançamento", status_code=status.HTTP_201_CREATED)
async def criar_lancamento(
    lancamento: LancamentoCreate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Cria um novo lançamento financeiro
    """
    service = LancamentoService(db)
    novo_lancamento = service.create_lancamento(lancamento, current_user)
    return LancamentoResponse.from_orm_with_relations(novo_lancamento)

@router.put("/{lancamento_id}", response_model=LancamentoResponse, summary="Atualizar lançamento")
async def atualizar_lancamento(
    lancamento_id: int,
    lancamento: LancamentoUpdate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Atualiza um lançamento existente
    """
    service = LancamentoService(db)
    lancamento_atualizado = service.update_lancamento(lancamento_id, lancamento, current_user)
    return LancamentoResponse.from_orm_with_relations(lancamento_atualizado)

@router.delete("/{lancamento_id}", summary="Excluir lançamento")
async def excluir_lancamento(
    lancamento_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Exclui um lançamento
    """
    service = LancamentoService(db)
    service.delete_lancamento(lancamento_id, current_user)
    return {"message": f"Lançamento {lancamento_id} excluído com sucesso"}

@router.patch("/{lancamento_id}/confirmar", response_model=LancamentoResponse, summary="Confirmar/desconfirmar lançamento")
async def confirmar_lancamento(
    lancamento_id: int,
    confirmacao: LancamentoConfirm,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Confirma ou desconfirma um lançamento
    """
    service = LancamentoService(db)
    
    if confirmacao.confirmar:
        lancamento = service.confirm_lancamento(lancamento_id, current_user)
    else:
        lancamento = service.unconfirm_lancamento(lancamento_id, current_user)
    
    return LancamentoResponse.from_orm_with_relations(lancamento)