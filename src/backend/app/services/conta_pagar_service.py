"""
Service layer for Accounts Payable module
"""
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc
from fastapi import HTTPException, status

from app.models.accounts_payable import AccountsPayable, AccountsPayablePayment
from app.models.funcionario import TblFuncionarios
from app.schemas.conta_pagar import (
    AccountsPayableCreate, 
    AccountsPayableUpdate, 
    AccountsPayableResponse,
    AccountsPayablePaymentCreate,
    AccountsPayablePaymentUpdate
)


class ContaPagarService:
    """Service for Accounts Payable operations"""

    def __init__(self, db: Session):
        self.db = db

    def create_conta_pagar(self, conta_pagar_create: AccountsPayableCreate, current_user: TblFuncionarios) -> AccountsPayable:
        """Create new accounts payable with validations"""
        
        # Validate business rules
        self._validate_conta_pagar_data(conta_pagar_create)
        
        # Prepare data
        conta_pagar_data = conta_pagar_create.dict()
        conta_pagar_data['NomUsuario'] = current_user.Login
        
        # Create accounts payable
        conta_pagar = AccountsPayable(**conta_pagar_data)
        
        # Update status based on values
        conta_pagar.update_status()
        
        try:
            self.db.add(conta_pagar)
            self.db.commit()
            self.db.refresh(conta_pagar)
            return conta_pagar
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao criar conta a pagar: {str(e)}"
            )

    def get_conta_pagar_by_id(self, conta_pagar_id: int) -> AccountsPayable:
        """Get accounts payable by ID"""
        conta_pagar = self.db.query(AccountsPayable).filter(
            AccountsPayable.CodAccountsPayable == conta_pagar_id
        ).first()

        if not conta_pagar:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conta a pagar com ID {conta_pagar_id} não encontrada"
            )

        return conta_pagar

    def list_contas_pagar(
        self,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
        empresa_id: Optional[int] = None,
        fornecedor_id: Optional[int] = None,
        data_vencimento_inicio: Optional[datetime] = None,
        data_vencimento_fim: Optional[datetime] = None
    ) -> List[AccountsPayable]:
        """List accounts payable with filters"""
        
        query = self.db.query(AccountsPayable)
        
        # Apply filters
        if status:
            query = query.filter(AccountsPayable.Status == status)
        
        if empresa_id:
            query = query.filter(AccountsPayable.CodEmpresa == empresa_id)
        
        if fornecedor_id:
            query = query.filter(AccountsPayable.CodFornecedor == fornecedor_id)
        
        if data_vencimento_inicio:
            query = query.filter(AccountsPayable.DataVencimento >= data_vencimento_inicio)
        
        if data_vencimento_fim:
            query = query.filter(AccountsPayable.DataVencimento <= data_vencimento_fim)
        
        # Order by due date
        query = query.order_by(AccountsPayable.DataVencimento)
        
        # Apply pagination
        return query.offset(skip).limit(limit).all()

    def update_conta_pagar(
        self, 
        conta_pagar_id: int, 
        conta_pagar_update: AccountsPayableUpdate, 
        current_user: TblFuncionarios
    ) -> AccountsPayable:
        """Update existing accounts payable"""
        
        # Get accounts payable
        conta_pagar = self.get_conta_pagar_by_id(conta_pagar_id)
        
        # Prepare data for update
        update_data = conta_pagar_update.dict(exclude_unset=True)
        
        # Validate data if provided
        if update_data:
            self._validate_conta_pagar_update(update_data, conta_pagar)
        
        try:
            # Apply changes
            for key, value in update_data.items():
                setattr(conta_pagar, key, value)
            
            # Update audit fields
            conta_pagar.NomUsuario = current_user.Login
            
            # Update status based on values
            conta_pagar.update_status()
            
            self.db.commit()
            self.db.refresh(conta_pagar)
            return conta_pagar
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao atualizar conta a pagar: {str(e)}"
            )

    def delete_conta_pagar(self, conta_pagar_id: int, current_user: TblFuncionarios) -> None:
        """Delete accounts payable (logical deletion)"""
        
        # Get accounts payable
        conta_pagar = self.get_conta_pagar_by_id(conta_pagar_id)
        
        # Validate if can be deleted
        if conta_pagar.Status == 'P':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível excluir conta a pagar já paga"
            )
        
        # Check if has payments
        if len(conta_pagar.pagamentos) > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível excluir conta a pagar que possui pagamentos"
            )
        
        try:
            # Logical deletion
            conta_pagar.Status = 'C'  # Cancelado
            conta_pagar.NomUsuario = current_user.Login
            
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao cancelar conta a pagar: {str(e)}"
            )

    def pay_conta_pagar(
        self, 
        conta_pagar_id: int, 
        payment_data: AccountsPayablePaymentCreate, 
        current_user: TblFuncionarios
    ) -> AccountsPayable:
        """Register payment for accounts payable"""
        
        # Get accounts payable
        conta_pagar = self.get_conta_pagar_by_id(conta_pagar_id)
        
        # Validate if can be paid
        if conta_pagar.Status == 'C':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível pagar conta a pagar cancelada"
            )
        
        # Validate payment data
        if payment_data.ValorPago <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valor do pagamento deve ser maior que zero"
            )
        
        # Check if payment would exceed amount due
        if (conta_pagar.ValorPago + payment_data.ValorPago) > conta_pagar.Valor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valor do pagamento excede o valor devido"
            )
        
        # Prepare payment data
        payment_dict = payment_data.dict()
        payment_dict['NomUsuario'] = current_user.Login
        
        # Create payment
        payment = AccountsPayablePayment(**payment_dict)
        
        try:
            # Add payment
            self.db.add(payment)
            
            # Update accounts payable
            conta_pagar.ValorPago += payment_data.ValorPago
            conta_pagar.DataPagamento = payment_data.DataPagamento if not conta_pagar.DataPagamento else conta_pagar.DataPagamento
            conta_pagar.NomUsuario = current_user.Login
            
            # Update status based on values
            conta_pagar.update_status()
            
            self.db.commit()
            self.db.refresh(conta_pagar)
            return conta_pagar
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao registrar pagamento: {str(e)}"
            )

    def update_payment(
        self, 
        payment_id: int, 
        payment_update: AccountsPayablePaymentUpdate, 
        current_user: TblFuncionarios
    ) -> AccountsPayablePayment:
        """Update existing payment"""
        
        # Get payment
        payment = self.db.query(AccountsPayablePayment).filter(
            AccountsPayablePayment.CodPayment == payment_id
        ).first()
        
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pagamento com ID {payment_id} não encontrado"
            )
        
        # Get accounts payable
        conta_pagar = self.get_conta_pagar_by_id(payment.CodAccountsPayable)
        
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
                detail=f"Erro ao atualizar pagamento: {str(e)}"
            )

    def delete_payment(self, payment_id: int, current_user: TblFuncionarios) -> None:
        """Delete payment"""
        
        # Get payment
        payment = self.db.query(AccountsPayablePayment).filter(
            AccountsPayablePayment.CodPayment == payment_id
        ).first()
        
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pagamento com ID {payment_id} não encontrado"
            )
        
        # Get accounts payable
        conta_pagar = self.get_conta_pagar_by_id(payment.CodAccountsPayable)
        
        # Validate if can be deleted
        if conta_pagar.Status == 'C':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível excluir pagamento de conta a pagar cancelada"
            )
        
        try:
            # Remove payment value from accounts payable
            conta_pagar.ValorPago -= payment.ValorPago
            conta_pagar.NomUsuario = current_user.Login
            
            # Update status based on values
            conta_pagar.update_status()
            
            # Delete payment
            self.db.delete(payment)
            
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao excluir pagamento: {str(e)}"
            )

    def get_total_by_period(
        self, 
        data_inicio: datetime, 
        data_fim: datetime, 
        status: Optional[str] = None
    ) -> Decimal:
        """Calculate total of accounts payable by period"""
        
        query = self.db.query(AccountsPayable).filter(
            and_(
                AccountsPayable.DataVencimento >= data_inicio,
                AccountsPayable.DataVencimento <= data_fim
            )
        )
        
        if status:
            query = query.filter(AccountsPayable.Status == status)
        
        contas = query.all()
        total = sum(conta.Valor for conta in contas)
        
        return Decimal(str(total))

    def get_overdue_count(self) -> int:
        """Get count of overdue accounts payable"""
        from datetime import datetime
        
        count = self.db.query(AccountsPayable).filter(
            and_(
                AccountsPayable.Status == 'V',  # Vencido
                AccountsPayable.DataVencimento < datetime.now()
            )
        ).count()
        
        return count

    def _validate_conta_pagar_data(self, conta_pagar_data) -> None:
        """Business validations for accounts payable"""
        
        # Validate value
        if conta_pagar_data.Valor <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valor deve ser maior que zero"
            )
        
        # Validate due date
        if conta_pagar_data.DataVencimento < conta_pagar_data.DataEmissao:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Data de vencimento deve ser maior ou igual à data de emissão"
            )
        
        # Validate status
        if conta_pagar_data.Status not in ['A', 'P', 'V', 'C']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status deve ser 'A' (Aberto), 'P' (Pago), 'V' (Vencido) ou 'C' (Cancelado)"
            )
        
        # Validate document number if provided
        if conta_pagar_data.NumeroDocumento and len(conta_pagar_data.NumeroDocumento) > 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Número do documento deve ter no máximo 50 caracteres"
            )

    def _validate_conta_pagar_update(self, update_data: dict, conta_pagar: AccountsPayable) -> None:
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
        elif 'DataVencimento' in update_data and conta_pagar.DataEmissao:
            if update_data['DataVencimento'] < conta_pagar.DataEmissao:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Data de vencimento deve ser maior ou igual à data de emissão"
                )
        elif 'DataEmissao' in update_data and conta_pagar.DataVencimento:
            if conta_pagar.DataVencimento < update_data['DataEmissao']:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Data de vencimento deve ser maior ou igual à data de emissão"
                )
        
        # Validate status if updating
        if 'Status' in update_data and update_data['Status'] not in ['A', 'P', 'V', 'C']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status deve ser 'A' (Aberto), 'P' (Pago), 'V' (Vencido) ou 'C' (Cancelado)"
            )