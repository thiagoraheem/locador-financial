"""
Routes for Empresa (Company) module
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.funcionario import TblFuncionarios
from app.schemas.empresa import EmpresaCreate, EmpresaUpdate, EmpresaResponse
from app.services.empresa_service import EmpresaService

router = APIRouter(prefix="/empresas", tags=["empresas"])


@router.get("/", response_model=List[EmpresaResponse], summary="Listar empresas")
async def listar_empresas(
    skip: int = Query(0, ge=0, description="Registros a pular"),
    limit: int = Query(100, ge=1, le=1000, description="Limite de registros"),
    ativas_apenas: bool = Query(True, description="Apenas empresas ativas"),
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Lista todas as empresas com filtros opcionais
    """
    service = EmpresaService(db)
    empresas = service.list_empresas(skip=skip, limit=limit, ativas_apenas=ativas_apenas)
    return [EmpresaResponse.from_orm(empresa) for empresa in empresas]


@router.get("/{empresa_id}", response_model=EmpresaResponse, summary="Obter empresa por ID")
async def obter_empresa(
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Obtém uma empresa específica pelo ID
    """
    service = EmpresaService(db)
    empresa = service.get_empresa_by_id(empresa_id)
    return EmpresaResponse.from_orm(empresa)


@router.post("/", response_model=EmpresaResponse, summary="Criar empresa", status_code=status.HTTP_201_CREATED)
async def criar_empresa(
    empresa: EmpresaCreate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Cria uma nova empresa
    """
    service = EmpresaService(db)
    nova_empresa = service.create_empresa(empresa, current_user)
    return EmpresaResponse.from_orm(nova_empresa)


@router.put("/{empresa_id}", response_model=EmpresaResponse, summary="Atualizar empresa")
async def atualizar_empresa(
    empresa_id: int,
    empresa: EmpresaUpdate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Atualiza uma empresa existente
    """
    service = EmpresaService(db)
    empresa_atualizada = service.update_empresa(empresa_id, empresa, current_user)
    return EmpresaResponse.from_orm(empresa_atualizada)


@router.delete("/{empresa_id}", summary="Excluir empresa")
async def excluir_empresa(
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Exclui uma empresa (apenas se não houver registros relacionados)
    """
    service = EmpresaService(db)
    service.delete_empresa(empresa_id, current_user)
    return {"message": f"Empresa {empresa_id} excluída com sucesso"}