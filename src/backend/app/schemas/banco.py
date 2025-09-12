"""
Schemas for Banco (Bank) module
"""
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, Literal


class BancoBase(BaseModel):
    """Base schema for Banco"""
    Codigo: int = Field(..., description="Código do banco")
    Digito: Optional[str] = Field(None, max_length=4, description="Dígito verificador do banco")
    Nome: Optional[str] = Field(None, max_length=100, description="Nome do banco")


class BancoCreate(BancoBase):
    """Schema for creating Banco"""
    pass


class BancoUpdate(BaseModel):
    """Schema for updating Banco"""
    Codigo: Optional[int] = Field(None, description="Código do banco")
    Digito: Optional[str] = Field(None, max_length=4, description="Dígito verificador do banco")
    Nome: Optional[str] = Field(None, max_length=100, description="Nome do banco")


class BancoResponse(BancoBase):
    """Schema for Banco response"""
    
    model_config = {
        "from_attributes": True
    }

    @property
    def codigo_completo(self) -> str:
        """Retorna código do banco com dígito"""
        if self.Digito:
            return f"{self.Codigo}-{self.Digito}"
        return str(self.Codigo)

    @property
    def is_active(self) -> bool:
        """Verifica se o banco está ativo - sempre True pois não há campo FlgAtivo"""
        return True