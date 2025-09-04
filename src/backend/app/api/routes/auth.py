"""
Rotas de autenticação
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.auth_service import AuthService
from app.schemas.auth import LoginRequest, LoginResponse, UserInfo
from app.api.dependencies import get_current_user
from app.models.funcionario import TblFuncionarios

router = APIRouter(prefix="/auth", tags=["autenticação"])

@router.post("/login", response_model=LoginResponse, summary="Login de usuário")
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Endpoint de login usando credenciais da tabela tbl_Funcionarios
    
    - **login**: Login do funcionário
    - **senha**: Senha do funcionário (ou senha master)
    
    Retorna token JWT e informações do usuário autenticado.
    """
    auth_service = AuthService(db)
    return await auth_service.authenticate_user(login_data)

@router.get("/me", response_model=UserInfo, summary="Informações do usuário logado")
async def get_current_user_info(
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Obtém informações do usuário atual baseado no token JWT
    """
    return UserInfo(
        cod_funcionario=current_user.CodFuncionario,
        nome=current_user.Nome or "",
        login=current_user.Login or "",
        email=current_user.Email,
        cod_setor=current_user.CodSetor,
        cod_funcao=current_user.CodFuncao,
        is_active=current_user.is_active()
    )

@router.post("/logout", summary="Logout do usuário")
async def logout(current_user: TblFuncionarios = Depends(get_current_user)):
    """
    Endpoint de logout (em uma implementação completa, o token seria 
    adicionado a uma blacklist usando Redis)
    """
    return {
        "message": f"Logout realizado com sucesso para o usuário {current_user.Login}",
        "status": "success"
    }

@router.get("/validate", summary="Validar token")
async def validate_token(current_user: TblFuncionarios = Depends(get_current_user)):
    """
    Valida se o token JWT é válido e retorna status do usuário
    """
    return {
        "valid": True,
        "user_id": current_user.CodFuncionario,
        "login": current_user.Login,
        "is_active": current_user.is_active()
    }