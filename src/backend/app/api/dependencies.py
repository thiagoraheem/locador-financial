"""
API dependencies for authentication and common functionality
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.auth_service import AuthService
from app.models.funcionario import TblFuncionarios

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> TblFuncionarios:
    """
    Dependency para obter usuário autenticado em rotas protegidas
    """
    auth_service = AuthService(db)
    return auth_service.get_current_user(credentials.credentials)