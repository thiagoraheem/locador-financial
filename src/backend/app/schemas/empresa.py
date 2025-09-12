"""
Schemas for Empresa (Company) module
"""
from pydantic import BaseModel, Field, validator
import re
from datetime import datetime
from typing import Optional, Literal


class EmpresaBase(BaseModel):
    """Base schema for Empresa"""
    NomEmpresa: str = Field(..., max_length=50, description="Nome fantasia da empresa")
    RazaoSocial: str = Field(..., max_length=100, description="Razão social da empresa")
    CNPJ: Optional[str] = Field(None, max_length=18, description="CNPJ da empresa")
    Endereco: Optional[str] = Field(None, max_length=150, description="Endereço completo")
    Logradouro: Optional[str] = Field(None, max_length=100, description="Logradouro")
    Bairro: Optional[str] = Field(None, max_length=50, description="Bairro")
    CEP: Optional[str] = Field(None, max_length=9, description="CEP")
    Municipio: Optional[str] = Field(None, max_length=40, description="Município")
    Estado: Optional[str] = Field(None, max_length=2, description="Estado (UF)")
    Telefone: Optional[str] = Field(None, max_length=15, description="Telefone principal")
    Telefone2: Optional[str] = Field(None, max_length=15, description="Telefone secundário")
    Email: Optional[str] = Field(None, max_length=50, description="E-mail principal")
    EmailCadastro: Optional[str] = Field(None, max_length=50, description="E-mail de cadastro")
    EmailRecibos: Optional[str] = Field(None, max_length=50, description="E-mail para recibos")
    WebSite: Optional[str] = Field(None, max_length=30, description="Website")
    Slogan: Optional[str] = Field(None, max_length=50, description="Slogan da empresa")
    InscEstadual: Optional[str] = Field(None, max_length=15, description="Inscrição Estadual")
    InscMunicipal: Optional[str] = Field(None, max_length=10, description="Inscrição Municipal")
    NomRepresentante: Optional[str] = Field(None, max_length=40, description="Nome do representante")
    CPFRepresentante: Optional[str] = Field(None, max_length=14, description="CPF do representante")
    FlgPadrao: bool = Field(default=False, description="Indica se é a empresa padrão do sistema")
    Settings: Optional[str] = Field(None, description="Configurações em JSON")

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
    NomEmpresa: Optional[str] = Field(None, max_length=50, description="Nome fantasia da empresa")
    RazaoSocial: Optional[str] = Field(None, max_length=100, description="Razão social da empresa")
    CNPJ: Optional[str] = Field(None, max_length=18, description="CNPJ da empresa")


class EmpresaResponse(EmpresaBase):
    """Schema for Empresa response"""
    CodEmpresa: int
    NomUsuario: str
    DatCadastro: datetime
    DatAlteracao: Optional[datetime] = None
    NomUsuarioAlteracao: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

    @property
    def is_default(self) -> bool:
        """Verifica se é a empresa padrão"""
        return self.FlgPadrao
    
    # Propriedades para compatibilidade com código antigo
    @property
    def DtCreate(self) -> datetime:
        """Alias para DatCadastro"""
        return self.DatCadastro
    
    @property
    def DtAlter(self) -> Optional[datetime]:
        """Alias para DatAlteracao"""
        return self.DatAlteracao