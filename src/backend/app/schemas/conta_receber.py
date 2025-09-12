"""
Schemas para contas a receber
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from decimal import Decimal


class AccountsReceivableBase(BaseModel):
    """Schema base para contas a receber"""
    CodEmpresa: int = Field(..., gt=0, description="Código da empresa")
    CodCliente: int = Field(..., gt=0, description="Código do cliente")
    idConta: Optional[int] = Field(None, gt=0, description="Código da conta bancária")
    CodCategoria: Optional[int] = Field(None, gt=0, description="Código da categoria")
    
    # Datas
    DataEmissao: datetime = Field(..., description="Data de emissão")
    DataVencimento: datetime = Field(..., description="Data de vencimento")
    DataRecebimento: Optional[datetime] = Field(None, description="Data do recebimento")
    
    # Valores
    Valor: Decimal = Field(..., gt=0, description="Valor original")
    ValorRecebido: Optional[Decimal] = Field(None, ge=0, description="Valor já recebido")
    Desconto: Optional[Decimal] = Field(None, ge=0, description="Desconto concedido")
    Juros: Optional[Decimal] = Field(None, ge=0, description="Juros aplicados")
    Multa: Optional[Decimal] = Field(None, ge=0, description="Multa aplicada")
    
    # Controle
    Status: str = Field(default='A', max_length=1, description="A=Aberto, R=Recebido, V=Vencido, C=Cancelado")
    NumeroDocumento: Optional[str] = Field(None, max_length=50, description="Número do documento/nota fiscal")
    NumParcela: Optional[int] = Field(1, ge=1, description="Número da parcela")
    TotalParcelas: Optional[int] = Field(1, ge=1, description="Total de parcelas")
    
    # Controle de inadimplência
    DiasAtraso: Optional[int] = Field(0, ge=0, description="Dias em atraso")
    FlgProtestado: Optional[bool] = Field(False, description="Se foi protestado")
    DataProtesto: Optional[datetime] = Field(None, description="Data do protesto")
    
    # Informações adicionais
    Observacao: Optional[str] = Field(None, description="Observações")
    NotaFiscal: Optional[str] = Field(None, max_length=50, description="Número da nota fiscal")
    SerieNF: Optional[str] = Field(None, max_length=10, description="Série da nota fiscal")


class AccountsReceivableCreate(AccountsReceivableBase):
    """Schema para criação de conta a receber"""
    pass


class AccountsReceivableUpdate(BaseModel):
    """Schema para atualização de conta a receber"""
    CodEmpresa: Optional[int] = Field(None, gt=0, description="Código da empresa")
    CodCliente: Optional[int] = Field(None, gt=0, description="Código do cliente")
    idConta: Optional[int] = Field(None, gt=0, description="Código da conta bancária")
    CodCategoria: Optional[int] = Field(None, gt=0, description="Código da categoria")
    
    # Datas
    DataEmissao: Optional[datetime] = Field(None, description="Data de emissão")
    DataVencimento: Optional[datetime] = Field(None, description="Data de vencimento")
    DataRecebimento: Optional[datetime] = Field(None, description="Data do recebimento")
    
    # Valores
    Valor: Optional[Decimal] = Field(None, gt=0, description="Valor original")
    ValorRecebido: Optional[Decimal] = Field(None, ge=0, description="Valor já recebido")
    Desconto: Optional[Decimal] = Field(None, ge=0, description="Desconto concedido")
    Juros: Optional[Decimal] = Field(None, ge=0, description="Juros aplicados")
    Multa: Optional[Decimal] = Field(None, ge=0, description="Multa aplicada")
    
    # Controle
    Status: Optional[str] = Field(None, max_length=1, description="A=Aberto, R=Recebido, V=Vencido, C=Cancelado")
    NumeroDocumento: Optional[str] = Field(None, max_length=50, description="Número do documento/nota fiscal")
    NumParcela: Optional[int] = Field(None, ge=1, description="Número da parcela")
    TotalParcelas: Optional[int] = Field(None, ge=1, description="Total de parcelas")
    
    # Controle de inadimplência
    DiasAtraso: Optional[int] = Field(None, ge=0, description="Dias em atraso")
    FlgProtestado: Optional[bool] = Field(None, description="Se foi protestado")
    DataProtesto: Optional[datetime] = Field(None, description="Data do protesto")
    
    # Informações adicionais
    Observacao: Optional[str] = Field(None, description="Observações")
    NotaFiscal: Optional[str] = Field(None, max_length=50, description="Número da nota fiscal")
    SerieNF: Optional[str] = Field(None, max_length=10, description="Série da nota fiscal")


class AccountsReceivableResponse(AccountsReceivableBase):
    """Schema para resposta de conta a receber"""
    CodAccountsReceivable: int
    NomUsuario: str
    DtCreate: datetime
    DtAlter: Optional[datetime] = None
    cliente_nome: Optional[str] = Field(None, description="Nome do cliente")
    
    model_config = {
        "from_attributes": True
    }


class AccountsReceivablePaymentBase(BaseModel):
    """Schema base para recebimentos de contas a receber"""
    CodAccountsReceivable: int = Field(..., gt=0, description="Código da conta a receber")
    idConta: Optional[int] = Field(None, gt=0, description="Código da conta bancária do recebimento")
    CodFormaPagto: Optional[int] = Field(None, gt=0, description="Código da forma de recebimento")
    
    DataRecebimento: datetime = Field(..., description="Data do recebimento")
    ValorRecebido: Decimal = Field(..., gt=0, description="Valor do recebimento")
    Desconto: Optional[Decimal] = Field(None, ge=0, description="Desconto concedido")
    Juros: Optional[Decimal] = Field(None, ge=0, description="Juros recebidos")
    Multa: Optional[Decimal] = Field(None, ge=0, description="Multa recebida")
    
    NumeroDocumento: Optional[str] = Field(None, max_length=50, description="Número do documento de recebimento")
    Observacao: Optional[str] = Field(None, description="Observações do recebimento")


class AccountsReceivablePaymentCreate(AccountsReceivablePaymentBase):
    """Schema para criação de recebimento de conta a receber"""
    pass


class AccountsReceivablePaymentUpdate(BaseModel):
    """Schema para atualização de recebimento de conta a receber"""
    idConta: Optional[int] = Field(None, gt=0, description="Código da conta bancária do recebimento")
    CodFormaPagto: Optional[int] = Field(None, gt=0, description="Código da forma de recebimento")
    
    DataRecebimento: Optional[datetime] = Field(None, description="Data do recebimento")
    ValorRecebido: Optional[Decimal] = Field(None, gt=0, description="Valor do recebimento")
    Desconto: Optional[Decimal] = Field(None, ge=0, description="Desconto concedido")
    Juros: Optional[Decimal] = Field(None, ge=0, description="Juros recebidos")
    Multa: Optional[Decimal] = Field(None, ge=0, description="Multa recebida")
    
    NumeroDocumento: Optional[str] = Field(None, max_length=50, description="Número do documento de recebimento")
    Observacao: Optional[str] = Field(None, description="Observações do recebimento")


class AccountsReceivablePaymentResponse(AccountsReceivablePaymentBase):
    """Schema para resposta de recebimento de conta a receber"""
    CodPayment: int
    NomUsuario: str
    DtCreate: datetime
    DtAlter: Optional[datetime] = None
    
    model_config = {
        "from_attributes": True
    }