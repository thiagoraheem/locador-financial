"""
Modelo de Clientes
"""
from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Cliente(Base):
    """Modelo para clientes do sistema"""
    
    __tablename__ = "tbl_Clientes"

    # Colunas principais
    CodCliente = Column(Integer, primary_key=True, index=True)
    DesCliente = Column(String(100), nullable=False, comment="Nome/descrição do cliente")
    RazaoSocial = Column(String(200), comment="Razão social (para PJ)")
    FlgTipoPessoa = Column(String(1), nullable=False, comment="F=Física, J=Jurídica")
    
    # Documentos
    CPF = Column(String(11), comment="CPF para pessoa física")
    RG = Column(String(20), comment="RG para pessoa física")
    CNPJ = Column(String(14), comment="CNPJ para pessoa jurídica")
    IE = Column(String(20), comment="Inscrição estadual")
    IM = Column(String(20), comment="Inscrição municipal")
    
    # Endereço
    Endereco = Column(String(200), comment="Endereço")
    EnderecoComplemento = Column(String(100), comment="Complemento do endereço")
    Numero = Column(String(10), comment="Número")
    Bairro = Column(String(100), comment="Bairro")
    CEP = Column(String(8), comment="CEP")
    Municipio = Column(String(100), comment="Município")
    Estado = Column(String(2), comment="Estado")
    
    # Contatos
    Telefone = Column(String(20), comment="Telefone principal")
    Telefone2 = Column(String(20), comment="Telefone secundário")
    Telefone3 = Column(String(20), comment="Telefone terciário")
    Email = Column(String(100), comment="Email principal")
    Email2 = Column(String(100), comment="Email secundário")
    Email3 = Column(String(100), comment="Email terciário")
    
    # Flags e configurações
    FlgVIP = Column(Boolean, default=False, comment="Cliente VIP")
    FlgNegativado = Column(Integer, default=0, comment="Cliente negativado")
    
    # Campos adicionais
    Contato2 = Column(String(50), name='Contato2')
    Contato3 = Column(String(50), name='Contato3')
    CNH = Column(String(20), name='CNH')
    CNHValidade = Column(DateTime, name='CNHValidade')
    TipoContribuinte = Column(String(150), name='TipoContribuinte')
    TipoRegimeTributario = Column(String(30), name='TipoRegimeTributario')
    VlrDesconto = Column(Numeric(8,2), name='VlrDesconto')
    CodVendedor = Column(Integer, name='CodVendedor')
    
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
    def is_liberado(self) -> bool:
        """Retorna se o cliente está liberado (baseado em lógica de negócio)"""
        # Implementar lógica de negócio para determinar se cliente está liberado
        # Por exemplo: verificar se tem pendências, documentos em dia, etc.
        return True  # Placeholder - implementar lógica real
    
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
        if self.Telefone:
            telefones.append(self.Telefone)
        if self.Telefone2:
            telefones.append(self.Telefone2)
        if self.Telefone3:
            telefones.append(self.Telefone3)
        return telefones
    
    def get_emails(self) -> list:
        """Retorna lista de emails não vazios"""
        emails = []
        if self.Email:
            emails.append(self.Email)
        if self.Email2:
            emails.append(self.Email2)
        if self.Email3:
            emails.append(self.Email3)
        return emails