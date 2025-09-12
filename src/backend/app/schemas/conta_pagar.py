"""
Schemas para contas a pagar
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from decimal import Decimal


class AccountsPayableBase(BaseModel):
    """Schema base para contas a pagar"""
    CodEmpresa: int = Field(..., gt=0, description="Código da empresa")
    CodFornecedor: int = Field(..., gt=0, description="Código do fornecedor")
    idConta: Optional[int] = Field(None, gt=0, description="Código da conta bancária")
    CodCategoria: Optional[int] = Field(None, gt=0, description="Código da categoria")
    
    # Datas
    DataEmissao: datetime = Field(..., description="Data de emissão")
    DataVencimento: datetime = Field(..., description="Data de vencimento")
    DataPagamento: Optional[datetime] = Field(None, description="Data do pagamento")
    
    # Valores
    Valor: Decimal = Field(..., gt=0, description="Valor original")
    ValorPago: Optional[Decimal] = Field(None, ge=0, description="Valor já pago")
    Desconto: Optional[Decimal] = Field(None, ge=0, description="Desconto aplicado")
    Juros: Optional[Decimal] = Field(None, ge=0, description="Juros aplicados")
    Multa: Optional[Decimal] = Field(None, ge=0, description="Multa aplicada")
    
    # Controle
    Status: str = Field(default='A', max_length=1, description="A=Aberto, P=Pago, V=Vencido, C=Cancelado")
    NumeroDocumento: Optional[str] = Field(None, max_length=50, description="Número do documento/nota fiscal")
    NumParcela: Optional[int] = Field(1, ge=1, description="Número da parcela")
    TotalParcelas: Optional[int] = Field(1, ge=1, description="Total de parcelas")
    
    # Informações adicionais
    Observacao: Optional[str] = Field(None, description="Observações")
    CodigoBarras: Optional[str] = Field(None, max_length=100, description="Código de barras do boleto")
    LinhaDigitavel: Optional[str] = Field(None, max_length=100, description="Linha digitável do boleto")


class AccountsPayableCreate(AccountsPayableBase):
    """Schema para criação de conta a pagar"""
    pass


class AccountsPayableUpdate(BaseModel):
    """Schema para atualização de conta a pagar"""
    CodEmpresa: Optional[int] = Field(None, gt=0, description="Código da empresa")
    CodFornecedor: Optional[int] = Field(None, gt=0, description="Código do fornecedor")
    idConta: Optional[int] = Field(None, gt=0, description="Código da conta bancária")
    CodCategoria: Optional[int] = Field(None, gt=0, description="Código da categoria")
    
    # Datas
    DataEmissao: Optional[datetime] = Field(None, description="Data de emissão")
    DataVencimento: Optional[datetime] = Field(None, description="Data de vencimento")
    DataPagamento: Optional[datetime] = Field(None, description="Data do pagamento")
    
    # Valores
    Valor: Optional[Decimal] = Field(None, gt=0, description="Valor original")
    ValorPago: Optional[Decimal] = Field(None, ge=0, description="Valor já pago")
    Desconto: Optional[Decimal] = Field(None, ge=0, description="Desconto aplicado")
    Juros: Optional[Decimal] = Field(None, ge=0, description="Juros aplicados")
    Multa: Optional[Decimal] = Field(None, ge=0, description="Multa aplicada")
    
    # Controle
    Status: Optional[str] = Field(None, max_length=1, description="A=Aberto, P=Pago, V=Vencido, C=Cancelado")
    NumeroDocumento: Optional[str] = Field(None, max_length=50, description="Número do documento/nota fiscal")
    NumParcela: Optional[int] = Field(None, ge=1, description="Número da parcela")
    TotalParcelas: Optional[int] = Field(None, ge=1, description="Total de parcelas")
    
    # Informações adicionais
    Observacao: Optional[str] = Field(None, description="Observações")
    CodigoBarras: Optional[str] = Field(None, max_length=100, description="Código de barras do boleto")
    LinhaDigitavel: Optional[str] = Field(None, max_length=100, description="Linha digitável do boleto")


class AccountsPayableResponse(AccountsPayableBase):
    """Schema para resposta de conta a pagar"""
    CodAccountsPayable: int
    NomUsuario: str
    DtCreate: datetime
    DtAlter: Optional[datetime] = None
    fornecedor_nome: Optional[str] = Field(None, description="Nome do fornecedor")
    
    model_config = {
        "from_attributes": True
    }


class AccountsPayablePaymentBase(BaseModel):
    """Schema base para pagamentos de contas a pagar"""
    CodAccountsPayable: int = Field(..., gt=0, description="Código da conta a pagar")
    idConta: Optional[int] = Field(None, gt=0, description="Código da conta bancária do pagamento")
    CodFormaPagto: Optional[int] = Field(None, gt=0, description="Código da forma de pagamento")
    
    DataPagamento: datetime = Field(..., description="Data do pagamento")
    ValorPago: Decimal = Field(..., gt=0, description="Valor do pagamento")
    Desconto: Optional[Decimal] = Field(None, ge=0, description="Desconto concedido")
    Juros: Optional[Decimal] = Field(None, ge=0, description="Juros cobrados")
    Multa: Optional[Decimal] = Field(None, ge=0, description="Multa cobrada")
    
    NumeroDocumento: Optional[str] = Field(None, max_length=50, description="Número do documento de pagamento")
    Observacao: Optional[str] = Field(None, description="Observações do pagamento")


class AccountsPayablePaymentCreate(AccountsPayablePaymentBase):
    """Schema para criação de pagamento de conta a pagar"""
    pass


class AccountsPayablePaymentUpdate(BaseModel):
    """Schema para atualização de pagamento de conta a pagar"""
    idConta: Optional[int] = Field(None, gt=0, description="Código da conta bancária do pagamento")
    CodFormaPagto: Optional[int] = Field(None, gt=0, description="Código da forma de pagamento")
    
    DataPagamento: Optional[datetime] = Field(None, description="Data do pagamento")
    ValorPago: Optional[Decimal] = Field(None, gt=0, description="Valor do pagamento")
    Desconto: Optional[Decimal] = Field(None, ge=0, description="Desconto concedido")
    Juros: Optional[Decimal] = Field(None, ge=0, description="Juros cobrados")
    Multa: Optional[Decimal] = Field(None, ge=0, description="Multa cobrada")
    
    NumeroDocumento: Optional[str] = Field(None, max_length=50, description="Número do documento de pagamento")
    Observacao: Optional[str] = Field(None, description="Observações do pagamento")


class AccountsPayablePaymentResponse(AccountsPayablePaymentBase):
    """Schema para resposta de pagamento de conta a pagar"""
    CodPayment: int
    NomUsuario: str
    DtCreate: datetime
    DtAlter: Optional[datetime] = None
    
    model_config = {
        "from_attributes": True
    }