"""
Modelo de Contas a Receber
"""
from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class AccountsReceivable(Base):
    """Modelo para contas a receber"""
    
    __tablename__ = "tbl_AccountsReceivable"

    IdAccountsReceivable = Column(Integer, primary_key=True, index=True)
    IdCompany = Column(Integer, nullable=False, comment="Empresa")
    DocumentNumber = Column(String(50), comment="Número do documento")
    Amount = Column(Numeric(19, 4), nullable=False, comment="Valor original")
    IssuanceDate = Column(DateTime, nullable=False, comment="Data de emissão")
    DueDate = Column(DateTime, nullable=False, comment="Data de vencimento")
    IdCostCenter = Column(Integer, comment="Centro de custo")
    IdChartOfAccounts = Column(Integer, comment="Plano de contas")
    Description = Column(Text, comment="Descrição")
    IdCustomer = Column(Integer, ForeignKey("tbl_Clientes.CodCliente"), comment="Cliente")
    PaymentDate = Column(DateTime, comment="Data do recebimento")
    PaidAmount = Column(Numeric(19, 4), comment="Valor recebido")
    Installment = Column(Integer, comment="Número da parcela")
    TotalInstallments = Column(Integer, comment="Total de parcelas")
    FineAmount = Column(Numeric(19, 4), comment="Valor da multa")
    InterestAmount = Column(Numeric(19, 4), comment="Valor dos juros")
    DiscountAmount = Column(Numeric(19, 4), comment="Valor do desconto")
    IdBankAccount = Column(Integer, comment="Conta bancária")
    IdPaymentMethod = Column(Integer, comment="Forma de pagamento")
    IdParentAccountsReceivable = Column(Integer, comment="Conta pai")
    IdInstallmentType = Column(Integer, nullable=False, comment="Tipo de parcela")
    IdDocumentType = Column(Integer, nullable=False, comment="Tipo de documento")
    IdUserCreate = Column(Integer, nullable=False, comment="Usuário criação")
    IdUserAlter = Column(Integer, comment="Usuário alteração")
    DateCreate = Column(DateTime, nullable=False, comment="Data criação")
    DateUpdate = Column(DateTime, comment="Data alteração")
    
    # Relacionamentos
    cliente = relationship("Cliente", back_populates="contas_receber")
    
    # Propriedades calculadas
    @property
    def valor_pendente(self):
        """Calcula o valor ainda pendente de recebimento"""
        return self.Amount - (self.PaidAmount or 0)
    
    @property
    def esta_vencido(self) -> bool:
        """Verifica se a conta está vencida"""
        return self.DueDate < datetime.now() and self.PaymentDate is None
    
    @property
    def dias_atraso(self) -> int:
        """Calcula quantos dias a conta está em atraso"""
        if not self.esta_vencido:
            return 0
        return (datetime.now() - self.DueDate).days
    
    def __repr__(self):
        return f"<AccountsReceivable(IdAccountsReceivable={self.IdAccountsReceivable}, Amount={self.Amount}, PaymentDate={self.PaymentDate})>"


class AccountsReceivablePayment(Base):
    """Modelo para registrar recebimentos das contas a receber"""
    
    __tablename__ = "tbl_AccountsReceivablePayments"

    CodPayment = Column(Integer, primary_key=True, index=True)
    CodAccountsReceivable = Column(Integer, ForeignKey("tbl_AccountsReceivable.IdAccountsReceivable"), nullable=False)
    idConta = Column(Integer, ForeignKey("tbl_Conta.idConta"), comment="Conta bancária do recebimento")
    CodFormaPagto = Column(Integer, ForeignKey("tbl_FINFormaPagamento.CodFormaPagto"), comment="Forma de recebimento")
    
    DataRecebimento = Column(DateTime, nullable=False, default=datetime.now, comment="Data do recebimento")
    ValorRecebido = Column(Numeric(18, 2), nullable=False, comment="Valor do recebimento")
    Desconto = Column(Numeric(18, 2), default=0, comment="Desconto concedido")
    Juros = Column(Numeric(18, 2), default=0, comment="Juros recebidos")
    Multa = Column(Numeric(18, 2), default=0, comment="Multa recebida")
    
    NumeroDocumento = Column(String(50), comment="Número do documento de recebimento")
    Observacao = Column(Text, comment="Observações do recebimento")
    
    # Campos de auditoria
    IdUserCreate = Column(Integer, nullable=False, comment="Usuário criação")
    IdUserAlter = Column(Integer, comment="Usuário alteração")
    DateCreate = Column(DateTime, nullable=False, default=datetime.now, comment="Data criação")
    DateUpdate = Column(DateTime, comment="Data alteração")
    
    # Relacionamentos removidos temporariamente para evitar erros de configuração
    
    def __repr__(self):
        return f"<AccountsReceivablePayment(CodPayment={self.CodPayment}, ValorRecebido={self.ValorRecebido})>"