"""
Schemas para lançamentos financeiros
"""
from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional, Literal


class LancamentoBase(BaseModel):
    """Schema base para lançamentos"""
    Data: datetime = Field(..., description="Data do lançamento")
    DataEmissao: datetime = Field(..., description="Data de emissão do documento")
    CodEmpresa: Optional[int] = Field(None, description="Código da empresa")
    CodConta: Optional[int] = Field(None, description="Código da conta bancária")
    CodFavorecido: int = Field(..., description="Código do favorecido")
    CodCategoria: int = Field(..., description="Código da categoria")
    Valor: Decimal = Field(..., gt=0, description="Valor do lançamento")
    IndMov: bool = Field(..., description="Indicador de movimento: True=Entrada, False=Saída")
    NumDocto: Optional[str] = Field(None, max_length=50, description="Número do documento")
    CodFormaPagto: int = Field(..., description="Código da forma de pagamento")
    FlgFrequencia: Literal['U', 'R'] = Field(..., description="Frequência: U=Único, R=Recorrente")
    Observacao: Optional[str] = Field(None, max_length=500, description="Observações")


class LancamentoCreate(LancamentoBase):
    """Schema para criação de lançamento"""
    pass


class LancamentoUpdate(BaseModel):
    """Schema para atualização de lançamento"""
    Data: Optional[datetime] = Field(None, description="Data do lançamento")
    DataEmissao: Optional[datetime] = Field(None, description="Data de emissão do documento")
    CodEmpresa: Optional[int] = Field(None, description="Código da empresa")
    CodConta: Optional[int] = Field(None, description="Código da conta bancária")
    CodFavorecido: Optional[int] = Field(None, description="Código do favorecido")
    CodCategoria: Optional[int] = Field(None, description="Código da categoria")
    Valor: Optional[Decimal] = Field(None, gt=0, description="Valor do lançamento")
    IndMov: Optional[bool] = Field(None, description="Indicador de movimento: True=Entrada, False=Saída")
    NumDocto: Optional[str] = Field(None, max_length=50, description="Número do documento")
    CodFormaPagto: Optional[int] = Field(None, description="Código da forma de pagamento")
    FlgFrequencia: Optional[Literal['U', 'R']] = Field(None, description="Frequência: U=Único, R=Recorrente")
    Observacao: Optional[str] = Field(None, max_length=500, description="Observações")


class LancamentoResponse(LancamentoBase):
    """Schema para resposta de lançamento"""
    CodLancamento: int
    FlgConfirmacao: bool
    favorecido_nome: Optional[str] = None
    categoria_nome: Optional[str] = None  
    forma_pagamento_nome: Optional[str] = None
    empresa_nome: Optional[str] = None
    conta_nome: Optional[str] = None
    NomUsuario: str
    DtCreate: datetime
    DtAlter: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class LancamentoFilter(BaseModel):
    """Schema para filtros de lançamentos"""
    data_inicio: Optional[datetime] = Field(None, description="Data inicial do filtro")
    data_fim: Optional[datetime] = Field(None, description="Data final do filtro")
    cod_categoria: Optional[int] = Field(None, description="Filtrar por categoria")
    cod_favorecido: Optional[int] = Field(None, description="Filtrar por favorecido")
    cod_empresa: Optional[int] = Field(None, description="Filtrar por empresa")
    cod_conta: Optional[int] = Field(None, description="Filtrar por conta bancária")
    ind_mov: Optional[Literal['E', 'S']] = Field(None, description="Filtrar por tipo de movimento")
    confirmado: Optional[bool] = Field(None, description="Filtrar por status de confirmação")
    valor_min: Optional[Decimal] = Field(None, ge=0, description="Valor mínimo")
    valor_max: Optional[Decimal] = Field(None, ge=0, description="Valor máximo")
    num_docto: Optional[str] = Field(None, max_length=50, description="Número do documento")
    order_by: Optional[Literal['data_desc', 'data_asc', 'valor_desc', 'valor_asc']] = Field(
        'data_desc', description="Ordenação dos resultados"
    )
    
    
class LancamentoConfirm(BaseModel):
    """Schema para confirmação de lançamento"""
    confirmar: bool = Field(..., description="True para confirmar, False para cancelar confirmação")