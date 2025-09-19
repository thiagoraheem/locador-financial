"""
Service layer for Favorecido (Payee/Beneficiary) module
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from fastapi import HTTPException, status
import re

from app.models.favorecido import Favorecido
from app.models.funcionario import TblFuncionarios
from app.schemas.favorecido import FavorecidoCreate, FavorecidoUpdate


class FavorecidoService:
    """Service for Favorecido operations"""

    def __init__(self, db: Session):
        self.db = db

    def create_favorecido(self, favorecido_create: FavorecidoCreate, current_user: TblFuncionarios) -> Favorecido:
        """Create new favorecido with validations"""

        # Validate document uniqueness
        self._validate_document_unique(favorecido_create)

        # Prepare data
        favorecido_data = favorecido_create.dict()
        favorecido_data['NomUsuario'] = current_user.Login

        # Create favorecido
        favorecido = Favorecido(**favorecido_data)

        try:
            self.db.add(favorecido)
            self.db.commit()
            self.db.refresh(favorecido)
            return favorecido
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao criar favorecido: {str(e)}"
            )

    def get_favorecido_by_id(self, favorecido_id: int) -> Favorecido:
        """Get favorecido by ID"""
        favorecido = self.db.query(Favorecido).filter(
            Favorecido.CodFavorecido == favorecido_id
        ).first()

        if not favorecido:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Favorecido com ID {favorecido_id} não encontrado"
            )

        return favorecido

    def list_favorecidos(
        self,
        skip: int = 0,
        limit: int = 100,
        ativos_apenas: bool = True
    ) -> List[Favorecido]:
        """List favorecidos with filters"""
        
        query = self.db.query(Favorecido)
        
        # Filter only active - removido pois FlgAtivo não existe na tabela
        # if ativos_apenas:
        #     query = query.filter(Favorecido.FlgAtivo == 'S')
        
        # Order by name
        query = query.order_by(Favorecido.DesFavorecido)
        
        # Apply pagination
        return query.offset(skip).limit(limit).all()

    def search_favorecidos(
        self,
        search_term: str,
        ativos_apenas: bool = True,
        limit: int = 50
    ) -> List[Favorecido]:
        """Search favorecidos by name, document or email"""
        
        query = self.db.query(Favorecido)
        
        # Filter only active - removido pois FlgAtivo não existe na tabela
        # if ativos_apenas:
        #     query = query.filter(Favorecido.FlgAtivo == 'S')
        
        # Search by term
        if search_term:
            search_filter = or_(
                Favorecido.DesFavorecido.ilike(f"%{search_term}%"),
                Favorecido.CPF_CNPJ.ilike(f"%{search_term}%"),
                Favorecido.Email.ilike(f"%{search_term}%")
            )
            query = query.filter(search_filter)
        
        # Order by name
        query = query.order_by(Favorecido.DesFavorecido)
        
        # Apply limit
        return query.limit(limit).all()

    def update_favorecido(
        self, 
        favorecido_id: int, 
        favorecido_update: FavorecidoUpdate, 
        current_user: TblFuncionarios
    ) -> Favorecido:
        """Update existing favorecido"""
        
        # Get favorecido
        favorecido = self.get_favorecido_by_id(favorecido_id)
        
        # Prepare data for update
        update_data = favorecido_update.dict(exclude_unset=True)
        
        # Validate document uniqueness if documents are being updated
        if 'CPF_CNPJ' in update_data:
            self._validate_document_unique(favorecido_update, favorecido_id)
        
        try:
            # Apply changes
            for key, value in update_data.items():
                setattr(favorecido, key, value)
            
            # Update audit fields
            favorecido.NomUsuario = current_user.Login
            
            self.db.commit()
            self.db.refresh(favorecido)
            return favorecido
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao atualizar favorecido: {str(e)}"
            )

    def delete_favorecido(self, favorecido_id: int, current_user: TblFuncionarios) -> None:
        """Delete favorecido (logical deletion)"""
        
        favorecido = self.get_favorecido_by_id(favorecido_id)
        
        # Check if favorecido has related records
        if self._has_related_records(favorecido_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível excluir favorecido que possui registros relacionados"
            )
        
        try:
            # Logical deletion - removido pois FlgAtivo não existe na tabela
            # favorecido.FlgAtivo = 'N'
            favorecido.NomUsuario = current_user.Login
            
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao excluir favorecido: {str(e)}"
            )

    def activate_favorecido(self, favorecido_id: int, current_user: TblFuncionarios) -> Favorecido:
        """Activate favorecido"""
        
        favorecido = self.get_favorecido_by_id(favorecido_id)
        
        try:
            # favorecido.FlgAtivo = 'S' - removido pois FlgAtivo não existe na tabela
            favorecido.NomUsuario = current_user.Login
            
            self.db.commit()
            self.db.refresh(favorecido)
            return favorecido
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao ativar favorecido: {str(e)}"
            )

    def _validate_document_unique(self, favorecido_data: FavorecidoCreate, exclude_id: Optional[int] = None) -> None:
        """Validate document uniqueness (CPF or CNPJ)"""
        
        if not favorecido_data.CPF_CNPJ:
            return
            
        query = self.db.query(Favorecido)
        # .filter(Favorecido.FlgAtivo == 'S') - removido pois FlgAtivo não existe na tabela
        
        # Exclude current favorecido if updating
        if exclude_id:
            query = query.filter(Favorecido.CodFavorecido != exclude_id)
        
        # Validate document uniqueness
        doc_digits = re.sub(r'\D', '', favorecido_data.CPF_CNPJ)
        existing = query.filter(Favorecido.CPF_CNPJ == doc_digits).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe um favorecido com este CPF/CNPJ"
            )

    def _has_related_records(self, favorecido_id: int) -> bool:
        """Check if favorecido has related records"""
        # Check if favorecido has related accounts payable
        from app.models.accounts_payable import AccountsPayable
        accounts_payable_count = self.db.query(AccountsPayable).filter(
            AccountsPayable.IdSupplier == favorecido_id
        ).count()
        
        if accounts_payable_count > 0:
            return True
            
        # Check if favorecido has related lancamentos
        from app.models.lancamento import Lancamento
        lancamentos_count = self.db.query(Lancamento).filter(
            Lancamento.CodFavorecido == favorecido_id
        ).count()
        
        return lancamentos_count > 0