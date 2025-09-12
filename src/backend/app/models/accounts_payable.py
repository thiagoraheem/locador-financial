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

    # Campos principais
    id = Column(Integer, primary_key=True, name='id')
    cod_empresa = Column(Integer, name='CodEmpresa', default=1)
    cod_favorecido = Column(Integer, ForeignKey('tbl_FINFavorecido.CodFavorecido'), name='CodFavorecido', nullable=False)
    cod_categoria = Column(Integer, ForeignKey('tbl_FINCategorias.CodCategoria'), name='CodCategoria', nullable=False)
    num_documento = Column(String(20), name='NumDocumento')
    data_vencimento = Column(Date, name='DataVencimento', nullable=False)
    data_emissao = Column(Date, name='DataEmissao')
    valor_original = Column(Numeric(19,4), name='ValorOriginal', nullable=False)
    valor_pago = Column(Numeric(19,4), name='ValorPago', default=0)
    valor_juros = Column(Numeric(19,4), name='ValorJuros', default=0)
    valor_multa = Column(Numeric(19,4), name='ValorMulta', default=0)
    valor_desconto = Column(Numeric(19,4), name='ValorDesconto', default=0)
    observacoes = Column(Text, name='Observacoes')
    flg_pago = Column(Boolean, name='FlgPago', default=False)
    data_pagamento = Column(Date, name='DataPagamento')
    cod_conta = Column(Integer, ForeignKey('tbl_Conta.idConta'), name='CodConta')
    cod_forma_pagamento = Column(Integer, name='CodFormaPagamento')
    num_parcela = Column(Integer, name='NumParcela')
    qtd_parcelas = Column(Integer, name='QtdParcelas')
    cod_lancamento_origem = Column(Integer, name='CodLancamentoOrigem')
    flg_recorrente = Column(Boolean, name='FlgRecorrente', default=False)
    periodicidade = Column(String(1), name='Periodicidade')  # M=Mensal, A=Anual, etc
    
    # Relacionamentos
    favorecido = relationship("Favorecido", back_populates="contas_pagar")
    categoria = relationship("Categoria")
    conta = relationship("Conta")
    
    # Propriedades calculadas
    @property
    def valor_pendente(self):
        """Calcula o valor ainda pendente de pagamento"""
        return self.valor_original - (self.valor_pago or 0)
    
    @property
    def esta_vencido(self) -> bool:
        """Verifica se a conta está vencida"""
        return self.data_vencimento < datetime.now().date() and not self.flg_pago
    
    @property
    def dias_atraso(self) -> int:
        """Calcula quantos dias a conta está em atraso"""
        if not self.esta_vencido:
            return 0
        return (datetime.now().date() - self.data_vencimento).days
    
    def __repr__(self):
        return f"<AccountsPayable(id={self.id}, valor_original={self.valor_original}, flg_pago={self.flg_pago})>"


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