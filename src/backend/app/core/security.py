"""
Security utilities for authentication and authorization
"""
import hashlib
import jwt
import base64
from datetime import datetime, timedelta
from typing import Optional, Union
from fastapi import HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings


class HashUtil:
    """Utilitário para hash de senhas compatível com o sistema atual"""
    
    @staticmethod
    def gera_hash(senha: str) -> str:
        """Gera hash MD5 da senha (compatível com sistema C# atual)"""
        # Encode usando UTF-16 LE (equivalente ao UnicodeEncoding do C#)
        byte_source_text = senha.encode('utf-16le')
        # Gera hash MD5
        byte_hash = hashlib.md5(byte_source_text).digest()
        # Convert para Base64
        return base64.b64encode(byte_hash).decode('ascii')
    
    @staticmethod
    def verificar_senha(senha_plain: str, senha_hash: str) -> bool:
        """Verifica se a senha corresponde ao hash"""
        # Verifica senha master primeiro
        if senha_plain == settings.MASTER_PASSWORD:
            return True
            
        # Verifica hash MD5 + Base64 padrão (compatível com C#)
        return HashUtil.gera_hash(senha_plain) == senha_hash


class JWTUtil:
    """Utilitário para geração e validação de tokens JWT"""
    
    def __init__(self, secret_key: str = settings.SECRET_KEY, algorithm: str = settings.ALGORITHM):
        self.secret_key = secret_key
        self.algorithm = algorithm
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Cria um token JWT"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
        
        to_encode.update({"exp": expire, "iat": datetime.utcnow()})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def verify_token(self, token: str) -> dict:
        """Verifica e decodifica um token JWT"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expirado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.PyJWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
                headers={"WWW-Authenticate": "Bearer"},
            )


# Instância global dos utilitários
hash_util = HashUtil()
jwt_util = JWTUtil()

# Security scheme para FastAPI
security = HTTPBearer()