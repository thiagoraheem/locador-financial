"""
Schemas for Cliente (Client) module
"""
from pydantic import BaseModel, Field, validator
import re
from datetime import datetime
from typing import Optional, Literal


class ClienteBase(BaseModel):
    """Base schema for Cliente"""
    DesCliente: str = Field(..., max_length=100, description="Nome/descrição do cliente")
    RazaoSocial: Optional[str] = Field(None, max_length=200, description="Razão social (para PJ)")
    FlgTipoPessoa: Literal['F', 'J'] = Field(..., description="F=Física, J=Jurídica")
    
    # Documentos Pessoa Física
    CPF: Optional[str] = Field(None, max_length=14, description="CPF (apenas PF)")
    RG: Optional[str] = Field(None, max_length=20, description="RG (apenas PF)")
    
    # Documentos Pessoa Jurídica
    CNPJ: Optional[str] = Field(None, max_length=18, description="CNPJ (apenas PJ)")
    IE: Optional[str] = Field(None, max_length=20, description="Inscrição Estadual (apenas PJ)")
    IM: Optional[str] = Field(None, max_length=20, description="Inscrição Municipal (apenas PJ)")
    
    # Dados de endereço
    Endereco: Optional[str] = Field(None, max_length=200, description="Endereço completo")
    Bairro: Optional[str] = Field(None, max_length=100, description="Bairro")
    CEP: Optional[str] = Field(None, max_length=10, description="CEP")
    Municipio: Optional[str] = Field(None, max_length=100, description="Município")
    Estado: Optional[str] = Field(None, max_length=2, description="Estado (UF)")
    
    # Dados de contato
    Telefone: Optional[str] = Field(None, max_length=20, description="Telefone principal")
    Telefone2: Optional[str] = Field(None, max_length=20, description="Telefone secundário")
    Telefone3: Optional[str] = Field(None, max_length=20, description="Telefone terciário")
    Email: Optional[str] = Field(None, max_length=100, description="E-mail principal")
    Email2: Optional[str] = Field(None, max_length=100, description="E-mail secundário")
    Email3: Optional[str] = Field(None, max_length=100, description="E-mail terciário")
    
    # Status e configurações
    FlgLiberado: bool = Field(default=False, description="Status de liberação do cliente")
    FlgVIP: bool = Field(default=False, description="Cliente VIP")
    FlgNegativado: int = Field(default=0, description="Cliente negativado")

    @validator('CPF')
    def validate_cpf(cls, v, values):
        if v is None:
            return v
        # Only validate CPF if tipo pessoa is F
        if values.get('FlgTipoPessoa') == 'J':
            return None
        # Remove non-digit characters
        cpf_digits = re.sub(r'\D', '', v)
        if len(cpf_digits) != 11:
            raise ValueError('CPF deve conter 11 dígitos')
        return v

    @validator('CNPJ')
    def validate_cnpj(cls, v, values):
        if v is None:
            return v
        # Only validate CNPJ if tipo pessoa is J
        if values.get('FlgTipoPessoa') == 'F':
            return None
        # Remove non-digit characters
        cnpj_digits = re.sub(r'\D', '', v)
        if len(cnpj_digits) != 14:
            raise ValueError('CNPJ deve conter 14 dígitos')
        return v

    @validator('CEP')
    def validate_cep(cls, v):
        if v is None:
            return v
        # Remove non-digit characters
        cep_digits = re.sub(r'\D', '', v)
        if len(cep_digits) != 8:
            raise ValueError('CEP deve conter 8 dígitos')
        return f"{cep_digits[:5]}-{cep_digits[5:]}"


class ClienteCreate(ClienteBase):
    """Schema for creating Cliente"""
    pass


class ClienteUpdate(ClienteBase):
    """Schema for updating Cliente"""
    DesCliente: Optional[str] = Field(None, max_length=100, description="Nome/descrição do cliente")
    FlgTipoPessoa: Optional[Literal['F', 'J']] = Field(None, description="F=Física, J=Jurídica")


class ClienteResponse(ClienteBase):
    """Schema for Cliente response"""
    CodCliente: int
    NomUsuario: str
    DtCreate: datetime
    DtAlter: Optional[datetime] = None

    class Config:
        from_attributes = True

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
        """Verifica se o cliente está liberado"""
        return self.FlgLiberado

    @property
    def is_vip(self) -> bool:
        """Verifica se é cliente VIP"""
        return self.FlgVIP

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