"""
Modelo de Empresas
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, LargeBinary
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime


class Empresa(Base):
    """Modelo para empresas do sistema"""
    
    __tablename__ = "tbl_Empresa"

    CodEmpresa = Column(Integer, primary_key=True, index=True)
    NomEmpresa = Column(String(50), nullable=False, comment="Nome fantasia da empresa")
    RazaoSocial = Column(String(100), nullable=False, comment="Razão social da empresa")
    
    # Dados de endereço
    Endereco = Column(String(150), comment="Endereço completo")
    Logradouro = Column(String(100), comment="Logradouro")
    Bairro = Column(String(50), comment="Bairro")
    CEP = Column(String(9), comment="CEP")
    Municipio = Column(String(40), comment="Município")
    Estado = Column(String(2), comment="Estado (UF)")
    
    # Dados de contato
    Telefone = Column(String(15), comment="Telefone principal")
    Telefone2 = Column(String(15), comment="Telefone secundário")
    Email = Column(String(50), comment="E-mail principal")
    EmailCadastro = Column(String(50), comment="E-mail de cadastro")
    EmailRecibos = Column(String(50), comment="E-mail para recibos")
    WebSite = Column(String(30), comment="Website")
    Slogan = Column(String(50), comment="Slogan da empresa")
    Logotipo = Column(LargeBinary, comment="Logotipo da empresa")
    
    # Dados fiscais
    CNPJ = Column(String(18), comment="CNPJ da empresa")
    InscEstadual = Column(String(15), comment="Inscrição Estadual")
    InscMunicipal = Column(String(10), comment="Inscrição Municipal")
    
    # Representante
    NomRepresentante = Column(String(40), comment="Nome do representante")
    CPFRepresentante = Column(String(14), comment="CPF do representante")
    
    # Configurações
    FlgPadrao = Column(Boolean, nullable=False, default=False, comment="Indica se é a empresa padrão do sistema")
    Settings = Column(String, comment="Configurações em JSON")
    
    # Auditoria - usando os nomes reais das colunas do banco
    DatCadastro = Column(DateTime, nullable=False, default=datetime.utcnow, comment="Data de cadastro")
    NomUsuario = Column(String(15), nullable=False, comment="Usuário que cadastrou")
    DatAlteracao = Column(DateTime, comment="Data da última alteração")
    NomUsuarioAlteracao = Column(String(15), comment="Usuário que alterou")
    
    # Relacionamentos
    contas_bancarias = relationship("Conta", back_populates="empresa")
    # lancamentos = relationship("Lancamento", back_populates="empresa") - removido, sem foreign key
    
    def __repr__(self):
        return f"<Empresa(CodEmpresa={self.CodEmpresa}, NomEmpresa='{self.NomEmpresa}', CNPJ='{self.CNPJ}')>"
    
    @property
    def is_default(self) -> bool:
        """Verifica se é a empresa padrão"""
        return self.FlgPadrao == True
    
    # Propriedades para compatibilidade com schemas antigos
    @property
    def DtCreate(self):
        """Alias para DatCadastro para compatibilidade"""
        return self.DatCadastro
    
    @property
    def DtAlter(self):
        """Alias para DatAlteracao para compatibilidade"""
        return self.DatAlteracao