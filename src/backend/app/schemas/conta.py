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
    Agencia: Optional[str] = Field(None, max_length=4, description="Número da agência")
    AgenciaDigito: Optional[str] = Field(None, max_length=4, description="Dígito verificador da agência")
    Conta: Optional[str] = Field(None, max_length=15, description="Número da conta")
    ContaDigito: Optional[str] = Field(None, max_length=4, description="Dígito verificador da conta")
    OperacaoConta: Optional[str] = Field(None, max_length=15, description="Operação da conta")
    Convenio: Optional[str] = Field(None, max_length=10, description="Convênio")
    NomConta: str = Field(..., max_length=50, description="Nome/descrição da conta")
    Saldo: Decimal = Field(default=0, description="Saldo atual da conta")
    TipoPix: Optional[str] = Field(None, max_length=10, description="Tipo de chave PIX")
    ValorPix: Optional[str] = Field(None, max_length=100, description="Valor da chave PIX")
    FlgContaPadrao: bool = Field(default=False, description="Indica se é a conta padrão da empresa")
    Carteira: Optional[str] = Field(None, max_length=5, description="Carteira")
    VariacaoCarteira: Optional[str] = Field(None, max_length=5, description="Variação da carteira")
    EnableAPI: bool = Field(default=False, description="Habilita integração via API bancária")
    ConfiguracaoAPI: Optional[str] = Field(None, description="Configurações da API bancária (JSON)")


class ContaCreate(ContaBase):
    """Schema for creating Conta"""
    pass


class ContaUpdate(BaseModel):
    """Schema for updating Conta"""
    CodEmpresa: Optional[int] = Field(None, description="Empresa proprietária")
    Banco: Optional[int] = Field(None, description="Banco da conta")
    Agencia: Optional[str] = Field(None, max_length=4, description="Número da agência")
    AgenciaDigito: Optional[str] = Field(None, max_length=4, description="Dígito verificador da agência")
    Conta: Optional[str] = Field(None, max_length=15, description="Número da conta")
    ContaDigito: Optional[str] = Field(None, max_length=4, description="Dígito verificador da conta")
    OperacaoConta: Optional[str] = Field(None, max_length=15, description="Operação da conta")
    Convenio: Optional[str] = Field(None, max_length=10, description="Convênio")
    NomConta: Optional[str] = Field(None, max_length=50, description="Nome/descrição da conta")
    Saldo: Optional[Decimal] = Field(None, description="Saldo atual da conta")
    TipoPix: Optional[str] = Field(None, max_length=10, description="Tipo de chave PIX")
    ValorPix: Optional[str] = Field(None, max_length=100, description="Valor da chave PIX")
    FlgContaPadrao: Optional[bool] = Field(None, description="Indica se é a conta padrão da empresa")
    Carteira: Optional[str] = Field(None, max_length=5, description="Carteira")
    VariacaoCarteira: Optional[str] = Field(None, max_length=5, description="Variação da carteira")
    EnableAPI: Optional[bool] = Field(None, description="Habilita integração via API bancária")
    ConfiguracaoAPI: Optional[str] = Field(None, description="Configurações da API bancária (JSON)")


class ContaResponse(ContaBase):
    """Schema for Conta response"""
    idConta: int
    DatCadastro: datetime
    NomUsuario: str
    DatAlteracao: Optional[datetime] = None
    NomUsuarioAlteracao: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

    @property
    def agencia_completa(self) -> str:
        """Retorna agência com dígito"""
        if self.Agencia and self.AgenciaDigito:
            return f"{self.Agencia}-{self.AgenciaDigito}"
        return self.Agencia or ""

    @property
    def conta_completa(self) -> str:
        """Retorna conta com dígito"""
        if self.Conta and self.ContaDigito:
            return f"{self.Conta}-{self.ContaDigito}"
        return self.Conta or ""

    @property
    def is_active(self) -> bool:
        """Verifica se a conta está ativa - sempre True pois não há campo FlgAtivo"""
        return True

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