"""
Schemas para categorias financeiras
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal, List


class CategoriaBase(BaseModel):
    """Schema base para categorias"""
    DesCategoria: str = Field(..., max_length=50, description="Descrição da categoria")
    flgTipo: Optional[str] = Field(None, max_length=1, description="Tipo da categoria")
    CodGrupoCategoria: Optional[int] = Field(None, description="Código do grupo da categoria")
    CodPai: Optional[int] = Field(None, description="Código da categoria pai (para subcategorias)")
    idCostCenter: Optional[int] = Field(None, description="ID do centro de custo")
    idChartsOfAccount: Optional[int] = Field(None, description="ID do plano de contas")
    FlgAtivo: Optional[str] = Field(default='1', max_length=1, description="Ativo: 1=Sim, 0=Não")


class CategoriaCreate(CategoriaBase):
    """Schema para criação de categoria"""
    pass


class CategoriaUpdate(CategoriaBase):
    """Schema para atualização de categoria"""
    pass


class CategoriaResponse(CategoriaBase):
    """Schema para resposta de categoria"""
    CodCategoria: int
    NomUsuario: Optional[str] = None
    DatCadastro: Optional[datetime] = None
    NomUsuarioAlteracao: Optional[str] = None
    DatAlteracao: Optional[datetime] = None
    
    model_config = {
        "from_attributes": True
    }
    
    # Propriedades de compatibilidade
    @property
    def DtCreate(self) -> Optional[datetime]:
        return self.DatCadastro
    
    @property
    def DtAlter(self) -> Optional[datetime]:
        return self.DatAlteracao
    
    @property
    def TipoCategoria(self) -> Optional[str]:
        return self.flgTipo
    
    @property
    def CodCategoriaPai(self) -> Optional[int]:
        return self.CodPai


# Update forward reference
CategoriaResponse.model_rebuild()