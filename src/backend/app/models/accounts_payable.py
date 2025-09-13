"""
Modelo de Contas a Pagar
"""
from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Boolean, Text, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class AccountsPayable(Base):
    """Modelo para contas a pagar"""
    
    __tablename__ = "tbl_AccountsPayable"

    # Campos principais baseados na estrutura real do banco
    id = Column(Integer, primary_key=True, name='IdAccountsPayable')
    id_company = Column(Integer, name='IdCompany', default=1)
    document_number = Column(String(15), name='DocumentNumber')
    amount = Column(Numeric(19,4), name='Amount', nullable=False)
    issuance_date = Column(Date, name='IssuanceDate', nullable=False)
    due_date = Column(Date, name='DueDate', nullable=False)
    id_cost_center = Column(Integer, ForeignKey('tbl_CostCenters.IdCostCenter'), name='IdCostCenter')
    id_chart_of_accounts = Column(Integer, ForeignKey('tbl_ChartOfAccounts.IdChartOfAccounts'), name='IdChartOfAccounts')
    description = Column(Text, name='Description')
    id_customer = Column(Integer, ForeignKey('tbl_FINFavorecido.CodFavorecido'), name='IdCustomer')
    payment_date = Column(Date, name='PaymentDate')
    paid_amount = Column(Numeric(19,4), name='PaidAmount')
    installment = Column(Integer, name='Installment')
    total_installments = Column(Integer, name='TotalInstallments')
    fine_amount = Column(Numeric(19,4), name='FineAmount')
    interest_amount = Column(Numeric(19,4), name='InterestAmount')
    discount_amount = Column(Numeric(19,4), name='DiscountAmount')
    id_bank_account = Column(Integer, ForeignKey('tbl_Conta.idConta'), name='IdBankAccount')
    id_payment_method = Column(Integer, ForeignKey('tbl_FINFormaPagamento.CodFormaPagto'), name='IdPaymentMethod')
    id_parent_accounts_payable = Column(Integer, name='IdParentAccountsPayable')
    id_installment_type = Column(Integer, name='IdInstallmentType', default=0)
    id_user_create = Column(Integer, name='IdUserCreate', nullable=False)
    id_user_alter = Column(Integer, name='IdUserAlter')
    date_create = Column(DateTime, name='DateCreate', nullable=False)
    date_update = Column(DateTime, name='DateUpdate')
    
    # Relacionamentos
    favorecido = relationship("Favorecido", back_populates="contas_pagar")
    conta = relationship("Conta", foreign_keys=[id_bank_account])
    
    # Propriedades calculadas
    @property
    def valor_pendente(self):
        """Calcula o valor ainda pendente de pagamento"""
        return self.amount - (self.paid_amount or 0)
    
    @property
    def esta_vencido(self) -> bool:
        """Verifica se a conta está vencida"""
        return self.due_date < datetime.now().date() and not self.payment_date
    
    @property
    def dias_atraso(self) -> int:
        """Calcula quantos dias a conta está em atraso"""
        if not self.esta_vencido:
            return 0
        return (datetime.now().date() - self.due_date).days
    
    def __repr__(self):
        return f"<AccountsPayable(id={self.id}, amount={self.amount}, payment_date={self.payment_date})>"


class AccountsPayablePayment(Base):
    """Modelo para registrar pagamentos das contas a pagar"""
    
    __tablename__ = "tbl_AccountsPayablePayments"

    CodPayment = Column(Integer, primary_key=True, index=True)
    CodAccountsPayable = Column(Integer, ForeignKey("tbl_AccountsPayable.id"), nullable=False)
    idConta = Column(Integer, ForeignKey("tbl_Conta.idConta"), comment="Conta bancária do pagamento")
    CodFormaPagto = Column(Integer, ForeignKey("tbl_FINFormaPagamento.CodFormaPagto"), comment="Forma de pagamento")
    
    DataPagamento = Column(DateTime, nullable=False, default=datetime.now, comment="Data do pagamento")
    ValorPago = Column(Numeric(18, 2), nullable=False, comment="Valor do pagamento")
    Desconto = Column(Numeric(18, 2), default=0, comment="Desconto concedido")
    Juros = Column(Numeric(18, 2), default=0, comment="Juros cobrados")
    Multa = Column(Numeric(18, 2), default=0, comment="Multa cobrada")
    
    NumeroDocumento = Column(String(50), comment="Número do documento de pagamento")
    Observacao = Column(Text, comment="Observações do pagamento")
    
    # Campos de auditoria
    IdUserCreate = Column(Integer, nullable=False, comment="Usuário criação")
    IdUserAlter = Column(Integer, comment="Usuário alteração")
    DateCreate = Column(DateTime, nullable=False, default=datetime.now, comment="Data criação")
    DateUpdate = Column(DateTime, comment="Data alteração")
    
    # Relacionamentos removidos temporariamente para evitar erros de configuração
    
    def __repr__(self):
        return f"<AccountsPayablePayment(CodPayment={self.CodPayment}, ValorPago={self.ValorPago})>"