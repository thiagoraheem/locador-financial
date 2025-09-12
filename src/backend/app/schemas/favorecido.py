"""
Schemas para favorecidos
"""
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional, Literal


class FavorecidoBase(BaseModel):
    """Schema base para favorecidos"""
    DesFavorecido: str = Field(..., max_length=100, description="Nome do favorecido")
    TipoFavorecido: Optional[Literal['F', 'J']] = Field(None, description="Tipo: F=Físico, J=Jurídico")
    Endereco: Optional[str] = Field(None, max_length=100, description="Endereço")
    Bairro: Optional[str] = Field(None, max_length=50, description="Bairro")
    Cidade: Optional[str] = Field(None, max_length=50, description="Cidade")
    UF: Optional[str] = Field(None, max_length=2, description="Estado (UF)")
    CEP: Optional[str] = Field(None, max_length=10, description="CEP")
    Municipio: Optional[str] = Field(None, max_length=50, description="Município")
    RG: Optional[str] = Field(None, max_length=20, description="RG")
    CPF: Optional[str] = Field(None, max_length=14, description="CPF")
    CNPJ: Optional[str] = Field(None, max_length=18, description="CNPJ")
    Telefone: Optional[str] = Field(None, max_length=20, description="Telefone")
    Celular: Optional[str] = Field(None, max_length=20, description="Celular")
    Email: Optional[str] = Field(None, max_length=100, description="E-mail")
    Observacao: Optional[str] = Field(None, description="Observações")
    FlgAtivo: Optional[Literal['S', 'N']] = Field(default='S', description="Ativo: S=Sim, N=Não")
    FlgFornecedor: Optional[Literal['S', 'N']] = Field(default='N', description="É fornecedor: S=Sim, N=Não")
    FlgCliente: Optional[Literal['S', 'N']] = Field(default='N', description="É cliente: S=Sim, N=Não")


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
    DatCadastro: datetime
    NomUsuarioAlteracao: Optional[str] = None
    DatAlteracao: Optional[datetime] = None
    
    model_config = {
        "from_attributes": True
    }
    
    # Propriedades de compatibilidade
    @property
    def DtCreate(self) -> datetime:
        return self.DatCadastro
    
    @property
    def DtAlter(self) -> Optional[datetime]:
        return self.DatAlteracao