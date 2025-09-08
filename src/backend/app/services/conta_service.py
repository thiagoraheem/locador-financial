"""
Service layer for Conta (Bank Account) module
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status
from decimal import Decimal

from app.models.conta import Conta
from app.models.empresa import Empresa
from app.models.banco import Banco
from app.models.funcionario import TblFuncionarios
from app.schemas.conta import ContaCreate, ContaUpdate


class ContaService:
    """Service for Conta operations"""

    def __init__(self, db: Session):
        self.db = db

    def create_conta(self, conta_create: ContaCreate, current_user: TblFuncionarios) -> Conta:
        """Create new conta with validations"""

        # Validate empresa exists and is active
        empresa = self._validate_empresa_exists(conta_create.CodEmpresa)

        # Validate banco exists and is active
        banco = self._validate_banco_exists(conta_create.Banco)

        # Validate unique conta per empresa/banco/agencia
        self._validate_conta_unique(
            conta_create.CodEmpresa,
            conta_create.Banco,
            conta_create.Agencia,
            conta_create.Conta
        )

        # Prepare data
        conta_data = conta_create.dict()
        conta_data['NomUsuario'] = current_user.Login
        conta_data['Saldo'] = Decimal(str(conta_data.get('Saldo', 0)))

        # Create conta
        conta = Conta(**conta_data)

        try:
            self.db.add(conta)
            self.db.commit()
            self.db.refresh(conta)
            
            # If this is the first conta for empresa or marked as default, set it as default
            if conta.FlgContaPadrao or self._is_first_conta_for_empresa(conta.CodEmpresa):
                self._set_as_default_conta(conta.idConta)
            
            return conta
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao criar conta: {str(e)}"
            )

    def get_conta_by_id(self, conta_id: int) -> Conta:
        """Get conta by ID"""
        conta = self.db.query(Conta).filter(
            Conta.idConta == conta_id
        ).first()

        if not conta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conta com ID {conta_id} não encontrada"
            )

        return conta

    def list_contas(
        self,
        skip: int = 0,
        limit: int = 100,
        ativas_apenas: bool = True
    ) -> List[Conta]:
        """List contas with filters"""
        
        query = self.db.query(Conta)
        
        # Filter only active
        if ativas_apenas:
            query = query.filter(Conta.FlgAtivo == 'S')
        
        # Order by empresa and name
        query = query.order_by(Conta.CodEmpresa, Conta.NomConta)
        
        # Apply pagination
        return query.offset(skip).limit(limit).all()

    def list_contas_by_empresa(
        self,
        empresa_id: int,
        ativas_apenas: bool = True
    ) -> List[Conta]:
        """List contas by empresa"""
        
        query = self.db.query(Conta).filter(
            Conta.CodEmpresa == empresa_id
        )
        
        # Filter only active
        if ativas_apenas:
            query = query.filter(Conta.FlgAtivo == 'S')
        
        # Order by name
        query = query.order_by(Conta.NomConta)
        
        return query.all()

    def update_conta(
        self, 
        conta_id: int, 
        conta_update: ContaUpdate, 
        current_user: TblFuncionarios
    ) -> Conta:
        """Update existing conta"""
        
        # Get conta
        conta = self.get_conta_by_id(conta_id)
        
        # Prepare data for update
        update_data = conta_update.dict(exclude_unset=True)
        
        # Validate empresa if being updated
        if 'CodEmpresa' in update_data and update_data['CodEmpresa'] != conta.CodEmpresa:
            self._validate_empresa_exists(update_data['CodEmpresa'])
        
        # Validate banco if being updated
        if 'Banco' in update_data and update_data['Banco'] != conta.Banco:
            self._validate_banco_exists(update_data['Banco'])
        
        # Validate unique conta if key fields are being updated
        if any(field in update_data for field in ['CodEmpresa', 'Banco', 'Agencia', 'Conta']):
            empresa_id = update_data.get('CodEmpresa', conta.CodEmpresa)
            banco_id = update_data.get('Banco', conta.Banco)
            agencia = update_data.get('Agencia', conta.Agencia)
            conta_num = update_data.get('Conta', conta.Conta)
            
            self._validate_conta_unique(empresa_id, banco_id, agencia, conta_num, conta_id)
        
        try:
            # Apply changes
            for key, value in update_data.items():
                if key == 'Saldo':
                    setattr(conta, key, Decimal(str(value)))
                else:
                    setattr(conta, key, value)
            
            # Update audit fields
            conta.NomUsuario = current_user.Login
            
            # Handle default conta logic
            if 'FlgContaPadrao' in update_data and update_data['FlgContaPadrao']:
                self._set_as_default_conta(conta_id)
            
            self.db.commit()
            self.db.refresh(conta)
            return conta
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao atualizar conta: {str(e)}"
            )

    def delete_conta(self, conta_id: int, current_user: TblFuncionarios) -> None:
        """Delete conta (logical deletion)"""
        
        conta = self.get_conta_by_id(conta_id)
        
        # Check if conta has related records
        if self._has_related_records(conta_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível excluir conta que possui registros relacionados"
            )
        
        try:
            # Logical deletion
            conta.FlgAtivo = 'N'
            conta.NomUsuario = current_user.Login
            
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao excluir conta: {str(e)}"
            )

    def _validate_empresa_exists(self, empresa_id: int) -> Empresa:
        """Validate empresa exists and is active"""
        empresa = self.db.query(Empresa).filter(
            and_(
                Empresa.CodEmpresa == empresa_id,
                Empresa.FlgAtivo == 'S'
            )
        ).first()
        
        if not empresa:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Empresa com ID {empresa_id} não encontrada ou inativa"
            )
        
        return empresa

    def _validate_banco_exists(self, banco_id: int) -> Banco:
        """Validate banco exists and is active"""
        banco = self.db.query(Banco).filter(
            and_(
                Banco.Codigo == banco_id,
                Banco.FlgAtivo == 'S'
            )
        ).first()
        
        if not banco:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Banco com código {banco_id} não encontrado ou inativo"
            )
        
        return banco

    def _validate_conta_unique(
        self, 
        empresa_id: int, 
        banco_id: int, 
        agencia: str, 
        conta: str, 
        exclude_id: Optional[int] = None
    ) -> None:
        """Validate conta uniqueness per empresa/banco/agencia"""
        
        query = self.db.query(Conta).filter(
            and_(
                Conta.CodEmpresa == empresa_id,
                Conta.Banco == banco_id,
                Conta.Agencia == agencia,
                Conta.Conta == conta,
                Conta.FlgAtivo == 'S'
            )
        )
        
        # Exclude current conta if updating
        if exclude_id:
            query = query.filter(Conta.idConta != exclude_id)
        
        if query.first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe uma conta com esta agência/número para esta empresa e banco"
            )

    def _is_first_conta_for_empresa(self, empresa_id: int) -> bool:
        """Check if this is the first conta for empresa"""
        count = self.db.query(Conta).filter(
            Conta.CodEmpresa == empresa_id
        ).count()
        return count == 0

    def _set_as_default_conta(self, conta_id: int) -> None:
        """Set conta as default and unset others for same empresa"""
        
        # Get empresa for this conta
        conta = self.get_conta_by_id(conta_id)
        
        # Unset all other contas as default for same empresa
        self.db.query(Conta).filter(
            and_(
                Conta.CodEmpresa == conta.CodEmpresa,
                Conta.idConta != conta_id
            )
        ).update({Conta.FlgContaPadrao: False})
        
        # Set this conta as default
        self.db.query(Conta).filter(
            Conta.idConta == conta_id
        ).update({Conta.FlgContaPadrao: True})
        
        self.db.commit()

    def _has_related_records(self, conta_id: int) -> bool:
        """Check if conta has related records"""
        # TODO: Implement check for related records (lancamentos, contas pagar/receber, etc.)
        # For now, we'll return False to allow deletion
        return False