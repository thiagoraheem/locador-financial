"""
Modelo de Contas Bancárias
"""
from sqlalchemy import Column, Integer, String, Numeric, Boolean, ForeignKey, Text, DateTime, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Conta(Base):
    """Modelo para contas bancárias das empresas"""
    
    __tablename__ = "tbl_Conta"

    # Campos principais
    idConta = Column(Integer, primary_key=True, name='idConta')
    CodEmpresa = Column(Integer, ForeignKey('tbl_Empresa.CodEmpresa'), name='CodEmpresa', default=1)
    Banco = Column(Integer, ForeignKey('tbl_Banco.Codigo'), name='Banco', nullable=False)
    Agencia = Column(String(10), name='Agencia', nullable=False)
    DigitoAgencia = Column(String(2), name='DigitoAgencia')
    Conta = Column(String(20), name='Conta', nullable=False)
    DigitoConta = Column(String(2), name='DigitoConta')
    DesConta = Column(String(50), name='DesConta', nullable=False)
    FlgAtivo = Column(String(1), name='FlgAtivo', default='S')
    FlgContaCorrente = Column(Boolean, name='FlgContaCorrente', default=True)
    FlgPoupanca = Column(Boolean, name='FlgPoupanca', default=False)
    FlgPix = Column(Boolean, name='FlgPix', default=False)
    ChavePix = Column(String(100), name='ChavePix')
    TipoChavePix = Column(String(20), name='TipoChavePix')
    saldo_inicial = Column(Numeric(19,4), name='SaldoInicial', default=0)
    dat_saldo_inicial = Column(Date, name='DatSaldoInicial')
    observacao = Column(Text, name='Observacao')
    flg_conta_caixa = Column(Boolean, name='FlgContaCaixa', default=False)
    limite_credito = Column(Numeric(19,4), name='LimiteCredito')
    taxa_juros_mes = Column(Numeric(5,2), name='TaxaJurosMes')
    convenio_cobranca = Column(String(20), name='ConvenioCobranca')
    carteira_cobranca = Column(String(10), name='CarteiraCobranca')
    nosso_numero_seq = Column(Integer, name='NossoNumeroSeq')
    cod_cedente = Column(String(20), name='CodCedente')
    digito_cedente = Column(String(2), name='DigitoCedente')
    
    # Campos PIX adicionais
    TipoPix = Column(String(20), name='TipoPix')
    ValorPix = Column(String(100), name='ValorPix')
    
    # Campos de operação e API
    OperacaoConta = Column(String(10), name='OperacaoConta')
    Convenio = Column(String(20), name='Convenio')
    FlgContaPadrao = Column(Boolean, name='FlgContaPadrao', default=False)
    EnableAPI = Column(Boolean, name='EnableAPI', default=False)
    ConfiguracaoAPI = Column(Text, name='ConfiguracaoAPI')
    
    # Colunas de auditoria (conforme estrutura real da tabela)
    DatCadastro = Column(DateTime, default=datetime.utcnow, nullable=False)
    NomUsuario = Column(String(15), nullable=False)
    DatAlteracao = Column(DateTime, onupdate=datetime.utcnow, nullable=True)
    NomUsuarioAlteracao = Column(String(15), nullable=True)
    
    # Relacionamentos
    empresa = relationship("Empresa", back_populates="contas_bancarias")
    banco = relationship("Banco", back_populates="contas")
    lancamentos = relationship("Lancamento", back_populates="conta")
    
    # Propriedades de compatibilidade para schemas
    @property
    def DtCreate(self):
        return self.DatCadastro
    
    @property
    def DtAlter(self):
        return self.DatAlteracao
    
    def __repr__(self):
        return f"<Conta(idConta={self.idConta}, DesConta='{self.DesConta}', Banco={self.Banco})>"
    
    @property
    def agencia_completa(self) -> str:
        """Retorna agência com dígito"""
        if self.AgenciaDigito:
            return f"{self.Agencia}-{self.AgenciaDigito}"
        return self.Agencia
    
    @property
    def conta_completa(self) -> str:
        """Retorna conta com dígito"""
        if self.ContaDigito:
            return f"{self.Conta}-{self.ContaDigito}"
        return self.Conta
    
    @property
    def is_active(self) -> bool:
        """Verifica se a conta está ativa - sempre True pois não há campo FlgAtivo"""
        return True
    
    @property
    def is_default(self) -> bool:
        """Verifica se é a conta padrão da empresa"""
        return self.FlgContaPadrao == True
    
    @property
    def has_pix(self) -> bool:
        """Verifica se a conta tem PIX configurado"""
        return self.TipoPix is not None and self.ValorPix is not None
    
    def get_saldo_formatado(self) -> str:
        """Retorna saldo formatado em reais"""
        return f"R$ {self.Saldo:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')