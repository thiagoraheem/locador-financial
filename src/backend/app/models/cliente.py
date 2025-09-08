"""
Modelo de Clientes
"""
from sqlalchemy import Column, Integer, String, Boolean, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.mixins import LoginAuditMixin


class Cliente(Base, LoginAuditMixin):
    """Modelo para clientes do sistema"""
    
    __tablename__ = "tbl_Clientes"

    CodCliente = Column(Integer, primary_key=True, index=True)
    DesCliente = Column(String(100), nullable=False, comment="Nome/descrição do cliente")
    RazaoSocial = Column(String(200), comment="Razão social (para PJ)")
    FlgTipoPessoa = Column(String(1), nullable=False, comment="F=Física, J=Jurídica")
    
    # Documentos Pessoa Física
    CPF = Column(String(14), comment="CPF (apenas PF)")
    RG = Column(String(20), comment="RG (apenas PF)")
    
    # Documentos Pessoa Jurídica
    CNPJ = Column(String(18), comment="CNPJ (apenas PJ)")
    IE = Column(String(20), comment="Inscrição Estadual (apenas PJ)")
    IM = Column(String(20), comment="Inscrição Municipal (apenas PJ)")
    
    # Dados de endereço
    Endereco = Column(String(200), comment="Endereço completo")
    Bairro = Column(String(100), comment="Bairro")
    CEP = Column(String(10), comment="CEP")
    Municipio = Column(String(100), comment="Município")
    Estado = Column(String(2), comment="Estado (UF)")
    
    # Dados de contato (múltiplos)
    Telefone1 = Column(String(20), comment="Telefone principal")
    Telefone2 = Column(String(20), comment="Telefone secundário")
    Email1 = Column(String(100), comment="E-mail principal")
    Email2 = Column(String(100), comment="E-mail secundário")
    
    # Status e configurações
    FlgLiberado = Column(Boolean, default=True, comment="Status de liberação do cliente")
    FlgVIP = Column(Boolean, default=False, comment="Cliente VIP")
    FlgAtivo = Column(String(1), default='S', comment="S=Ativo, N=Inativo")
    
    # Observações
    Observacoes = Column(Text, comment="Observações gerais sobre o cliente")
    
    # Relacionamentos
    contas_receber = relationship("AccountsReceivable", back_populates="cliente")
    
    def __repr__(self):
        return f"<Cliente(CodCliente={self.CodCliente}, DesCliente='{self.DesCliente}', Tipo={self.FlgTipoPessoa})>"
    
    @property
    def is_pessoa_fisica(self) -> bool:
        """Verifica se é pessoa física"""
        return self.FlgTipoPessoa == 'F'
    
    @property
    def is_pessoa_juridica(self) -> bool:
        """Verifica se é pessoa jurídica"""
        return self.FlgTipoPessoa == 'J'
    
    @property
    def is_active(self) -> bool:
        """Verifica se o cliente está ativo"""
        return self.FlgAtivo == 'S'
    
    @property
    def is_liberado(self) -> bool:
        """Verifica se o cliente está liberado"""
        return self.FlgLiberado == True
    
    @property
    def is_vip(self) -> bool:
        """Verifica se é cliente VIP"""
        return self.FlgVIP == True
    
    @property
    def documento_principal(self) -> str:
        """Retorna o documento principal (CPF ou CNPJ)"""
        if self.is_pessoa_fisica:
            return self.CPF or ""
        else:
            return self.CNPJ or ""
    
    @property
    def nome_completo(self) -> str:
        """Retorna nome completo (nome ou razão social)"""
        if self.is_pessoa_juridica and self.RazaoSocial:
            return self.RazaoSocial
        return self.DesCliente
    
    def get_telefones(self) -> list:
        """Retorna lista de telefones não vazios"""
        telefones = []
        if self.Telefone1:
            telefones.append(self.Telefone1)
        if self.Telefone2:
            telefones.append(self.Telefone2)
        return telefones
    
    def get_emails(self) -> list:
        """Retorna lista de emails não vazios"""
        emails = []
        if self.Email1:
            emails.append(self.Email1)
        if self.Email2:
            emails.append(self.Email2)
        return emails