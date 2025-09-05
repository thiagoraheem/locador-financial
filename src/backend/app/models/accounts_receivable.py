"""
Modelo de Contas a Receber
"""
from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from app.models.mixins import UserAuditMixin


class AccountsReceivable(Base, UserAuditMixin):
    """Modelo para contas a receber"""
    
    __tablename__ = "tbl_AccountsReceivable"

    CodAccountsReceivable = Column(Integer, primary_key=True, index=True)
    CodEmpresa = Column(Integer, ForeignKey("tbl_Empresa.CodEmpresa"), nullable=False, comment="Empresa")
    CodCliente = Column(Integer, ForeignKey("tbl_Clientes.CodCliente"), nullable=False, comment="Cliente")
    idConta = Column(Integer, ForeignKey("tbl_Conta.idConta"), comment="Conta bancária para recebimento")
    CodCategoria = Column(Integer, ForeignKey("tbl_FINCategorias.CodCategoria"), comment="Categoria financeira")
    
    # Datas
    DataEmissao = Column(DateTime, nullable=False, default=datetime.now, comment="Data de emissão")
    DataVencimento = Column(DateTime, nullable=False, comment="Data de vencimento")
    DataRecebimento = Column(DateTime, comment="Data do recebimento")
    
    # Valores
    Valor = Column(Numeric(18, 2), nullable=False, comment="Valor original")
    ValorRecebido = Column(Numeric(18, 2), default=0, comment="Valor já recebido")
    Desconto = Column(Numeric(18, 2), default=0, comment="Desconto concedido")
    Juros = Column(Numeric(18, 2), default=0, comment="Juros aplicados")
    Multa = Column(Numeric(18, 2), default=0, comment="Multa aplicada")
    
    # Controle
    Status = Column(String(1), nullable=False, default='A', comment="A=Aberto, R=Recebido, V=Vencido, C=Cancelado")
    NumeroDocumento = Column(String(50), comment="Número do documento/nota fiscal")
    NumParcela = Column(Integer, default=1, comment="Número da parcela")
    TotalParcelas = Column(Integer, default=1, comment="Total de parcelas")
    
    # Controle de inadimplência
    DiasAtraso = Column(Integer, default=0, comment="Dias em atraso")
    FlgProtestado = Column(Boolean, default=False, comment="Se foi protestado")
    DataProtesto = Column(DateTime, comment="Data do protesto")
    
    # Informações adicionais
    Observacao = Column(Text, comment="Observações")
    NotaFiscal = Column(String(50), comment="Número da nota fiscal")
    SerieNF = Column(String(10), comment="Série da nota fiscal")
    
    # Relacionamentos
    empresa = relationship("Empresa", back_populates="contas_receber")
    cliente = relationship("Cliente", back_populates="contas_receber")
    conta = relationship("Conta", back_populates="contas_receber")
    categoria = relationship("Categoria", foreign_keys=[CodCategoria])
    recebimentos = relationship("AccountsReceivablePayment", back_populates="conta_receber")
    
    def __repr__(self):
        return f"<AccountsReceivable(CodAccountsReceivable={self.CodAccountsReceivable}, Valor={self.Valor}, Status='{self.Status}')>"
    
    @property
    def valor_saldo(self) -> float:
        """Retorna o saldo a receber"""
        return float(self.Valor - self.ValorRecebido)
    
    @property
    def valor_total_com_encargos(self) -> float:
        """Retorna valor total com juros e multa, menos desconto"""
        return float(self.Valor + self.Juros + self.Multa - self.Desconto)
    
    @property
    def is_vencido(self) -> bool:
        """Verifica se está vencido"""
        if self.Status == 'R':  # Já recebido
            return False
        return self.DataVencimento < datetime.now()
    
    @property
    def is_recebido(self) -> bool:
        """Verifica se está totalmente recebido"""
        return self.Status == 'R'
    
    @property
    def is_aberto(self) -> bool:
        """Verifica se está em aberto"""
        return self.Status == 'A'
    
    @property
    def is_cancelado(self) -> bool:
        """Verifica se foi cancelado"""
        return self.Status == 'C'
    
    @property
    def is_protestado(self) -> bool:
        """Verifica se foi protestado"""
        return self.FlgProtestado == True
    
    @property
    def percentual_recebido(self) -> float:
        """Retorna o percentual recebido"""
        if self.Valor == 0:
            return 0
        return (self.ValorRecebido / self.Valor) * 100
    
    @property
    def dias_vencimento(self) -> int:
        """Retorna dias para vencimento (negativo se vencido)"""
        delta = self.DataVencimento - datetime.now()
        return delta.days
    
    def calcular_dias_atraso(self) -> int:
        """Calcula e atualiza os dias de atraso"""
        if self.Status == 'R' or self.Status == 'C':
            self.DiasAtraso = 0
            return 0
        
        if self.is_vencido:
            delta = datetime.now() - self.DataVencimento
            self.DiasAtraso = delta.days
        else:
            self.DiasAtraso = 0
        
        return self.DiasAtraso
    
    def update_status(self):
        """Atualiza o status baseado no valor recebido e vencimento"""
        if self.Status == 'C':  # Cancelado não muda
            return
        
        if self.valor_saldo <= 0:
            self.Status = 'R'  # Recebido
        elif self.is_vencido:
            self.Status = 'V'  # Vencido
        else:
            self.Status = 'A'  # Aberto
        
        # Atualiza dias de atraso
        self.calcular_dias_atraso()


class AccountsReceivablePayment(Base, UserAuditMixin):
    """Modelo para registrar recebimentos das contas a receber"""
    
    __tablename__ = "tbl_AccountsReceivablePayments"

    CodPayment = Column(Integer, primary_key=True, index=True)
    CodAccountsReceivable = Column(Integer, ForeignKey("tbl_AccountsReceivable.CodAccountsReceivable"), nullable=False)
    idConta = Column(Integer, ForeignKey("tbl_Conta.idConta"), comment="Conta bancária do recebimento")
    CodFormaPagto = Column(Integer, ForeignKey("tbl_FINFormaPagamento.CodFormaPagto"), comment="Forma de recebimento")
    
    DataRecebimento = Column(DateTime, nullable=False, default=datetime.now, comment="Data do recebimento")
    ValorRecebido = Column(Numeric(18, 2), nullable=False, comment="Valor do recebimento")
    Desconto = Column(Numeric(18, 2), default=0, comment="Desconto concedido")
    Juros = Column(Numeric(18, 2), default=0, comment="Juros recebidos")
    Multa = Column(Numeric(18, 2), default=0, comment="Multa recebida")
    
    NumeroDocumento = Column(String(50), comment="Número do documento de recebimento")
    Observacao = Column(Text, comment="Observações do recebimento")
    
    # Relacionamentos
    conta_receber = relationship("AccountsReceivable", back_populates="recebimentos")
    conta = relationship("Conta")
    forma_pagamento = relationship("FormaPagamento")
    
    def __repr__(self):
        return f"<AccountsReceivablePayment(CodPayment={self.CodPayment}, ValorRecebido={self.ValorRecebido})>"