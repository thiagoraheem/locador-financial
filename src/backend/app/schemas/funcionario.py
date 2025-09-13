"""Schemas para funcionários"""
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime, date
from typing import Optional, Literal
from decimal import Decimal


class FuncionarioBase(BaseModel):
    """Schema base para funcionários"""
    NumCTPS: Optional[str] = Field(None, max_length=15, description="Número da CTPS")
    CPF: Optional[str] = Field(None, max_length=14, description="CPF")
    Nome: str = Field(..., max_length=50, description="Nome do funcionário")
    Telefone: Optional[str] = Field(None, max_length=16, description="Telefone")
    Endereco: Optional[str] = Field(None, max_length=100, description="Endereço")
    Bairro: Optional[str] = Field(None, max_length=50, description="Bairro")
    Cidade: Optional[str] = Field(None, max_length=50, description="Cidade")
    UF: Optional[str] = Field(None, max_length=2, description="Estado (UF)")
    CEP: Optional[str] = Field(None, max_length=10, description="CEP")
    RG: Optional[str] = Field(None, max_length=20, description="RG")
    DatNascimento: Optional[date] = Field(None, description="Data de nascimento")
    DatAdmissao: Optional[datetime] = Field(None, description="Data de admissão")
    DatDemissao: Optional[datetime] = Field(None, description="Data de demissão")
    Salario: Optional[Decimal] = Field(None, description="Salário")
    Login: Optional[str] = Field(None, max_length=15, description="Login do usuário")
    Senha: Optional[str] = Field(None, max_length=50, description="Senha")
    Email: Optional[str] = Field(None, max_length=100, description="E-mail")
    Observacao: Optional[str] = Field(None, description="Observações")
    
    # Campos de comissão e relacionamentos
    FlgComissao: Optional[bool] = Field(default=False, description="Recebe comissão")
    ValComissao: Optional[Decimal] = Field(None, description="Valor da comissão")
    VlrDesconto: Optional[Decimal] = Field(None, description="Valor de desconto")
    CodSetor: Optional[int] = Field(None, description="Código do setor")
    CodFavorecido: Optional[int] = Field(None, description="Código do favorecido")
    CodFuncao: Optional[int] = Field(None, description="Código da função")


class FuncionarioCreate(FuncionarioBase):
    """Schema para criação de funcionário"""
    pass


class FuncionarioUpdate(BaseModel):
    """Schema para atualização de funcionário"""
    NumCTPS: Optional[str] = Field(None, max_length=15, description="Número da CTPS")
    CPF: Optional[str] = Field(None, max_length=14, description="CPF")
    Nome: Optional[str] = Field(None, max_length=50, description="Nome do funcionário")
    Telefone: Optional[str] = Field(None, max_length=16, description="Telefone")
    Endereco: Optional[str] = Field(None, max_length=100, description="Endereço")
    Bairro: Optional[str] = Field(None, max_length=50, description="Bairro")
    Cidade: Optional[str] = Field(None, max_length=50, description="Cidade")
    UF: Optional[str] = Field(None, max_length=2, description="Estado (UF)")
    CEP: Optional[str] = Field(None, max_length=10, description="CEP")
    RG: Optional[str] = Field(None, max_length=20, description="RG")
    DatNascimento: Optional[date] = Field(None, description="Data de nascimento")
    DatAdmissao: Optional[date] = Field(None, description="Data de admissão")
    DatDemissao: Optional[date] = Field(None, description="Data de demissão")
    Salario: Optional[Decimal] = Field(None, description="Salário")
    Login: Optional[str] = Field(None, max_length=15, description="Login do usuário")
    Senha: Optional[str] = Field(None, max_length=15, description="Senha")
    Email: Optional[str] = Field(None, max_length=100, description="E-mail")
    Observacao: Optional[str] = Field(None, description="Observações")


class FuncionarioResponse(FuncionarioBase):
    """Schema para resposta de funcionário"""
    CodFuncionario: int
    NomUsuario: str
    DatCadastro: datetime
    NomUsuarioAlteracao: Optional[str] = None
    DatAlteracao: Optional[datetime] = None
    
    model_config = {
        "from_attributes": True
    }
    
    # Propriedades de compatibilidade
    @property
    def DtCreate(self) -> datetime:
        return self.DatCadastro
    
    @property
    def DtAlter(self) -> Optional[datetime]:
        return self.DatAlteracao
    
    @property
    def is_active(self) -> bool:
        """Verifica se o funcionário está ativo (não demitido)"""
        return self.DatDemissao is None