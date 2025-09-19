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
    Banco = Column(Integer, ForeignKey('tbl_Banco.Codigo'), name='Banco')
    Agencia = Column(String(4), name='Agencia')
    AgenciaDigito = Column(String(4), name='AgenciaDigito')
    Conta = Column(String(15), name='Conta')
    ContaDigito = Column(String(4), name='ContaDigito')
    NomConta = Column(String(50), name='NomConta')
    
    # Campos de operação
    OperacaoConta = Column(String(15), name='OperacaoConta')
    Convenio = Column(String(10), name='Convenio')
    Saldo = Column(Numeric(19,4), name='Saldo', default=0)
    
    # Campos PIX
    TipoPix = Column(String(10), name='TipoPix')
    ValorPix = Column(String(100), name='ValorPix')
    
    # Flags
    FlgContaPadrao = Column(Boolean, name='FlgContaPadrao', default=False)
    
    # Campos de carteira
    Carteira = Column(String(5), name='Carteira')
    VariacaoCarteira = Column(String(5), name='VariacaoCarteira')
    
    # Campos de API
    EnableAPI = Column(Boolean, name='EnableAPI', default=False)
    ConfiguracaoAPI = Column(Text, name='ConfiguracaoAPI')
    # Campos de auditoria
    DatCadastro = Column(DateTime, name='DatCadastro', default=datetime.utcnow)
    NomUsuario = Column(String(15), name='NomUsuario', default='admin')
    DatAlteracao = Column(DateTime, name='DatAlteracao')
    NomUsuarioAlteracao = Column(String(15), name='NomUsuarioAlteracao')
    
    # Relacionamentos
    empresa = relationship("Empresa", back_populates="contas_bancarias")
    banco = relationship("Banco", back_populates="contas")
    lancamentos = relationship("Lancamento", back_populates="conta")
    
    # Propriedades de compatibilidade
    @property
    def DesConta(self):
        """Compatibilidade com código antigo"""
        return self.NomConta
    
    @property
    def DigitoAgencia(self):
        """Compatibilidade com código antigo"""
        return self.AgenciaDigito
    
    @property
    def DigitoConta(self):
        """Compatibilidade com código antigo"""
        return self.ContaDigito
    
    @property
    def DtCreate(self):
        return self.DatCadastro
    
    @property
    def DtAlter(self):
        return self.DatAlteracao
    
    def __repr__(self):
        return f"<Conta(idConta={self.idConta}, NomConta='{self.NomConta}', Banco={self.Banco})>"
    
    @property
    def agencia_completa(self) -> str:
        """Retorna agência com dígito"""
        if self.AgenciaDigito:
            return f"{self.Agencia}-{self.AgenciaDigito}"
        return self.Agencia or ""
    
    @property
    def conta_completa(self) -> str:
        """Retorna conta com dígito"""
        if self.ContaDigito:
            return f"{self.Conta}-{self.ContaDigito}"
        return self.Conta or ""
    
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