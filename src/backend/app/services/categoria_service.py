"""
Serviço de Categorias Financeiras
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from fastapi import HTTPException, status

from app.models.categoria import Categoria
from app.models.funcionario import TblFuncionarios
from app.schemas.categoria import (
    CategoriaCreate, 
    CategoriaUpdate, 
    CategoriaResponse
)


class CategoriaService:
    """Serviço para operações com categorias financeiras"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_categoria(self, categoria_create: CategoriaCreate, current_user: TblFuncionarios) -> Categoria:
        """Criar nova categoria com validações"""
        
        # Validações de negócio
        self._validate_categoria_data(categoria_create)
        
        # Verificar se categoria pai existe (se informada)
        if categoria_create.CodCategoriaPai:
            categoria_pai = self.get_categoria_by_id(categoria_create.CodCategoriaPai)
            if not categoria_pai.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Categoria pai está inativa"
                )
        
        # Preparar dados
        categoria_data = categoria_create.dict()
        categoria_data['NomUsuario'] = current_user.Login
        
        # Criar categoria
        categoria = Categoria(**categoria_data)
        
        try:
            self.db.add(categoria)
            self.db.commit()
            self.db.refresh(categoria)
            return categoria
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao criar categoria: {str(e)}"
            )
    
    def get_categoria_by_id(self, categoria_id: int) -> Categoria:
        """Buscar categoria por ID"""
        categoria = self.db.query(Categoria).filter(
            Categoria.CodCategoria == categoria_id
        ).first()
        
        if not categoria:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Categoria com ID {categoria_id} não encontrada"
            )
        
        return categoria
    
    def list_categorias(
        self,
        skip: int = 0,
        limit: int = 100,
        tipo: Optional[str] = None,
        ativas_apenas: bool = True,
        include_subcategorias: bool = True
    ) -> List[Categoria]:
        """Listar categorias com filtros"""
        
        query = self.db.query(Categoria)
        
        # Filtrar por tipo
        if tipo:
            query = query.filter(Categoria.TipoCategoria == tipo)
        
        # Filtrar apenas ativas
        if ativas_apenas:
            query = query.filter(Categoria.FlgAtivo == 'S')
        
        # Se não incluir subcategorias, filtrar apenas categorias principais
        if not include_subcategorias:
            query = query.filter(Categoria.CodCategoriaPai.is_(None))
        
        # Ordenar por nome
        query = query.order_by(Categoria.NomCategoria)
        
        # Aplicar paginação
        return query.offset(skip).limit(limit).all()
    
    def get_categorias_hierarquicas(
        self,
        tipo: Optional[str] = None,
        ativas_apenas: bool = True
    ) -> List[Categoria]:
        """Buscar categorias organizadas hierarquicamente"""
        
        # Buscar categorias principais (sem pai)
        query = self.db.query(Categoria).filter(
            Categoria.CodCategoriaPai.is_(None)
        )
        
        if tipo:
            query = query.filter(Categoria.TipoCategoria == tipo)
        
        if ativas_apenas:
            query = query.filter(Categoria.FlgAtivo == 'S')
        
        categorias_principais = query.order_by(Categoria.NomCategoria).all()
        
        # Para cada categoria principal, carregar suas subcategorias
        for categoria in categorias_principais:
            categoria.subcategorias = self._get_subcategorias(categoria.CodCategoria, ativas_apenas)
        
        return categorias_principais
    
    def update_categoria(
        self, 
        categoria_id: int, 
        categoria_update: CategoriaUpdate, 
        current_user: TblFuncionarios
    ) -> Categoria:
        """Atualizar categoria existente"""
        
        # Buscar categoria
        categoria = self.get_categoria_by_id(categoria_id)
        
        # Preparar dados para atualização
        update_data = categoria_update.dict(exclude_unset=True)
        
        # Validações específicas para atualização
        if update_data:
            self._validate_categoria_update(update_data, categoria)
        
        try:
            # Aplicar alterações
            for key, value in update_data.items():
                setattr(categoria, key, value)
            
            # Atualizar auditoria
            categoria.NomUsuario = current_user.Login
            
            self.db.commit()
            self.db.refresh(categoria)
            return categoria
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao atualizar categoria: {str(e)}"
            )
    
    def delete_categoria(self, categoria_id: int, current_user: TblFuncionarios) -> None:
        """Excluir categoria (exclusão lógica)"""
        
        # Buscar categoria
        categoria = self.get_categoria_by_id(categoria_id)
        
        # Verificar se possui subcategorias ativas
        subcategorias_ativas = self.db.query(Categoria).filter(
            and_(
                Categoria.CodCategoriaPai == categoria_id,
                Categoria.FlgAtivo == 'S'
            )
        ).count()
        
        if subcategorias_ativas > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível excluir categoria que possui subcategorias ativas"
            )
        
        # Verificar se possui lançamentos
        # TODO: Implementar verificação de lançamentos vinculados
        
        try:
            # Exclusão lógica
            categoria.FlgAtivo = 'N'
            categoria.NomUsuario = current_user.Login
            
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao excluir categoria: {str(e)}"
            )
    
    def activate_categoria(self, categoria_id: int, current_user: TblFuncionarios) -> Categoria:
        """Reativar categoria"""
        
        categoria = self.get_categoria_by_id(categoria_id)
        
        # Verificar se categoria pai está ativa (se houver)
        if categoria.CodCategoriaPai:
            categoria_pai = self.get_categoria_by_id(categoria.CodCategoriaPai)
            if not categoria_pai.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Não é possível ativar categoria quando a categoria pai está inativa"
                )
        
        try:
            categoria.FlgAtivo = 'S'
            categoria.NomUsuario = current_user.Login
            
            self.db.commit()
            self.db.refresh(categoria)
            return categoria
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao ativar categoria: {str(e)}"
            )
    
    def move_categoria(
        self, 
        categoria_id: int, 
        nova_categoria_pai_id: Optional[int], 
        current_user: TblFuncionarios
    ) -> Categoria:
        """Mover categoria para outra categoria pai"""
        
        categoria = self.get_categoria_by_id(categoria_id)
        
        # Validar nova categoria pai
        if nova_categoria_pai_id:
            categoria_pai = self.get_categoria_by_id(nova_categoria_pai_id)
            
            # Não pode ser pai de si mesma
            if nova_categoria_pai_id == categoria_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Categoria não pode ser pai de si mesma"
                )
            
            # Não pode criar referência circular
            if self._would_create_circular_reference(categoria_id, nova_categoria_pai_id):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Movimentação criaria referência circular"
                )
            
            # Categoria pai deve estar ativa
            if not categoria_pai.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Categoria pai deve estar ativa"
                )
        
        try:
            categoria.CodCategoriaPai = nova_categoria_pai_id
            categoria.NomUsuario = current_user.Login
            
            self.db.commit()
            self.db.refresh(categoria)
            return categoria
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao mover categoria: {str(e)}"
            )
    
    def _get_subcategorias(self, categoria_pai_id: int, ativas_apenas: bool = True) -> List[Categoria]:
        """Buscar subcategorias de uma categoria"""
        
        query = self.db.query(Categoria).filter(
            Categoria.CodCategoriaPai == categoria_pai_id
        )
        
        if ativas_apenas:
            query = query.filter(Categoria.FlgAtivo == 'S')
        
        subcategorias = query.order_by(Categoria.NomCategoria).all()
        
        # Carregar subcategorias recursivamente
        for subcategoria in subcategorias:
            subcategoria.subcategorias = self._get_subcategorias(subcategoria.CodCategoria, ativas_apenas)
        
        return subcategorias
    
    def _validate_categoria_data(self, categoria_data) -> None:
        """Validações de negócio para categoria"""
        
        # Validar nome
        if not categoria_data.NomCategoria or len(categoria_data.NomCategoria.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nome da categoria é obrigatório"
            )
        
        # Validar tipo
        if categoria_data.TipoCategoria not in ['R', 'D', 'T']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tipo de categoria deve ser 'R' (Receita), 'D' (Despesa) ou 'T' (Transferência)"
            )
        
        # Verificar se nome já existe (mesmo tipo e mesmo pai)
        existing_query = self.db.query(Categoria).filter(
            and_(
                Categoria.NomCategoria.ilike(categoria_data.NomCategoria.strip()),
                Categoria.TipoCategoria == categoria_data.TipoCategoria,
                Categoria.FlgAtivo == 'S'
            )
        )
        
        # Se tem categoria pai, filtrar pelo mesmo pai
        if categoria_data.CodCategoriaPai:
            existing_query = existing_query.filter(
                Categoria.CodCategoriaPai == categoria_data.CodCategoriaPai
            )
        else:
            existing_query = existing_query.filter(
                Categoria.CodCategoriaPai.is_(None)
            )
        
        if existing_query.first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe uma categoria com este nome no mesmo nível hierárquico"
            )
    
    def _validate_categoria_update(self, update_data: dict, categoria: Categoria) -> None:
        """Validações específicas para atualização"""
        
        # Validar nome se está sendo alterado
        if 'NomCategoria' in update_data:
            if not update_data['NomCategoria'] or len(update_data['NomCategoria'].strip()) == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Nome da categoria é obrigatório"
                )
        
        # Validar tipo se está sendo alterado
        if 'TipoCategoria' in update_data:
            if update_data['TipoCategoria'] not in ['R', 'D', 'T']:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Tipo de categoria deve ser 'R', 'D' ou 'T'"
                )
        
        # Se está alterando categoria pai, validar
        if 'CodCategoriaPai' in update_data:
            nova_categoria_pai_id = update_data['CodCategoriaPai']
            
            if nova_categoria_pai_id:
                # Categoria pai deve existir
                categoria_pai = self.get_categoria_by_id(nova_categoria_pai_id)
                
                # Não pode ser pai de si mesma
                if nova_categoria_pai_id == categoria.CodCategoria:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Categoria não pode ser pai de si mesma"
                    )
                
                # Não pode criar referência circular
                if self._would_create_circular_reference(categoria.CodCategoria, nova_categoria_pai_id):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Alteração criaria referência circular"
                    )
    
    def _would_create_circular_reference(self, categoria_id: int, nova_categoria_pai_id: int) -> bool:
        """Verifica se a alteração criaria uma referência circular"""
        
        # Subir na hierarquia da nova categoria pai para verificar se encontra a categoria atual
        current_pai_id = nova_categoria_pai_id
        visited = set()
        
        while current_pai_id and current_pai_id not in visited:
            if current_pai_id == categoria_id:
                return True
            
            visited.add(current_pai_id)
            
            categoria_pai = self.db.query(Categoria).filter(
                Categoria.CodCategoria == current_pai_id
            ).first()
            
            if categoria_pai:
                current_pai_id = categoria_pai.CodCategoriaPai
            else:
                break
        
        return False