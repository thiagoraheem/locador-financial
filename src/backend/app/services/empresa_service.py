"""
Service layer for Empresa (Company) module
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status
import re

from app.models.empresa import Empresa
from app.models.funcionario import TblFuncionarios
from app.schemas.empresa import EmpresaCreate, EmpresaUpdate


class EmpresaService:
    """Service for Empresa operations"""

    def __init__(self, db: Session):
        self.db = db

    def create_empresa(self, empresa_create: EmpresaCreate, current_user: TblFuncionarios) -> Empresa:
        """Create new empresa with validations"""

        # Validate CNPJ uniqueness
        self._validate_cnpj_unique(empresa_create.CNPJ)

        # Prepare data
        empresa_data = empresa_create.dict()
        empresa_data['NomUsuario'] = current_user.Login

        # Create empresa
        empresa = Empresa(**empresa_data)

        try:
            self.db.add(empresa)
            self.db.commit()
            self.db.refresh(empresa)
            
            # If this is the first empresa or marked as default, set it as default
            if empresa.FlgPadrao or self._is_first_empresa():
                self._set_as_default_empresa(empresa.CodEmpresa)
            
            return empresa
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao criar empresa: {str(e)}"
            )

    def get_empresa_by_id(self, empresa_id: int) -> Empresa:
        """Get empresa by ID"""
        empresa = self.db.query(Empresa).filter(
            Empresa.CodEmpresa == empresa_id
        ).first()

        if not empresa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Empresa com ID {empresa_id} não encontrada"
            )

        return empresa

    def list_empresas(
        self,
        skip: int = 0,
        limit: int = 100,
        ativas_apenas: bool = True
    ) -> List[Empresa]:
        """List empresas with filters"""
        
        query = self.db.query(Empresa)
        
        # Note: FlgAtivo attribute doesn't exist in Empresa model
        # Removing the filter for now as all empresas in the table are considered active
        # if ativas_apenas:
        #     query = query.filter(Empresa.FlgAtivo == 'S')
        
        # Order by name
        query = query.order_by(Empresa.NomEmpresa)
        
        # Apply pagination
        return query.offset(skip).limit(limit).all()

    def update_empresa(
        self, 
        empresa_id: int, 
        empresa_update: EmpresaUpdate, 
        current_user: TblFuncionarios
    ) -> Empresa:
        """Update existing empresa"""
        
        # Get empresa
        empresa = self.get_empresa_by_id(empresa_id)
        
        # Prepare data for update
        update_data = empresa_update.dict(exclude_unset=True)
        
        # Validate CNPJ if being updated
        if 'CNPJ' in update_data and update_data['CNPJ'] != empresa.CNPJ:
            self._validate_cnpj_unique(update_data['CNPJ'], empresa_id)
        
        try:
            # Apply changes
            for key, value in update_data.items():
                setattr(empresa, key, value)
            
            # Update audit fields
            empresa.NomUsuario = current_user.Login
            
            # Handle default empresa logic
            if 'FlgPadrao' in update_data and update_data['FlgPadrao']:
                self._set_as_default_empresa(empresa_id)
            
            self.db.commit()
            self.db.refresh(empresa)
            return empresa
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao atualizar empresa: {str(e)}"
            )

    def delete_empresa(self, empresa_id: int, current_user: TblFuncionarios) -> None:
        """Delete empresa (physical deletion)"""
        
        empresa = self.get_empresa_by_id(empresa_id)
        
        # Check if empresa has related records
        if self._has_related_records(empresa_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível excluir empresa que possui registros relacionados"
            )
        
        try:
            # Physical deletion since FlgAtivo doesn't exist in model
            self.db.delete(empresa)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao excluir empresa: {str(e)}"
            )

    def _validate_cnpj_unique(self, cnpj: str, exclude_id: Optional[int] = None) -> None:
        """Validate CNPJ uniqueness"""
        
        # Clean CNPJ
        cnpj_digits = re.sub(r'\D', '', cnpj)
        
        query = self.db.query(Empresa).filter(
            Empresa.CNPJ == cnpj_digits
        )
        
        # Exclude current empresa if updating
        if exclude_id:
            query = query.filter(Empresa.CodEmpresa != exclude_id)
        
        if query.first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe uma empresa com este CNPJ"
            )

    def _is_first_empresa(self) -> bool:
        """Check if this is the first empresa"""
        count = self.db.query(Empresa).count()
        return count == 0

    def _set_as_default_empresa(self, empresa_id: int) -> None:
        """Set empresa as default and unset others"""
        
        # Unset all other empresas as default
        self.db.query(Empresa).filter(
            Empresa.CodEmpresa != empresa_id
        ).update({Empresa.FlgPadrao: False})
        
        # Set this empresa as default
        self.db.query(Empresa).filter(
            Empresa.CodEmpresa == empresa_id
        ).update({Empresa.FlgPadrao: True})
        
        self.db.commit()

    def _has_related_records(self, empresa_id: int) -> bool:
        """Check if empresa has related records"""
        # TODO: Implement check for related records (contas, lancamentos, etc.)
        # For now, we'll return False to allow deletion
        return False