"""
Modelo de Contas Bancárias
"""
from sqlalchemy import Column, Integer, String, Numeric, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.mixins import LoginAuditMixin


class Conta(Base, LoginAuditMixin):
    """Modelo para contas bancárias das empresas"""
    
    __tablename__ = "tbl_Conta"

    idConta = Column(Integer, primary_key=True, index=True)
    CodEmpresa = Column(Integer, ForeignKey("tbl_Empresa.CodEmpresa"), nullable=False, comment="Empresa proprietária")
    Banco = Column(Integer, ForeignKey("tbl_Banco.Codigo"), nullable=False, comment="Banco da conta")
    
    # Dados da agência
    Agencia = Column(String(10), nullable=False, comment="Número da agência")
    AgenciaDigito = Column(String(1), comment="Dígito verificador da agência")
    
    # Dados da conta
    Conta = Column(String(20), nullable=False, comment="Número da conta")
    ContaDigito = Column(String(2), comment="Dígito verificador da conta")
    
    # Informações da conta
    NomConta = Column(String(100), nullable=False, comment="Nome/descrição da conta")
    TipoConta = Column(String(2), default='CC', comment="CC=Conta Corrente, CP=Poupança, CS=Salário")
    Saldo = Column(Numeric(18, 2), default=0, comment="Saldo atual da conta")
    FlgContaPadrao = Column(Boolean, default=False, comment="Indica se é a conta padrão da empresa")
    FlgAtivo = Column(String(1), default='S', comment="S=Ativo, N=Inativo")
    
    # Configurações PIX
    TipoPix = Column(String(10), comment="Tipo de chave PIX: CPF, CNPJ, TELEFONE, EMAIL, ALEATORIA")
    ValorPix = Column(String(100), comment="Valor da chave PIX")
    
    # Integração com APIs bancárias
    EnableAPI = Column(Boolean, default=False, comment="Habilita integração via API bancária")
    ConfiguracaoAPI = Column(Text, comment="Configurações da API bancária (JSON)")
    TokenAPI = Column(String(500), comment="Token de acesso da API bancária")
    
    # Relacionamentos
    empresa = relationship("Empresa", back_populates="contas_bancarias")
    banco = relationship("Banco", back_populates="contas")
    # lancamentos = relationship("Lancamento", back_populates="conta") - removido, sem foreign key
    
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