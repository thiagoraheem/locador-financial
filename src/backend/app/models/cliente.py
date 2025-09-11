"""
Modelo de Clientes
"""
from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Cliente(Base):
    """Modelo para clientes do sistema"""
    
    __tablename__ = "tbl_Clientes"

    CodCliente = Column(Integer, primary_key=True, index=True)
    DesCliente = Column(String(100), nullable=False, comment="Nome/descrição do cliente")
    RazaoSocial = Column(String(200), comment="Razão social (para PJ)")
    FlgTipoPessoa = Column(String(1), nullable=False, comment="F=Física, J=Jurídica")
    CNPJCPF = Column(String(20), unique=True, index=True, comment="CNPJ ou CPF")
    InscricaoEstadual = Column(String(20), comment="Inscrição estadual (para PJ)")
    Email = Column(String(100), comment="Email principal")
    Telefone = Column(String(20), comment="Telefone principal")
    Endereco = Column(Text, comment="Endereço completo")
    FlgAtivo = Column(Boolean, default=True, comment="Cliente ativo")
    Observacoes = Column(Text, comment="Observações gerais")
    
    # Colunas de auditoria (conforme estrutura real da tabela)
    DatCadastro = Column(DateTime, default=datetime.utcnow, nullable=False)
    NomUsuario = Column(String(15), nullable=False)
    DatAlteracao = Column(DateTime, onupdate=datetime.utcnow, nullable=True)
    NomUsuarioAlteracao = Column(String(15), nullable=True)
    
    # Relacionamentos
    contas_receber = relationship("AccountsReceivable", back_populates="cliente")
    
    # Propriedades de compatibilidade para schemas
    @property
    def DtCreate(self):
        return self.DatCadastro
    
    @property
    def DtAlter(self):
        return self.DatAlteracao
    
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