"""
Modelo de Contas Bancárias
"""
from sqlalchemy import Column, Integer, String, Numeric, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Conta(Base):
    """Modelo para contas bancárias das empresas"""
    
    __tablename__ = "tbl_Conta"

    idConta = Column(Integer, primary_key=True, index=True)
    CodEmpresa = Column(Integer, ForeignKey("tbl_Empresa.CodEmpresa"), nullable=False)
    Banco = Column(Integer, ForeignKey("tbl_Banco.CodBanco"), nullable=False)
    Agencia = Column(String(4), nullable=False)
    AgenciaDigito = Column(String(4))
    Conta = Column(String(15), nullable=False)
    ContaDigito = Column(String(4))
    OperacaoConta = Column(String(15))
    Convenio = Column(String(10))
    NomConta = Column(String(50), nullable=False)
    Saldo = Column(Numeric(15, 2), default=0.00)
    TipoPix = Column(String(10))
    ValorPix = Column(String(100))
    FlgContaPadrao = Column(Boolean, default=False)
    Carteira = Column(String(5))
    VariacaoCarteira = Column(String(5))
    EnableAPI = Column(Boolean, default=False)
    ConfiguracaoAPI = Column(Text)
    
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
        return f"<Conta(idConta={self.idConta}, NomConta='{self.NomConta}', Banco={self.Banco})>"
    
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
        """Verifica se a conta está ativa"""
        return self.FlgAtivo == 'S'
    
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