"""
Service layer for Banco (Bank) module
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status

from app.models.banco import Banco
from app.models.funcionario import TblFuncionarios
from app.schemas.banco import BancoCreate, BancoUpdate


class BancoService:
    """Service for Banco operations"""

    def __init__(self, db: Session):
        self.db = db

    def create_banco(self, banco_create: BancoCreate, current_user: TblFuncionarios) -> Banco:
        """Create new banco with validations"""

        # Validate FEBRABAN code
        if not Banco.validate_codigo_febraban(banco_create.Codigo):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Código do banco deve estar entre 1 e 999 (padrão FEBRABAN)"
            )

        # Validate code uniqueness
        self._validate_codigo_unique(banco_create.Codigo)

        # Prepare data
        banco_data = banco_create.dict()
        banco_data['NomUsuario'] = current_user.Login

        # Create banco
        banco = Banco(**banco_data)

        try:
            self.db.add(banco)
            self.db.commit()
            self.db.refresh(banco)
            return banco
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao criar banco: {str(e)}"
            )

    def get_banco_by_id(self, banco_id: int) -> Banco:
        """Get banco by ID"""
        banco = self.db.query(Banco).filter(
            Banco.Codigo == banco_id
        ).first()

        if not banco:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Banco com código {banco_id} não encontrado"
            )

        return banco

    def list_bancos(
        self,
        skip: int = 0,
        limit: int = 100,
        ativos_apenas: bool = True
    ) -> List[Banco]:
        """List bancos with filters"""
        
        query = self.db.query(Banco)
        
        # Filter only active
        if ativos_apenas:
            query = query.filter(Banco.FlgAtivo == 'S')
        
        # Order by code
        query = query.order_by(Banco.Codigo)
        
        # Apply pagination
        return query.offset(skip).limit(limit).all()

    def update_banco(
        self, 
        banco_id: int, 
        banco_update: BancoUpdate, 
        current_user: TblFuncionarios
    ) -> Banco:
        """Update existing banco"""
        
        # Get banco
        banco = self.get_banco_by_id(banco_id)
        
        # Prepare data for update
        update_data = banco_update.dict(exclude_unset=True)
        
        # Validate FEBRABAN code if being updated
        if 'Codigo' in update_data and update_data['Codigo'] != banco.Codigo:
            if not Banco.validate_codigo_febraban(update_data['Codigo']):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Código do banco deve estar entre 1 e 999 (padrão FEBRABAN)"
                )
            self._validate_codigo_unique(update_data['Codigo'], banco_id)
        
        try:
            # Apply changes
            for key, value in update_data.items():
                setattr(banco, key, value)
            
            # Update audit fields
            banco.NomUsuario = current_user.Login
            
            self.db.commit()
            self.db.refresh(banco)
            return banco
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao atualizar banco: {str(e)}"
            )

    def delete_banco(self, banco_id: int, current_user: TblFuncionarios) -> None:
        """Delete banco with restrictions"""
        
        banco = self.get_banco_by_id(banco_id)
        
        # Check if banco has related accounts
        if self._has_related_accounts(banco_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível excluir banco que possui contas vinculadas"
            )
        
        try:
            # Logical deletion
            banco.FlgAtivo = 'N'
            banco.NomUsuario = current_user.Login
            
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao excluir banco: {str(e)}"
            )

    def _validate_codigo_unique(self, codigo: int, exclude_id: Optional[int] = None) -> None:
        """Validate banco code uniqueness"""
        
        query = self.db.query(Banco).filter(
            and_(
                Banco.Codigo == codigo,
                Banco.FlgAtivo == 'S'
            )
        )
        
        # Exclude current banco if updating
        if exclude_id:
            query = query.filter(Banco.Codigo != exclude_id)
        
        if query.first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe um banco com este código"
            )

    def _has_related_accounts(self, banco_id: int) -> bool:
        """Check if banco has related accounts"""
        # Check if any active conta references this banco
        from app.models.conta import Conta
        count = self.db.query(Conta).filter(
            and_(
                Conta.Banco == banco_id,
                Conta.FlgAtivo == 'S'
            )
        ).count()
        return count > 0