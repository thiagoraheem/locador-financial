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
    TipoCategoria: str = Field(..., alias="flgTipo", description="Tipo: R=Receita, D=Despesa")
    FlgAtivo: str = Field(..., description="Ativo: S=Sim, N=Não")
    CodCategoriaPai: Optional[int] = Field(None, alias="CodPai", description="Código da categoria pai")
    categoria_pai_nome: Optional[str] = None
    subcategorias: List['CategoriaResponse'] = Field(default_factory=list)
    NomUsuario: str = Field(..., description="Nome do usuário que criou")
    DtCreate: datetime = Field(..., alias="DateCreate", description="Data de criação")
    DtAlter: Optional[datetime] = Field(None, alias="DateUpdate", description="Data de alteração")
    
    model_config = {
        "from_attributes": True,
        "populate_by_name": True
    }
    
    @classmethod
    def from_orm(cls, obj):
        """Converte objeto ORM para schema com tratamento especial"""
        # Converter FlgAtivo de '1'/'0' para 'S'/'N'
        flg_ativo = obj.FlgAtivo
        if flg_ativo == '1':
            flg_ativo = 'S'
        elif flg_ativo == '0':
            flg_ativo = 'N'
        
        # Garantir que subcategorias seja sempre uma lista
        subcategorias = []
        if hasattr(obj, '_subcategorias_rel') and obj._subcategorias_rel:
            if isinstance(obj._subcategorias_rel, list):
                subcategorias = [cls.from_orm(sub) for sub in obj._subcategorias_rel]
            else:
                subcategorias = [cls.from_orm(obj._subcategorias_rel)]
        
        return cls(
            CodCategoria=obj.CodCategoria,
            DesCategoria=obj.DesCategoria,
            TipoCategoria=obj.flgTipo,
            FlgAtivo=flg_ativo,
            CodCategoriaPai=obj.CodPai,
            categoria_pai_nome=None,
            subcategorias=subcategorias,
            NomUsuario=obj.NomUsuario,
            DtCreate=obj.DateCreate,
            DtAlter=obj.DateUpdate
        )


# Update forward reference
CategoriaResponse.model_rebuild()