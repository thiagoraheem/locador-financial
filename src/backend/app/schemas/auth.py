"""
Schemas de autenticação
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class LoginRequest(BaseModel):
    """Schema para requisição de login"""
    login: str = Field(..., min_length=1, max_length=50, description="Login do usuário")
    senha: str = Field(..., min_length=1, description="Senha do usuário")


class UserInfo(BaseModel):
    """Schema com informações do usuário autenticado"""
    cod_funcionario: int
    nome: str
    login: str
    email: Optional[str] = None
    cod_setor: Optional[int] = None
    cod_funcao: Optional[int] = None
    is_active: bool = True


class LoginResponse(BaseModel):
    """Schema para resposta do login"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_info: UserInfo


class TokenData(BaseModel):
    """Schema para dados extraídos do token JWT"""
    cod_funcionario: Optional[int] = None
    login: Optional[str] = None
    nome: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    """Schema para requisição de refresh do token"""
    refresh_token: str