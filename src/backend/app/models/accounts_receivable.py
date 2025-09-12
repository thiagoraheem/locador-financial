"""
Modelo de Contas a Receber
"""
from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Boolean, Text, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class AccountsReceivable(Base):
    """Modelo para contas a receber"""
    
    __tablename__ = "tbl_AccountsReceivable"

    # Campos principais
    id = Column(Integer, primary_key=True, name='id')
    cod_empresa = Column(Integer, name='CodEmpresa', default=1)
    cod_cliente = Column(Integer, ForeignKey('tbl_Clientes.CodCliente'), name='CodCliente', nullable=False)
    cod_categoria = Column(Integer, ForeignKey('tbl_FINCategorias.CodCategoria'), name='CodCategoria', nullable=False)
    num_documento = Column(String(20), name='NumDocumento')
    data_vencimento = Column(Date, name='DataVencimento', nullable=False)
    data_emissao = Column(Date, name='DataEmissao')
    valor_original = Column(Numeric(19,4), name='ValorOriginal', nullable=False)
    valor_recebido = Column(Numeric(19,4), name='ValorRecebido', default=0)
    valor_juros = Column(Numeric(19,4), name='ValorJuros', default=0)
    valor_multa = Column(Numeric(19,4), name='ValorMulta', default=0)
    valor_desconto = Column(Numeric(19,4), name='ValorDesconto', default=0)
    observacoes = Column(Text, name='Observacoes')
    flg_recebido = Column(Boolean, name='FlgRecebido', default=False)
    data_recebimento = Column(Date, name='DataRecebimento')
    cod_conta = Column(Integer, ForeignKey('tbl_Conta.idConta'), name='CodConta')
    cod_forma_recebimento = Column(Integer, name='CodFormaRecebimento')
    num_parcela = Column(Integer, name='NumParcela')
    qtd_parcelas = Column(Integer, name='QtdParcelas')
    cod_lancamento_origem = Column(Integer, name='CodLancamentoOrigem')
    flg_recorrente = Column(Boolean, name='FlgRecorrente', default=False)
    periodicidade = Column(String(1), name='Periodicidade')  # M=Mensal, A=Anual, etc
    nosso_numero = Column(String(20), name='NossoNumero')
    codigo_barras = Column(String(100), name='CodigoBarras')
    linha_digitavel = Column(String(100), name='LinhaDigitavel')
    IdUserCreate = Column(Integer, nullable=False, comment="Usuário criação")
    IdUserAlter = Column(Integer, comment="Usuário alteração")
    DateCreate = Column(DateTime, nullable=False, comment="Data criação")
    DateUpdate = Column(DateTime, comment="Data alteração")
    
    # Relacionamentos
    cliente = relationship("Cliente", back_populates="contas_receber")
    categoria = relationship("Categoria")
    conta = relationship("Conta")
    
    # Propriedades calculadas
    @property
    def valor_pendente(self):
        """Calcula o valor ainda pendente de recebimento"""
        return self.valor_original - (self.valor_recebido or 0)
    
    @property
    def esta_vencido(self) -> bool:
        """Verifica se a conta está vencida"""
        return self.data_vencimento < datetime.now().date() and not self.flg_recebido
    
    @property
    def dias_atraso(self) -> int:
        """Calcula quantos dias a conta está em atraso"""
        if not self.esta_vencido:
            return 0
        return (datetime.now().date() - self.data_vencimento).days
    
    def __repr__(self):
        return f"<AccountsReceivable(id={self.id}, valor_original={self.valor_original}, flg_recebido={self.flg_recebido})>"


class AccountsReceivablePayment(Base):
    """Modelo para registrar recebimentos das contas a receber"""
    
    __tablename__ = "tbl_AccountsReceivablePayments"

    CodPayment = Column(Integer, primary_key=True, index=True)
    CodAccountsReceivable = Column(Integer, ForeignKey("tbl_AccountsReceivable.id"), nullable=False)
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