"""
Service layer for Accounts Receivable module
"""
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc, asc
from fastapi import HTTPException, status

from app.models.accounts_receivable import AccountsReceivable, AccountsReceivablePayment
from app.models.funcionario import TblFuncionarios
from app.models.cliente import Cliente
from app.schemas.conta_receber import (
    AccountsReceivableCreate, 
    AccountsReceivableUpdate, 
    AccountsReceivableResponse,
    AccountsReceivablePaymentCreate,
    AccountsReceivablePaymentUpdate
)


class ContaReceberService:
    """Service for Accounts Receivable operations"""

    def __init__(self, db: Session):
        self.db = db

    def create_conta_receber(self, conta_receber_create: AccountsReceivableCreate, current_user: TblFuncionarios) -> AccountsReceivable:
        """Create new accounts receivable with validations"""
        
        # Validate business rules
        self._validate_conta_receber_data(conta_receber_create)
        
        # Prepare data
        conta_receber_data = conta_receber_create.dict()
        conta_receber_data['NomUsuario'] = current_user.Login
        
        # Create accounts receivable
        conta_receber = AccountsReceivable(**conta_receber_data)
        
        # Update status and overdue days
        conta_receber.update_status()
        
        try:
            self.db.add(conta_receber)
            self.db.commit()
            self.db.refresh(conta_receber)
            return conta_receber
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao criar conta a receber: {str(e)}"
            )

    def get_conta_receber_by_id(self, conta_receber_id: int) -> AccountsReceivable:
        """Get accounts receivable by ID"""
        conta_receber = self.db.query(AccountsReceivable).filter(
            AccountsReceivable.id == conta_receber_id
        ).first()

        if not conta_receber:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conta a receber com ID {conta_receber_id} não encontrada"
            )

        # Add cliente_nome to the response by querying Cliente table
        if conta_receber.cod_cliente:
            cliente = self.db.query(Cliente).filter(Cliente.CodCliente == conta_receber.cod_cliente).first()
            if cliente:
                conta_receber.cliente_nome = cliente.DesCliente
        
        return conta_receber

    def list_contas_receber(
        self,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
        empresa_id: Optional[int] = None,
        cliente_id: Optional[int] = None,
        data_vencimento_inicio: Optional[datetime] = None,
        data_vencimento_fim: Optional[datetime] = None
    ) -> List[AccountsReceivable]:
        """List accounts receivable with filters"""
        
        query = self.db.query(AccountsReceivable)
        
        # Apply filters
        if status:
            query = query.filter(AccountsReceivable.status == status)
        
        if empresa_id:
            query = query.filter(AccountsReceivable.id_company == empresa_id)
        
        if cliente_id:
            query = query.filter(AccountsReceivable.cod_cliente == cliente_id)
        
        if data_vencimento_inicio:
            query = query.filter(AccountsReceivable.due_date >= data_vencimento_inicio)
        
        if data_vencimento_fim:
            query = query.filter(AccountsReceivable.due_date <= data_vencimento_fim)
        
        # Order by due date
        query = query.order_by(AccountsReceivable.due_date)
        
        # Apply pagination
        contas_receber = query.offset(skip).limit(limit).all()
        
        # Add cliente_nome to each record by querying Cliente table
        for conta in contas_receber:
            if conta.cod_cliente:
                cliente = self.db.query(Cliente).filter(Cliente.CodCliente == conta.cod_cliente).first()
                if cliente:
                    conta.cliente_nome = cliente.DesCliente
        
        return contas_receber

    def update_conta_receber(
        self, 
        conta_receber_id: int, 
        conta_receber_update: AccountsReceivableUpdate, 
        current_user: TblFuncionarios
    ) -> AccountsReceivable:
        """Update existing accounts receivable"""
        
        # Get accounts receivable
        conta_receber = self.get_conta_receber_by_id(conta_receber_id)
        
        # Prepare data for update
        update_data = conta_receber_update.dict(exclude_unset=True)
        
        # Validate data if provided
        if update_data:
            self._validate_conta_receber_update(update_data, conta_receber)
        
        try:
            # Apply changes
            for key, value in update_data.items():
                setattr(conta_receber, key, value)
            
            # Update audit fields
            conta_receber.NomUsuario = current_user.Login
            
            # Update status and overdue days
            conta_receber.update_status()
            
            self.db.commit()
            self.db.refresh(conta_receber)
            return conta_receber
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao atualizar conta a receber: {str(e)}"
            )

    def delete_conta_receber(self, conta_receber_id: int, current_user: TblFuncionarios) -> None:
        """Delete accounts receivable (logical deletion)"""
        
        # Get accounts receivable
        conta_receber = self.get_conta_receber_by_id(conta_receber_id)
        
        # Validate if can be deleted
        if conta_receber.Status == 'R':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível excluir conta a receber já recebida"
            )
        
        # Check if has payments
        if len(conta_receber.recebimentos) > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível excluir conta a receber que possui recebimentos"
            )
        
        try:
            # Logical deletion
            conta_receber.Status = 'C'  # Cancelado
            conta_receber.NomUsuario = current_user.Login
            
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao cancelar conta a receber: {str(e)}"
            )

    def receive_conta_receber(
        self, 
        conta_receber_id: int, 
        payment_data: AccountsReceivablePaymentCreate, 
        current_user: TblFuncionarios
    ) -> AccountsReceivable:
        """Register receipt for accounts receivable"""
        
        # Get accounts receivable
        conta_receber = self.get_conta_receber_by_id(conta_receber_id)
        
        # Validate if can be received
        if conta_receber.Status == 'C':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível receber conta a receber cancelada"
            )
        
        # Validate payment data
        if payment_data.ValorRecebido <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valor do recebimento deve ser maior que zero"
            )
        
        # Check if payment would exceed amount due
        if (conta_receber.ValorRecebido + payment_data.ValorRecebido) > conta_receber.Valor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valor do recebimento excede o valor devido"
            )
        
        # Prepare payment data
        payment_dict = payment_data.dict()
        payment_dict['NomUsuario'] = current_user.Login
        
        # Create payment
        payment = AccountsReceivablePayment(**payment_dict)
        
        try:
            # Add payment
            self.db.add(payment)
            
            # Update accounts receivable
            conta_receber.ValorRecebido += payment_data.ValorRecebido
            conta_receber.payment_date = payment_data.DataRecebimento if not conta_receber.payment_date else conta_receber.payment_date
            conta_receber.NomUsuario = current_user.Login
            
            # Update status and overdue days
            conta_receber.update_status()
            
            self.db.commit()
            self.db.refresh(conta_receber)
            return conta_receber
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao registrar recebimento: {str(e)}"
            )

    def update_payment(
        self, 
        payment_id: int, 
        payment_update: AccountsReceivablePaymentUpdate, 
        current_user: TblFuncionarios
    ) -> AccountsReceivablePayment:
        """Update existing payment"""
        
        # Get payment
        payment = self.db.query(AccountsReceivablePayment).filter(
            AccountsReceivablePayment.CodPayment == payment_id
        ).first()
        
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Recebimento com ID {payment_id} não encontrado"
            )
        
        # Get accounts receivable
        conta_receber = self.get_conta_receber_by_id(payment.CodAccountsReceivable)
        
        # Prepare data for update
        update_data = payment_update.dict(exclude_unset=True)
        
        try:
            # Apply changes
            for key, value in update_data.items():
                setattr(payment, key, value)
            
            # Update audit fields
            payment.NomUsuario = current_user.Login
            
            self.db.commit()
            self.db.refresh(payment)
            return payment
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao atualizar recebimento: {str(e)}"
            )

    def delete_payment(self, payment_id: int, current_user: TblFuncionarios) -> None:
        """Delete payment"""
        
        # Get payment
        payment = self.db.query(AccountsReceivablePayment).filter(
            AccountsReceivablePayment.CodPayment == payment_id
        ).first()
        
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Recebimento com ID {payment_id} não encontrado"
            )
        
        # Get accounts receivable
        conta_receber = self.get_conta_receber_by_id(payment.CodAccountsReceivable)
        
        # Validate if can be deleted
        if conta_receber.Status == 'C':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível excluir recebimento de conta a receber cancelada"
            )
        
        try:
            # Remove payment value from accounts receivable
            conta_receber.ValorRecebido -= payment.ValorRecebido
            conta_receber.NomUsuario = current_user.Login
            
            # Update status and overdue days
            conta_receber.update_status()
            
            # Delete payment
            self.db.delete(payment)
            
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao excluir recebimento: {str(e)}"
            )

    def get_total_by_period(
        self, 
        data_inicio: datetime, 
        data_fim: datetime, 
        status: Optional[str] = None
    ) -> Decimal:
        """Calculate total of accounts receivable by period"""
        
        query = self.db.query(AccountsReceivable).filter(
            and_(
                AccountsReceivable.due_date >= data_inicio,
                AccountsReceivable.due_date <= data_fim
            )
        )
        
        if status:
            query = query.filter(AccountsReceivable.status == status)
        
        contas = query.all()
        total = sum(conta.Valor for conta in contas)
        
        return Decimal(str(total))

    def get_overdue_count(self) -> int:
        """Get count of overdue accounts receivable"""
        from datetime import datetime
        
        count = self.db.query(AccountsReceivable).filter(
            and_(
                AccountsReceivable.status == 'V',  # Vencido
                AccountsReceivable.due_date < datetime.now()
            )
        ).count()
        
        return count

    def get_delinquent_count(self) -> int:
        """Get count of delinquent accounts receivable"""
        count = self.db.query(AccountsReceivable).filter(
            AccountsReceivable.flg_protestado == True
        ).count()
        
        return count

    def _validate_conta_receber_data(self, conta_receber_data) -> None:
        """Business validations for accounts receivable"""
        
        # Validate value
        if conta_receber_data.Valor <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valor deve ser maior que zero"
            )
        
        # Validate due date
        if conta_receber_data.DataVencimento < conta_receber_data.DataEmissao:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Data de vencimento deve ser maior ou igual à data de emissão"
            )
        
        # Validate status
        if conta_receber_data.Status not in ['A', 'R', 'V', 'C']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status deve ser 'A' (Aberto), 'R' (Recebido), 'V' (Vencido) ou 'C' (Cancelado)"
            )
        
        # Validate document number if provided
        if conta_receber_data.NumeroDocumento and len(conta_receber_data.NumeroDocumento) > 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Número do documento deve ter no máximo 50 caracteres"
            )

    def _validate_conta_receber_update(self, update_data: dict, conta_receber: AccountsReceivable) -> None:
        """Specific validations for update"""
        
        # Validate value if updating
        if 'Valor' in update_data and update_data['Valor'] <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valor deve ser maior que zero"
            )
        
        # Validate due date if updating
        if 'DataVencimento' in update_data and 'DataEmissao' in update_data:
            if update_data['DataVencimento'] < update_data['DataEmissao']:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Data de vencimento deve ser maior ou igual à data de emissão"
                )
        elif 'DataVencimento' in update_data and conta_receber.DataEmissao:
            if update_data['DataVencimento'] < conta_receber.DataEmissao:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Data de vencimento deve ser maior ou igual à data de emissão"
                )
        elif 'DataEmissao' in update_data and conta_receber.DataVencimento:
            if conta_receber.DataVencimento < update_data['DataEmissao']:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Data de vencimento deve ser maior ou igual à data de emissão"
                )
        
        # Validate status if updating
        if 'Status' in update_data and update_data['Status'] not in ['A', 'R', 'V', 'C']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status deve ser 'A' (Aberto), 'R' (Recebido), 'V' (Vencido) ou 'C' (Cancelado)"
            )