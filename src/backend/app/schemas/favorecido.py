"""
Schemas para favorecidos
"""
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional, Literal


class FavorecidoBase(BaseModel):
    """Schema base para favorecidos"""
    DesFavorecido: str = Field(..., max_length=100, description="Nome do favorecido")
    TipoFavorecido: Literal['F', 'J'] = Field(..., description="Tipo: F=Físico, J=Jurídico")
    CPF_CNPJ: Optional[str] = Field(None, max_length=20, description="CPF ou CNPJ")
    Telefone: Optional[str] = Field(None, max_length=20, description="Telefone")
    Email: Optional[EmailStr] = Field(None, description="E-mail")
    Endereco: Optional[str] = Field(None, max_length=200, description="Endereço")
    FlgAtivo: Literal['S', 'N'] = Field(default='S', description="Ativo: S=Sim, N=Não")


class FavorecidoCreate(FavorecidoBase):
    """Schema para criação de favorecido"""
    pass


class FavorecidoUpdate(FavorecidoBase):
    """Schema para atualização de favorecido"""
    pass


class FavorecidoResponse(FavorecidoBase):
    """Schema para resposta de favorecido"""
    CodFavorecido: int
    NomUsuario: str
    DtCreate: datetime
    DtAlter: Optional[datetime] = None
    
    model_config = {
        "from_attributes": True
    }