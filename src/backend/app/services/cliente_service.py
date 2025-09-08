"""
Service layer for Cliente (Client) module
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from fastapi import HTTPException, status
import re

from app.models.cliente import Cliente
from app.models.funcionario import TblFuncionarios
from app.schemas.cliente import ClienteCreate, ClienteUpdate


class ClienteService:
    """Service for Cliente operations"""

    def __init__(self, db: Session):
        self.db = db

    def create_cliente(self, cliente_create: ClienteCreate, current_user: TblFuncionarios) -> Cliente:
        """Create new cliente with validations"""

        # Validate document uniqueness
        self._validate_document_unique(cliente_create)

        # Prepare data
        cliente_data = cliente_create.dict()
        cliente_data['NomUsuario'] = current_user.Login

        # Clean document fields based on person type
        if cliente_create.FlgTipoPessoa == 'F':
            # Pessoa Física - clear PJ fields
            cliente_data['CNPJ'] = None
            cliente_data['IE'] = None
            cliente_data['IM'] = None
        else:
            # Pessoa Jurídica - clear PF fields
            cliente_data['CPF'] = None
            cliente_data['RG'] = None

        # Create cliente
        cliente = Cliente(**cliente_data)

        try:
            self.db.add(cliente)
            self.db.commit()
            self.db.refresh(cliente)
            return cliente
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao criar cliente: {str(e)}"
            )

    def get_cliente_by_id(self, cliente_id: int) -> Cliente:
        """Get cliente by ID"""
        cliente = self.db.query(Cliente).filter(
            Cliente.CodCliente == cliente_id
        ).first()

        if not cliente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cliente com ID {cliente_id} não encontrado"
            )

        return cliente

    def list_clientes(
        self,
        skip: int = 0,
        limit: int = 100,
        ativos_apenas: bool = True,
        liberados_apenas: bool = True
    ) -> List[Cliente]:
        """List clientes with filters"""
        
        query = self.db.query(Cliente)
        
        # Filter only active
        if ativos_apenas:
            query = query.filter(Cliente.FlgAtivo == 'S')
        
        # Filter only liberados
        if liberados_apenas:
            query = query.filter(Cliente.FlgLiberado == True)
        
        # Order by name
        query = query.order_by(Cliente.DesCliente)
        
        # Apply pagination
        return query.offset(skip).limit(limit).all()

    def search_clientes(
        self,
        search_term: str,
        ativos_apenas: bool = True,
        liberados_apenas: bool = True,
        limit: int = 50
    ) -> List[Cliente]:
        """Search clientes by name, document or email"""
        
        query = self.db.query(Cliente)
        
        # Filter only active
        if ativos_apenas:
            query = query.filter(Cliente.FlgAtivo == 'S')
        
        # Filter only liberados
        if liberados_apenas:
            query = query.filter(Cliente.FlgLiberado == True)
        
        # Search by term
        if search_term:
            search_filter = or_(
                Cliente.DesCliente.ilike(f"%{search_term}%"),
                Cliente.RazaoSocial.ilike(f"%{search_term}%"),
                Cliente.CPF.ilike(f"%{search_term}%"),
                Cliente.CNPJ.ilike(f"%{search_term}%"),
                Cliente.Email1.ilike(f"%{search_term}%"),
                Cliente.Email2.ilike(f"%{search_term}%")
            )
            query = query.filter(search_filter)
        
        # Order by name
        query = query.order_by(Cliente.DesCliente)
        
        # Apply limit
        return query.limit(limit).all()

    def update_cliente(
        self, 
        cliente_id: int, 
        cliente_update: ClienteUpdate, 
        current_user: TblFuncionarios
    ) -> Cliente:
        """Update existing cliente"""
        
        # Get cliente
        cliente = self.get_cliente_by_id(cliente_id)
        
        # Prepare data for update
        update_data = cliente_update.dict(exclude_unset=True)
        
        # Validate document uniqueness if documents are being updated
        if any(doc_field in update_data for doc_field in ['CPF', 'CNPJ']):
            self._validate_document_unique(cliente_update, cliente_id)
        
        try:
            # Apply changes
            for key, value in update_data.items():
                setattr(cliente, key, value)
            
            # Clean document fields based on person type
            if 'FlgTipoPessoa' in update_data:
                if update_data['FlgTipoPessoa'] == 'F':
                    # Pessoa Física - clear PJ fields
                    cliente.CNPJ = None
                    cliente.IE = None
                    cliente.IM = None
                else:
                    # Pessoa Jurídica - clear PF fields
                    cliente.CPF = None
                    cliente.RG = None
            
            # Update audit fields
            cliente.NomUsuario = current_user.Login
            
            self.db.commit()
            self.db.refresh(cliente)
            return cliente
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao atualizar cliente: {str(e)}"
            )

    def delete_cliente(self, cliente_id: int, current_user: TblFuncionarios) -> None:
        """Delete cliente (logical deletion)"""
        
        cliente = self.get_cliente_by_id(cliente_id)
        
        # Check if cliente has related records
        if self._has_related_records(cliente_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível excluir cliente que possui registros relacionados"
            )
        
        try:
            # Logical deletion
            cliente.FlgAtivo = 'N'
            cliente.NomUsuario = current_user.Login
            
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao excluir cliente: {str(e)}"
            )

    def _validate_document_unique(self, cliente_data: ClienteCreate, exclude_id: Optional[int] = None) -> None:
        """Validate document uniqueness (CPF or CNPJ)"""
        
        query = self.db.query(Cliente).filter(Cliente.FlgAtivo == 'S')
        
        # Exclude current cliente if updating
        if exclude_id:
            query = query.filter(Cliente.CodCliente != exclude_id)
        
        if cliente_data.FlgTipoPessoa == 'F' and cliente_data.CPF:
            # Validate CPF uniqueness for Pessoa Física
            cpf_digits = re.sub(r'\D', '', cliente_data.CPF)
            existing = query.filter(Cliente.CPF == cpf_digits).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Já existe um cliente com este CPF"
                )
        elif cliente_data.FlgTipoPessoa == 'J' and cliente_data.CNPJ:
            # Validate CNPJ uniqueness for Pessoa Jurídica
            cnpj_digits = re.sub(r'\D', '', cliente_data.CNPJ)
            existing = query.filter(Cliente.CNPJ == cnpj_digits).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Já existe um cliente com este CNPJ"
                )

    def _has_related_records(self, cliente_id: int) -> bool:
        """Check if cliente has related records"""
        # TODO: Implement check for related records (contas receber, locações, orçamentos, etc.)
        # For now, we'll return False to allow deletion
        return False