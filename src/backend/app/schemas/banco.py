"""
Schemas for Banco (Bank) module
"""
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, Literal


class BancoBase(BaseModel):
    """Base schema for Banco"""
    Codigo: int = Field(..., ge=1, le=999, description="Código do banco (padrão FEBRABAN)")
    Digito: Optional[str] = Field(None, max_length=1, description="Dígito verificador do banco")
    Nome: str = Field(..., max_length=100, description="Nome do banco")
    NomeAbreviado: Optional[str] = Field(None, max_length=20, description="Nome abreviado do banco")
    FlgAtivo: Literal['S', 'N'] = Field(default='S', description="S=Ativo, N=Inativo")


class BancoCreate(BancoBase):
    """Schema for creating Banco"""
    pass


class BancoUpdate(BancoBase):
    """Schema for updating Banco"""
    Codigo: Optional[int] = Field(None, ge=1, le=999, description="Código do banco (padrão FEBRABAN)")
    Nome: Optional[str] = Field(None, max_length=100, description="Nome do banco")


class BancoResponse(BancoBase):
    """Schema for Banco response"""
    NomUsuario: str
    DtCreate: datetime
    DtAlter: Optional[datetime] = None

    class Config:
        from_attributes = True

    @property
    def codigo_completo(self) -> str:
        """Retorna código do banco com dígito"""
        if self.Digito:
            return f"{self.Codigo}-{self.Digito}"
        return str(self.Codigo)

    @property
    def is_active(self) -> bool:
        """Verifica se o banco está ativo"""
        return self.FlgAtivo == 'S'