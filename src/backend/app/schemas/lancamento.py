"""
Schemas para lançamentos financeiros
"""
from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional, Literal, List, Generic, TypeVar
from decimal import Decimal

T = TypeVar('T')


class LancamentoBase(BaseModel):
    Data: date = Field(..., description="Data do lançamento")
    DataEmissao: Optional[datetime] = Field(None, description="Data de emissão do documento")
    CodEmpresa: int = Field(..., description="Código da empresa")
    CodConta: int = Field(..., description="Código da conta")
    CodFavorecido: int = Field(..., description="Código do favorecido")
    CodCategoria: int = Field(..., description="Código da categoria")
    Valor: float = Field(..., description="Valor do lançamento")
    IndMov: bool = Field(..., description="Indicador de movimento: True=Entrada, False=Saída")
    NumDocto: Optional[str] = Field(None, description="Número do documento")
    CodFormaPagto: Optional[int] = Field(None, description="Código da forma de pagamento")
    FlgFrequencia: Optional[int] = Field(None, description="Flag de frequência")
    Observacao: Optional[str] = Field(None, description="Observação")
    flg_confirmacao: Optional[bool] = Field(None, description="Flag de confirmação")
    dat_confirmacao: Optional[date] = Field(None, description="Data de confirmação")
    parcela_atual: Optional[int] = Field(None, description="Parcela atual")
    qtd_parcelas: Optional[int] = Field(None, description="Quantidade de parcelas")
    NomUsuario: Optional[str] = Field(None, description="Nome do usuário")


class LancamentoCreate(LancamentoBase):
    """Schema para criação de lançamento"""
    pass


class LancamentoUpdate(BaseModel):
    """Schema para atualização de lançamento"""
    Data: Optional[date] = Field(None, description="Data do lançamento")
    DataEmissao: Optional[datetime] = Field(None, description="Data de emissão do documento")
    CodEmpresa: Optional[int] = Field(None, description="Código da empresa")
    CodConta: Optional[int] = Field(None, description="Código da conta bancária")
    CodFavorecido: Optional[int] = Field(None, description="Código do favorecido")
    CodCategoria: Optional[int] = Field(None, description="Código da categoria")
    Valor: Optional[Decimal] = Field(None, ge=0, description="Valor do lançamento")
    IndMov: Optional[bool] = Field(None, description="Indicador de movimento: True=Entrada, False=Saída")
    NumDocto: Optional[str] = Field(None, max_length=50, description="Número do documento")
    CodFormaPagto: Optional[int] = Field(None, description="Código da forma de pagamento")
    FlgFrequencia: Optional[int] = Field(None, description="Frequência: código numérico da frequência")
    Observacao: Optional[str] = Field(None, max_length=500, description="Observações")


class LancamentoResponse(LancamentoBase):
    """Schema para resposta de lançamento"""
    CodLancamento: int
    flg_confirmacao: bool
    dat_confirmacao: Optional[date] = None
    parcela_atual: Optional[int] = None
    qtd_parcelas: Optional[int] = None
    favorecido_nome: Optional[str] = None
    categoria_nome: Optional[str] = None
    NomUsuario: str
    
    @classmethod
    def from_orm_with_relations(cls, lancamento):
        """Criar response com dados dos relacionamentos"""
        try:
            data = {
                'CodLancamento': lancamento.CodLancamento,
                'Data': lancamento.Data,
                'DataEmissao': getattr(lancamento, 'data_emissao', None),
                'CodEmpresa': lancamento.CodEmpresa or 1,
                'CodConta': lancamento.CodConta,
                'CodFavorecido': lancamento.CodFavorecido,
                'CodCategoria': lancamento.CodCategoria,
                'Valor': float(lancamento.Valor) if lancamento.Valor else 0.0,
                'IndMov': bool(lancamento.IndMov) if lancamento.IndMov is not None else False,
                'NumDocto': lancamento.NumDocto,
                'CodFormaPagto': getattr(lancamento, 'cod_forma_pagto', None),
                'FlgFrequencia': getattr(lancamento, 'flg_frequencia', None),
                'Observacao': getattr(lancamento, 'Comentario', None),
                'flg_confirmacao': bool(getattr(lancamento, 'flg_confirmacao', False)),
                'dat_confirmacao': getattr(lancamento, 'dat_confirmacao', None),
                'parcela_atual': getattr(lancamento, 'parcela_atual', None),
                'qtd_parcelas': getattr(lancamento, 'qtd_parcelas', None),
                'NomUsuario': getattr(lancamento, 'NomUsuario', ''),
                'favorecido_nome': lancamento.favorecido.DesFavorecido if lancamento.favorecido else None,
                'categoria_nome': lancamento.categoria.DesCategoria if lancamento.categoria else None
            }
            return cls(**data)
        except Exception as e:
            # Log do erro para debug
            print(f"Erro ao converter lançamento {getattr(lancamento, 'CodLancamento', 'N/A')}: {str(e)}")
            raise
    
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


class PaginatedResponse(BaseModel, Generic[T]):
    """Schema genérico para respostas paginadas"""
    data: List[T] = Field(..., description="Lista de dados")
    total: int = Field(..., description="Total de registros")
    skip: int = Field(..., description="Registros pulados")
    limit: int = Field(..., description="Limite de registros por página")
    
    class Config:
        from_attributes = True


class LancamentosPaginatedResponse(PaginatedResponse[LancamentoResponse]):
    """Schema para resposta paginada de lançamentos"""
    pass