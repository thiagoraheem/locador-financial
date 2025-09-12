"""
Schemas para categorias financeiras
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal, List


class CategoriaBase(BaseModel):
    """Schema base para categorias"""
    DesCategoria: str = Field(..., max_length=50, description="Descrição da categoria")
    Descricao: Optional[str] = Field(None, max_length=500, description="Descrição da categoria")
    TipoCategoria: Optional[Literal['R', 'D', 'T']] = Field(None, description="Tipo: R=Receita, D=Despesa, T=Transferência")
    CodCategoriaPai: Optional[int] = Field(None, description="Código da categoria pai (para subcategorias)")
    FlgAtivo: Optional[Literal['S', 'N']] = Field(default='S', description="Ativo: S=Sim, N=Não")


class CategoriaCreate(CategoriaBase):
    """Schema para criação de categoria"""
    pass


class CategoriaUpdate(CategoriaBase):
    """Schema para atualização de categoria"""
    pass


class CategoriaResponse(BaseModel):
    """Schema para resposta de categoria"""
    CodCategoria: int
    DesCategoria: str = Field(..., max_length=50, description="Descrição da categoria")
    TipoCategoria: str = Field(..., description="Tipo: R=Receita, D=Despesa")
    FlgAtivo: Literal['S', 'N'] = Field(..., description="Ativo: S=Sim, N=Não")
    CodCategoriaPai: Optional[int] = Field(None, alias="CodPai", description="Código da categoria pai")
    categoria_pai_nome: Optional[str] = None
    subcategorias: List['CategoriaResponse'] = Field(default_factory=list)
    NomUsuario: str = Field(..., description="Nome do usuário que criou")
    DtCreate: datetime = Field(..., description="Data de criação")
    DtAlter: Optional[datetime] = Field(None, alias="DateUpdate", description="Data de alteração")
    
    class Config:
        from_attributes = True
        populate_by_name = True


# Update forward reference
CategoriaResponse.model_rebuild()