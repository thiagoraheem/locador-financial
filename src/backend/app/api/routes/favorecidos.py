"""Routes for Favorecido module"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.funcionario import TblFuncionarios
from app.schemas.favorecido import FavorecidoCreate, FavorecidoUpdate, FavorecidoResponse
from app.services.favorecido_service import FavorecidoService

router = APIRouter(prefix="/favorecidos", tags=["favorecidos"])


@router.get("/", response_model=List[FavorecidoResponse], summary="Listar favorecidos")
async def listar_favorecidos(
    skip: int = Query(0, ge=0, description="Registros a pular"),
    limit: int = Query(100, ge=1, le=1000, description="Limite de registros"),
    ativos_apenas: bool = Query(True, description="Apenas favorecidos ativos"),
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Lista todos os favorecidos com filtros opcionais
    """
    service = FavorecidoService(db)
    favorecidos = service.list_favorecidos(
        skip=skip, 
        limit=limit, 
        ativos_apenas=ativos_apenas
    )
    return [FavorecidoResponse.model_validate(favorecido) for favorecido in favorecidos]


@router.get("/search", response_model=List[FavorecidoResponse], summary="Buscar favorecidos")
async def buscar_favorecidos(
    search: str = Query(..., description="Termo de busca (nome, documento, email)"),
    ativos_apenas: bool = Query(True, description="Apenas favorecidos ativos"),
    limit: int = Query(50, le=100, description="Limite de registros"),
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Busca favorecidos por nome, documento ou email
    """
    service = FavorecidoService(db)
    favorecidos = service.buscar_favorecidos(
        termo_busca=search,
        ativos_apenas=ativos_apenas,
        limit=limit
    )
    return [FavorecidoResponse.model_validate(favorecido) for favorecido in favorecidos]


@router.get("/{favorecido_id}", response_model=FavorecidoResponse, summary="Obter favorecido por ID")
async def obter_favorecido(
    favorecido_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Obtém um favorecido específico pelo ID
    """
    service = FavorecidoService(db)
    favorecido = service.buscar_por_id(favorecido_id)
    return FavorecidoResponse.model_validate(favorecido)


@router.post("/", response_model=FavorecidoResponse, summary="Criar favorecido", status_code=status.HTTP_201_CREATED)
async def criar_favorecido(
    favorecido: FavorecidoCreate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Cria um novo favorecido
    """
    service = FavorecidoService(db)
    novo_favorecido = service.criar_favorecido(favorecido, current_user.NomUsuario)
    return FavorecidoResponse.model_validate(novo_favorecido)


@router.put("/{favorecido_id}", response_model=FavorecidoResponse, summary="Atualizar favorecido")
async def atualizar_favorecido(
    favorecido_id: int,
    favorecido: FavorecidoUpdate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Atualiza um favorecido existente
    """
    service = FavorecidoService(db)
    favorecido_atualizado = service.atualizar_favorecido(favorecido_id, favorecido, current_user.NomUsuario)
    return FavorecidoResponse.model_validate(favorecido_atualizado)


@router.delete("/{favorecido_id}", summary="Excluir favorecido")
async def excluir_favorecido(
    favorecido_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Exclui um favorecido (soft delete)
    """
    service = FavorecidoService(db)
    service.deletar_favorecido(favorecido_id, current_user.NomUsuario)
    return {"message": f"Favorecido {favorecido_id} excluído com sucesso"}


@router.patch("/{favorecido_id}/ativar", response_model=FavorecidoResponse, summary="Ativar favorecido")
async def ativar_favorecido(
    favorecido_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Ativa um favorecido previamente desativado
    """
    service = FavorecidoService(db)
    favorecido_ativado = service.ativar_favorecido(favorecido_id, current_user.NomUsuario)
    return FavorecidoResponse.model_validate(favorecido_ativado)