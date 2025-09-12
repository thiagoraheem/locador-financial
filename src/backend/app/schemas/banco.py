"""
Schemas for Banco (Bank) module
"""
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, Literal


class BancoBase(BaseModel):
    """Schema base para bancos"""
    Codigo: str = Field(..., max_length=3, description="Código do banco")
    Digito: Optional[str] = Field(None, max_length=1, description="Dígito verificador")
    Nome: str = Field(..., max_length=100, description="Nome do banco")


class BancoCreate(BancoBase):
    """Schema for creating Banco"""
    pass


class BancoUpdate(BaseModel):
    """Schema for updating Banco"""
    Codigo: Optional[int] = Field(None, description="Código do banco")
    Digito: Optional[str] = Field(None, max_length=4, description="Dígito verificador do banco")
    Nome: Optional[str] = Field(None, max_length=100, description="Nome do banco")


class BancoResponse(BancoBase):
    """Schema para resposta de banco"""
    Codigo: str
    NomUsuario: Optional[str] = None
    DatCadastro: Optional[datetime] = None
    NomUsuarioAlteracao: Optional[str] = None
    DatAlteracao: Optional[datetime] = None
    
    model_config = {
        "from_attributes": True
    }
    
    @field_validator('Codigo', mode='before')
    @classmethod
    def convert_codigo_to_string(cls, v):
        """Converte Codigo de int para string se necessário"""
        return str(v) if v is not None else v
    
    # Propriedades de compatibilidade
    @property
    def DtCreate(self) -> Optional[datetime]:
        return self.DatCadastro
    
    @property
    def DtAlter(self) -> Optional[datetime]:
        return self.DatAlteracao
    
    @property
    def codigo_completo(self) -> str:
        """Retorna o código completo do banco (código + dígito)"""
        if self.Digito:
            return f"{self.Codigo}-{self.Digito}"
        return str(self.Codigo)