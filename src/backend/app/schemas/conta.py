"""
Schemas for Conta (Bank Account) module
"""
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, Literal
from decimal import Decimal


class ContaBase(BaseModel):
    """Base schema for Conta"""
    CodEmpresa: int = Field(..., description="Empresa proprietária")
    Banco: int = Field(..., description="Banco da conta")
    Agencia: str = Field(..., max_length=10, description="Número da agência")
    AgenciaDigito: Optional[str] = Field(None, max_length=1, description="Dígito verificador da agência")
    Conta: str = Field(..., max_length=20, description="Número da conta")
    ContaDigito: Optional[str] = Field(None, max_length=2, description="Dígito verificador da conta")
    NomConta: str = Field(..., max_length=100, description="Nome/descrição da conta")
    TipoConta: Literal['CC', 'CP', 'CS'] = Field(default='CC', description="CC=Conta Corrente, CP=Poupança, CS=Salário")
    Saldo: Decimal = Field(default=0, description="Saldo atual da conta")
    FlgContaPadrao: bool = Field(default=False, description="Indica se é a conta padrão da empresa")
    FlgAtivo: Literal['S', 'N'] = Field(default='S', description="S=Ativo, N=Inativo")
    TipoPix: Optional[str] = Field(None, max_length=10, description="Tipo de chave PIX: CPF, CNPJ, TELEFONE, EMAIL, ALEATORIA")
    ValorPix: Optional[str] = Field(None, max_length=100, description="Valor da chave PIX")
    EnableAPI: bool = Field(default=False, description="Habilita integração via API bancária")
    ConfiguracaoAPI: Optional[str] = Field(None, description="Configurações da API bancária (JSON)")


class ContaCreate(ContaBase):
    """Schema for creating Conta"""
    pass


class ContaUpdate(ContaBase):
    """Schema for updating Conta"""
    CodEmpresa: Optional[int] = Field(None, description="Empresa proprietária")
    Banco: Optional[int] = Field(None, description="Banco da conta")
    Agencia: Optional[str] = Field(None, max_length=10, description="Número da agência")
    Conta: Optional[str] = Field(None, max_length=20, description="Número da conta")
    NomConta: Optional[str] = Field(None, max_length=100, description="Nome/descrição da conta")


class ContaResponse(ContaBase):
    """Schema for Conta response"""
    idConta: int
    NomUsuario: str
    DtCreate: datetime
    DtAlter: Optional[datetime] = None

    class Config:
        from_attributes = True

    @property
    def agencia_completa(self) -> str:
        """Retorna agência com dígito"""
        if self.AgenciaDigito:
            return f"{self.Agencia}-{self.AgenciaDigito}"
        return self.Agencia

    @property
    def conta_completa(self) -> str:
        """Retorna conta com dígito"""
        if self.ContaDigito:
            return f"{self.Conta}-{self.ContaDigito}"
        return self.Conta

    @property
    def is_active(self) -> bool:
        """Verifica se a conta está ativa"""
        return self.FlgAtivo == 'S'

    @property
    def is_default(self) -> bool:
        """Verifica se é a conta padrão da empresa"""
        return self.FlgContaPadrao

    @property
    def has_pix(self) -> bool:
        """Verifica se a conta tem PIX configurado"""
        return self.TipoPix is not None and self.ValorPix is not None

    def get_saldo_formatado(self) -> str:
        """Retorna saldo formatado em reais"""
        return f"R$ {self.Saldo:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')