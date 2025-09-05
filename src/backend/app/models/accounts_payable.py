"""
Modelo de Contas a Pagar
"""
from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from app.models.mixins import UserAuditMixin


class AccountsPayable(Base, UserAuditMixin):
    """Modelo para contas a pagar"""
    
    __tablename__ = "tbl_AccountsPayable"

    CodAccountsPayable = Column(Integer, primary_key=True, index=True)
    CodEmpresa = Column(Integer, ForeignKey("tbl_Empresa.CodEmpresa"), nullable=False, comment="Empresa")
    CodFornecedor = Column(Integer, ForeignKey("tbl_FINFavorecido.CodFavorecido"), nullable=False, comment="Fornecedor")
    idConta = Column(Integer, ForeignKey("tbl_Conta.idConta"), comment="Conta bancária para pagamento")
    CodCategoria = Column(Integer, ForeignKey("tbl_FINCategorias.CodCategoria"), comment="Categoria financeira")
    
    # Datas
    DataEmissao = Column(DateTime, nullable=False, default=datetime.now, comment="Data de emissão")
    DataVencimento = Column(DateTime, nullable=False, comment="Data de vencimento")
    DataPagamento = Column(DateTime, comment="Data do pagamento")
    
    # Valores
    Valor = Column(Numeric(18, 2), nullable=False, comment="Valor original")
    ValorPago = Column(Numeric(18, 2), default=0, comment="Valor já pago")
    Desconto = Column(Numeric(18, 2), default=0, comment="Desconto aplicado")
    Juros = Column(Numeric(18, 2), default=0, comment="Juros aplicados")
    Multa = Column(Numeric(18, 2), default=0, comment="Multa aplicada")
    
    # Controle
    Status = Column(String(1), nullable=False, default='A', comment="A=Aberto, P=Pago, V=Vencido, C=Cancelado")
    NumeroDocumento = Column(String(50), comment="Número do documento/nota fiscal")
    NumParcela = Column(Integer, default=1, comment="Número da parcela")
    TotalParcelas = Column(Integer, default=1, comment="Total de parcelas")
    
    # Informações adicionais
    Observacao = Column(Text, comment="Observações")
    CodigoBarras = Column(String(100), comment="Código de barras do boleto")
    LinhaDigitavel = Column(String(100), comment="Linha digitável do boleto")
    
    # Relacionamentos
    empresa = relationship("Empresa", back_populates="contas_pagar")
    fornecedor = relationship("Favorecido", foreign_keys=[CodFornecedor], back_populates="contas_pagar")
    conta = relationship("Conta", back_populates="contas_pagar")
    categoria = relationship("Categoria", foreign_keys=[CodCategoria])
    pagamentos = relationship("AccountsPayablePayment", back_populates="conta_pagar")
    
    def __repr__(self):
        return f"<AccountsPayable(CodAccountsPayable={self.CodAccountsPayable}, Valor={self.Valor}, Status='{self.Status}')>"
    
    @property
    def valor_saldo(self) -> float:
        """Retorna o saldo a pagar"""
        return float(self.Valor - self.ValorPago)
    
    @property
    def valor_total_com_encargos(self) -> float:
        """Retorna valor total com juros e multa, menos desconto"""
        return float(self.Valor + self.Juros + self.Multa - self.Desconto)
    
    @property
    def is_vencido(self) -> bool:
        """Verifica se está vencido"""
        if self.Status == 'P':  # Já pago
            return False
        return self.DataVencimento < datetime.now()
    
    @property
    def is_pago(self) -> bool:
        """Verifica se está totalmente pago"""
        return self.Status == 'P'
    
    @property
    def is_aberto(self) -> bool:
        """Verifica se está em aberto"""
        return self.Status == 'A'
    
    @property
    def is_cancelado(self) -> bool:
        """Verifica se foi cancelado"""
        return self.Status == 'C'
    
    @property
    def percentual_pago(self) -> float:
        """Retorna o percentual pago"""
        if self.Valor == 0:
            return 0
        return (self.ValorPago / self.Valor) * 100
    
    def update_status(self):
        """Atualiza o status baseado no valor pago e vencimento"""
        if self.Status == 'C':  # Cancelado não muda
            return
        
        if self.valor_saldo <= 0:
            self.Status = 'P'  # Pago
        elif self.is_vencido:
            self.Status = 'V'  # Vencido
        else:
            self.Status = 'A'  # Aberto


class AccountsPayablePayment(Base, UserAuditMixin):
    """Modelo para registrar pagamentos das contas a pagar"""
    
    __tablename__ = "tbl_AccountsPayablePayments"

    CodPayment = Column(Integer, primary_key=True, index=True)
    CodAccountsPayable = Column(Integer, ForeignKey("tbl_AccountsPayable.CodAccountsPayable"), nullable=False)
    idConta = Column(Integer, ForeignKey("tbl_Conta.idConta"), comment="Conta bancária do pagamento")
    CodFormaPagto = Column(Integer, ForeignKey("tbl_FINFormaPagamento.CodFormaPagto"), comment="Forma de pagamento")
    
    DataPagamento = Column(DateTime, nullable=False, default=datetime.now, comment="Data do pagamento")
    ValorPago = Column(Numeric(18, 2), nullable=False, comment="Valor do pagamento")
    Desconto = Column(Numeric(18, 2), default=0, comment="Desconto concedido")
    Juros = Column(Numeric(18, 2), default=0, comment="Juros cobrados")
    Multa = Column(Numeric(18, 2), default=0, comment="Multa cobrada")
    
    NumeroDocumento = Column(String(50), comment="Número do documento de pagamento")
    Observacao = Column(Text, comment="Observações do pagamento")
    
    # Relacionamentos
    conta_pagar = relationship("AccountsPayable", back_populates="pagamentos")
    conta = relationship("Conta")
    forma_pagamento = relationship("FormaPagamento")
    
    def __repr__(self):
        return f"<AccountsPayablePayment(CodPayment={self.CodPayment}, ValorPago={self.ValorPago})>"