"""
Rotas para categorias financeiras
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.funcionario import TblFuncionarios
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate, CategoriaResponse

router = APIRouter(prefix="/categorias", tags=["categorias"])

@router.get("/", response_model=List[CategoriaResponse], summary="Listar categorias")
async def listar_categorias(
    skip: int = Query(0, ge=0, description="Registros a pular"),
    limit: int = Query(100, ge=1, le=1000, description="Limite de registros"),
    tipo: str = Query(None, description="Filtrar por tipo: R, D ou T"),
    ativas_apenas: bool = Query(True, description="Apenas categorias ativas"),
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Lista todas as categorias com filtros opcionais
    """
    # TODO: Implementar service de categorias
    return []

@router.get("/{categoria_id}", response_model=CategoriaResponse, summary="Obter categoria por ID")
async def obter_categoria(
    categoria_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Obtém uma categoria específica pelo ID
    """
    # TODO: Implementar busca por ID
    raise HTTPException(status_code=404, detail="Categoria não encontrada")

@router.post("/", response_model=CategoriaResponse, summary="Criar categoria", status_code=status.HTTP_201_CREATED)
async def criar_categoria(
    categoria: CategoriaCreate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Cria uma nova categoria
    """
    # TODO: Implementar criação de categoria
    pass

@router.put("/{categoria_id}", response_model=CategoriaResponse, summary="Atualizar categoria")
async def atualizar_categoria(
    categoria_id: int,
    categoria: CategoriaUpdate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Atualiza uma categoria existente
    """
    # TODO: Implementar atualização
    pass

@router.delete("/{categoria_id}", summary="Excluir categoria")
async def excluir_categoria(
    categoria_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Exclui uma categoria (apenas se não houver lançamentos vinculados)
    """
    # TODO: Implementar exclusão com validação
    return {"message": f"Categoria {categoria_id} excluída com sucesso"}