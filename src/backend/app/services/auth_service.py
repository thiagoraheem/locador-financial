"""
Serviço de autenticação
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import timedelta
from app.models.funcionario import TblFuncionarios
from app.schemas.auth import LoginRequest, LoginResponse, UserInfo
from app.core.security import hash_util, jwt_util
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class AuthService:
    """Serviço para operações de autenticação"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def authenticate_user(self, login_data: LoginRequest) -> LoginResponse:
        """Autentica usuário usando credenciais da tabela tbl_Funcionarios"""
        
        logger.info(f"Tentativa de login para usuário: {login_data.login}")
        
        # Buscar funcionário pelo login
        funcionario = self.db.query(TblFuncionarios).filter(
            TblFuncionarios.Login == login_data.login
        ).first()
        
        if not funcionario:
            logger.warning(f"Usuário não encontrado: {login_data.login}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário não encontrado"
            )
        
        logger.info(f"Usuário encontrado: {funcionario.Login}, Hash armazenado: {funcionario.Senha}")
        
        # Verificar se o funcionário está ativo
        if not funcionario.is_active():
            logger.warning(f"Usuário inativo: {login_data.login}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário não permitido. Status: Demitido"
            )
        
        # Debug da verificação de senha
        senha_hash_gerada = hash_util.gera_hash(login_data.senha)
        logger.info(f"Senha fornecida: {login_data.senha}")
        logger.info(f"Hash gerado da senha: {senha_hash_gerada}")
        logger.info(f"Hash no banco: {funcionario.Senha}")
        logger.info(f"Verificando senha master: {login_data.senha == settings.MASTER_PASSWORD}")
        
        # Verificar senha
        if not hash_util.verificar_senha(login_data.senha, funcionario.Senha):
            logger.warning(f"Senha incorreta para usuário: {login_data.login}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário ou senha incorretos"
            )
        
        logger.info(f"Login bem-sucedido para usuário: {login_data.login}")
        
        # Gerar token JWT
        access_token_expires = timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
        access_token = jwt_util.create_access_token(
            data={
                "sub": str(funcionario.CodFuncionario),
                "login": funcionario.Login,
                "nome": funcionario.Nome
            },
            expires_delta=access_token_expires
        )
        
        # Preparar resposta
        user_info = UserInfo(
            cod_funcionario=funcionario.CodFuncionario,
            nome=funcionario.Nome or "",
            login=funcionario.Login or "",
            email=funcionario.Email,
            cod_setor=funcionario.CodSetor,
            cod_funcao=funcionario.CodFuncao,
            is_active=funcionario.is_active()
        )
        
        return LoginResponse(
            access_token=access_token,
            expires_in=int(access_token_expires.total_seconds()),
            user_info=user_info
        )
    
    def get_current_user(self, token: str) -> TblFuncionarios:
        """Obtém o usuário atual baseado no token JWT"""
        payload = jwt_util.verify_token(token)
        
        cod_funcionario = payload.get("sub")
        if cod_funcionario is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        
        funcionario = self.db.query(TblFuncionarios).filter(
            TblFuncionarios.CodFuncionario == int(cod_funcionario)
        ).first()
        
        if funcionario is None or not funcionario.is_active():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário não encontrado ou inativo"
            )
        
        return funcionario