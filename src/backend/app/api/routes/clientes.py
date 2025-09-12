"""
Routes for Cliente (Client) module
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.funcionario import TblFuncionarios
from app.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteResponse
from app.services.cliente_service import ClienteService

router = APIRouter(prefix="/clientes", tags=["clientes"])


@router.get("/", response_model=List[ClienteResponse], summary="Listar clientes")
async def listar_clientes(
    skip: int = Query(0, ge=0, description="Registros a pular"),
    limit: int = Query(100, ge=1, le=1000, description="Limite de registros"),
    ativos_apenas: bool = Query(True, description="Apenas clientes ativos"),
    liberados_apenas: bool = Query(True, description="Apenas clientes liberados"),
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Lista todos os clientes com filtros opcionais
    """
    service = ClienteService(db)
    clientes = service.list_clientes(
        skip=skip, 
        limit=limit, 
        ativos_apenas=ativos_apenas, 
        liberados_apenas=liberados_apenas
    )
    return [ClienteResponse.model_validate(cliente) for cliente in clientes]


@router.get("/search", response_model=List[ClienteResponse], summary="Buscar clientes")
async def buscar_clientes(
    search: str = Query(..., description="Termo de busca (nome, documento, email)"),
    ativos_apenas: bool = Query(True, description="Apenas clientes ativos"),
    liberados_apenas: bool = Query(True, description="Apenas clientes liberados"),
    limit: int = Query(50, le=100, description="Limite de registros"),
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Busca clientes por nome, documento ou email
    """
    service = ClienteService(db)
    clientes = service.search_clientes(
        search_term=search,
        ativos_apenas=ativos_apenas,
        liberados_apenas=liberados_apenas,
        limit=limit
    )
    return [ClienteResponse.from_orm(cliente) for cliente in clientes]


@router.get("/{cliente_id}", response_model=ClienteResponse, summary="Obter cliente por ID")
async def obter_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Obtém um cliente específico pelo ID
    """
    service = ClienteService(db)
    cliente = service.get_cliente_by_id(cliente_id)
    return ClienteResponse.model_validate(cliente)


@router.post("/", response_model=ClienteResponse, summary="Criar cliente", status_code=status.HTTP_201_CREATED)
async def criar_cliente(
    cliente: ClienteCreate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Cria um novo cliente
    """
    service = ClienteService(db)
    novo_cliente = service.create_cliente(cliente, current_user)
    return ClienteResponse.model_validate(novo_cliente)


@router.put("/{cliente_id}", response_model=ClienteResponse, summary="Atualizar cliente")
async def atualizar_cliente(
    cliente_id: int,
    cliente: ClienteUpdate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Atualiza um cliente existente
    """
    service = ClienteService(db)
    cliente_atualizado = service.update_cliente(cliente_id, cliente, current_user)
    return ClienteResponse.model_validate(cliente_atualizado)


@router.delete("/{cliente_id}", summary="Excluir cliente")
async def excluir_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Exclui um cliente (apenas se não houver registros relacionados)
    """
    service = ClienteService(db)
    service.delete_cliente(cliente_id, current_user)
    return {"message": f"Cliente {cliente_id} excluído com sucesso"}