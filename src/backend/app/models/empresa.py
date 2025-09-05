"""
Modelo de Empresas
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.mixins import LoginAuditMixin


class Empresa(Base, LoginAuditMixin):
    """Modelo para empresas do sistema"""
    
    __tablename__ = "tbl_Empresa"

    CodEmpresa = Column(Integer, primary_key=True, index=True)
    NomEmpresa = Column(String(100), nullable=False, comment="Nome fantasia da empresa")
    RazaoSocial = Column(String(200), nullable=False, comment="Razão social da empresa")
    CNPJ = Column(String(18), nullable=False, unique=True, index=True, comment="CNPJ da empresa")
    
    # Dados de endereço
    Endereco = Column(String(200), comment="Endereço completo")
    Bairro = Column(String(100), comment="Bairro")
    CEP = Column(String(10), comment="CEP")
    Municipio = Column(String(100), comment="Município")
    Estado = Column(String(2), comment="Estado (UF)")
    
    # Dados de contato
    Telefone = Column(String(20), comment="Telefone principal")
    Email = Column(String(100), comment="E-mail principal")
    
    # Configurações
    FlgPadrao = Column(Boolean, default=False, comment="Indica se é a empresa padrão do sistema")
    FlgAtivo = Column(String(1), default='S', comment="S=Ativo, N=Inativo")
    
    # Relacionamentos
    contas_bancarias = relationship("Conta", back_populates="empresa")
    lancamentos = relationship("Lancamento", back_populates="empresa")
    contas_pagar = relationship("AccountsPayable", back_populates="empresa")
    contas_receber = relationship("AccountsReceivable", back_populates="empresa")
    
    def __repr__(self):
        return f"<Empresa(CodEmpresa={self.CodEmpresa}, NomEmpresa='{self.NomEmpresa}', CNPJ='{self.CNPJ}')>"
    
    @property
    def is_active(self) -> bool:
        """Verifica se a empresa está ativa"""
        return self.FlgAtivo == 'S'
    
    @property
    def is_default(self) -> bool:
        """Verifica se é a empresa padrão"""
        return self.FlgPadrao == True