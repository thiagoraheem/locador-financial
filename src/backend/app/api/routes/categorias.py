"""
Rotas para categorias financeiras
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.funcionario import TblFuncionarios
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate, CategoriaResponse
from app.services.categoria_service import CategoriaService

router = APIRouter(prefix="/categorias", tags=["categorias"])

@router.get("/", response_model=List[CategoriaResponse], summary="Listar categorias")
async def listar_categorias(
    skip: int = Query(0, ge=0, description="Registros a pular"),
    limit: int = Query(100, ge=1, le=1000, description="Limite de registros"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo: R, D ou T"),
    ativas_apenas: bool = Query(True, description="Apenas categorias ativas"),
    hierarquica: bool = Query(False, description="Retornar em estrutura hierárquica"),
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Lista todas as categorias com filtros opcionais
    """
    service = CategoriaService(db)
    
    if hierarquica:
        categorias = service.get_categorias_hierarquicas(tipo=tipo, ativas_apenas=ativas_apenas)
    else:
        categorias = service.list_categorias(
            skip=skip, 
            limit=limit, 
            tipo=tipo, 
            ativas_apenas=ativas_apenas
        )
    
    return [CategoriaResponse.from_orm(categoria) for categoria in categorias]

@router.get("/{categoria_id}", response_model=CategoriaResponse, summary="Obter categoria por ID")
async def obter_categoria(
    categoria_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Obtém uma categoria específica pelo ID
    """
    service = CategoriaService(db)
    categoria = service.get_categoria_by_id(categoria_id)
    return CategoriaResponse.from_orm(categoria)

@router.post("/", response_model=CategoriaResponse, summary="Criar categoria", status_code=status.HTTP_201_CREATED)
async def criar_categoria(
    categoria: CategoriaCreate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Cria uma nova categoria
    """
    service = CategoriaService(db)
    nova_categoria = service.create_categoria(categoria, current_user)
    return CategoriaResponse.from_orm(nova_categoria)

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
    service = CategoriaService(db)
    categoria_atualizada = service.update_categoria(categoria_id, categoria, current_user)
    return CategoriaResponse.from_orm(categoria_atualizada)

@router.delete("/{categoria_id}", summary="Excluir categoria")
async def excluir_categoria(
    categoria_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Exclui uma categoria (apenas se não houver lançamentos vinculados)
    """
    service = CategoriaService(db)
    service.delete_categoria(categoria_id, current_user)
    return {"message": f"Categoria {categoria_id} excluída com sucesso"}

@router.patch("/{categoria_id}/ativar", response_model=CategoriaResponse, summary="Ativar categoria")
async def ativar_categoria(
    categoria_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Ativa uma categoria inativa
    """
    service = CategoriaService(db)
    categoria = service.activate_categoria(categoria_id, current_user)
    return CategoriaResponse.from_orm(categoria)

@router.patch("/{categoria_id}/mover", response_model=CategoriaResponse, summary="Mover categoria")
async def mover_categoria(
    categoria_id: int,
    nova_categoria_pai_id: Optional[int] = Query(None, description="Nova categoria pai (null para tornar principal)"),
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Move categoria para outra categoria pai
    """
    service = CategoriaService(db)
    categoria = service.move_categoria(categoria_id, nova_categoria_pai_id, current_user)
    return CategoriaResponse.from_orm(categoria)