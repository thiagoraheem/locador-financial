"""
Schemas for Empresa (Company) module
"""
from pydantic import BaseModel, Field, validator
import re
from datetime import datetime
from typing import Optional, Literal


class EmpresaBase(BaseModel):
    """Base schema for Empresa"""
    NomEmpresa: str = Field(..., max_length=100, description="Nome fantasia da empresa")
    RazaoSocial: str = Field(..., max_length=200, description="Razão social da empresa")
    CNPJ: str = Field(..., max_length=18, description="CNPJ da empresa")
    Endereco: Optional[str] = Field(None, max_length=200, description="Endereço completo")
    Bairro: Optional[str] = Field(None, max_length=100, description="Bairro")
    CEP: Optional[str] = Field(None, max_length=10, description="CEP")
    Municipio: Optional[str] = Field(None, max_length=100, description="Município")
    Estado: Optional[str] = Field(None, max_length=2, description="Estado (UF)")
    Telefone: Optional[str] = Field(None, max_length=20, description="Telefone principal")
    Email: Optional[str] = Field(None, max_length=100, description="E-mail principal")
    FlgPadrao: bool = Field(default=False, description="Indica se é a empresa padrão do sistema")
    FlgAtivo: Literal['S', 'N'] = Field(default='S', description="S=Ativo, N=Inativo")

    @validator('CNPJ')
    def validate_cnpj(cls, v):
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


class EmpresaCreate(EmpresaBase):
    """Schema for creating Empresa"""
    pass


class EmpresaUpdate(EmpresaBase):
    """Schema for updating Empresa"""
    NomEmpresa: Optional[str] = Field(None, max_length=100, description="Nome fantasia da empresa")
    RazaoSocial: Optional[str] = Field(None, max_length=200, description="Razão social da empresa")
    CNPJ: Optional[str] = Field(None, max_length=18, description="CNPJ da empresa")


class EmpresaResponse(EmpresaBase):
    """Schema for Empresa response"""
    CodEmpresa: int
    NomUsuario: str
    DtCreate: datetime
    DtAlter: Optional[datetime] = None

    class Config:
        from_attributes = True

    @property
    def is_active(self) -> bool:
        """Verifica se a empresa está ativa"""
        return self.FlgAtivo == 'S'

    @property
    def is_default(self) -> bool:
        """Verifica se é a empresa padrão"""
        return self.FlgPadrao