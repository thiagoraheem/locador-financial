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
    CodFavorecido: int = Field(..., description="Código do favorecido")
    CodCategoria: int = Field(..., description="Código da categoria")
    Valor: Decimal = Field(..., gt=0, description="Valor do lançamento")
    IndMov: Literal['E', 'S'] = Field(..., description="Indicador de movimento: E=Entrada, S=Saída")
    NumDocto: Optional[str] = Field(None, max_length=50, description="Número do documento")
    CodFormaPagto: int = Field(..., description="Código da forma de pagamento")
    FlgFrequencia: Literal['U', 'R'] = Field(..., description="Frequência: U=Único, R=Recorrente")
    Observacao: Optional[str] = Field(None, max_length=500, description="Observações")


class LancamentoCreate(LancamentoBase):
    """Schema para criação de lançamento"""
    pass


class LancamentoUpdate(LancamentoBase):
    """Schema para atualização de lançamento"""
    pass


class LancamentoResponse(LancamentoBase):
    """Schema para resposta de lançamento"""
    CodLancamento: int
    FlgConfirmacao: bool
    favorecido_nome: Optional[str] = None
    categoria_nome: Optional[str] = None  
    forma_pagamento_nome: Optional[str] = None
    NomUsuario: str
    DtCreate: datetime
    DtAlter: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class LancamentoFilter(BaseModel):
    """Schema para filtros de lançamentos"""
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    cod_categoria: Optional[int] = None
    cod_favorecido: Optional[int] = None
    ind_mov: Optional[Literal['E', 'S']] = None
    confirmado: Optional[bool] = None
    
    
class LancamentoConfirm(BaseModel):
    """Schema para confirmação de lançamento"""
    confirmar: bool = Field(..., description="True para confirmar, False para cancelar confirmação")