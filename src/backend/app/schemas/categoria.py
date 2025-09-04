"""
Schemas para categorias financeiras
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal, List


class CategoriaBase(BaseModel):
    """Schema base para categorias"""
    NomCategoria: str = Field(..., max_length=100, description="Nome da categoria")
    Descricao: Optional[str] = Field(None, max_length=500, description="Descrição da categoria")
    TipoCategoria: Literal['R', 'D', 'T'] = Field(..., description="Tipo: R=Receita, D=Despesa, T=Transferência")
    CodCategoriaPai: Optional[int] = Field(None, description="Código da categoria pai (para subcategorias)")
    FlgAtivo: Literal['S', 'N'] = Field(default='S', description="Ativo: S=Sim, N=Não")


class CategoriaCreate(CategoriaBase):
    """Schema para criação de categoria"""
    pass


class CategoriaUpdate(CategoriaBase):
    """Schema para atualização de categoria"""
    pass


class CategoriaResponse(CategoriaBase):
    """Schema para resposta de categoria"""
    CodCategoria: int
    categoria_pai_nome: Optional[str] = None
    subcategorias: Optional[List['CategoriaResponse']] = None
    NomUsuario: str
    DtCreate: datetime
    DtAlter: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Update forward reference
CategoriaResponse.model_rebuild()