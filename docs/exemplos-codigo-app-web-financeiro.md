# Exemplos de Código para Implementação do Aplicativo Web Financeiro

Este documento complementa o planejamento principal com exemplos práticos de código para auxiliar no desenvolvimento do aplicativo web financeiro.

## 1. Sistema de Autenticação

### 1.1 Modelo de Funcionário (SQLAlchemy)

```python
# app/models/funcionario.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, DECIMAL, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class TblFuncionarios(Base):
    __tablename__ = 'tbl_Funcionarios'
    
    CodFuncionario = Column(Integer, primary_key=True, index=True)
    NumCTPS = Column(String(50))
    CPF = Column(String(14))
    Nome = Column(String(100))
    Telefone = Column(String(20))
    Endereco = Column(String(200))
    Salario = Column(DECIMAL(10, 2))
    DatAdmissao = Column(DateTime)
    DatDemissao = Column(DateTime, nullable=True)
    FlgComissao = Column(Boolean)
    ValComissao = Column(DECIMAL(5, 2))
    VlrDesconto = Column(DECIMAL(10, 2))
    Email = Column(String(100))
    Login = Column(String(50), unique=True, index=True)
    Senha = Column(String(255))  # Hash SHA-256
    AssinaturaDigitalizada = Column(LargeBinary)
    CodSetor = Column(Integer)
    CodFavorecido = Column(Integer)
    CodFuncao = Column(Integer)
    Settings = Column(String(500))
    Foto = Column(LargeBinary)
    DatCadastro = Column(DateTime, default=datetime.utcnow)
    NomUsuario = Column(String(50), nullable=False)
    DatAlteracao = Column(DateTime)
    NomUsuarioAlteracao = Column(String(50))
    
    def is_active(self) -> bool:
        """Verifica se o funcionário está ativo (não demitido)"""
        return self.DatDemissao is None
```

### 1.2 Schemas de Autenticação

```python
# app/schemas/auth.py
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class LoginRequest(BaseModel):
    login: str
    senha: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_info: "UserInfo"

class UserInfo(BaseModel):
    cod_funcionario: int
    nome: str
    login: str
    email: Optional[str] = None
    cod_setor: Optional[int] = None
    cod_funcao: Optional[int] = None

class TokenData(BaseModel):
    cod_funcionario: Optional[int] = None
    login: Optional[str] = None
```

### 1.3 Utilitários de Autenticação

```python
# app/auth/utils.py
import hashlib
import jwt
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status
from passlib.context import CryptContext

class HashUtil:
    """Utilitário para hash de senhas compatível com o sistema atual"""
    
    @staticmethod
    def gera_hash(senha: str) -> str:
        """Gera hash SHA-256 da senha (compatível com sistema atual)"""
        return hashlib.sha256(senha.encode('utf-8')).hexdigest()
    
    @staticmethod
    def verificar_senha(senha_plain: str, senha_hash: str) -> bool:
        """Verifica se a senha corresponde ao hash"""
        # Senha master do sistema atual
        master_password_hash = "YpP7sPnjw2G/TO5357wt1w=="
        
        if senha_plain == master_password_hash:
            return True
            
        return HashUtil.gera_hash(senha_plain) == senha_hash

class JWTUtil:
    """Utilitário para geração e validação de tokens JWT"""
    
    def __init__(self, secret_key: str, algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Cria um token JWT"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(hours=24)
        
        to_encode.update({"exp": expire})
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
        except jwt.JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
                headers={"WWW-Authenticate": "Bearer"},
            )
```

### 1.4 Serviço de Autenticação

```python
# app/services/auth_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.funcionario import TblFuncionarios
from app.schemas.auth import LoginRequest, LoginResponse, UserInfo
from app.auth.utils import HashUtil, JWTUtil
from datetime import timedelta
from typing import Optional

class AuthService:
    def __init__(self, db: Session, jwt_util: JWTUtil):
        self.db = db
        self.jwt_util = jwt_util
        self.hash_util = HashUtil()
    
    async def authenticate_user(self, login_data: LoginRequest) -> LoginResponse:
        """Autentica usuário usando credenciais da tabela tbl_Funcionarios"""
        
        # Buscar funcionário pelo login
        funcionario = self.db.query(TblFuncionarios).filter(
            TblFuncionarios.Login == login_data.login
        ).first()
        
        if not funcionario:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário não encontrado"
            )
        
        # Verificar se o funcionário está ativo
        if not funcionario.is_active():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário não permitido. Status: Demitido"
            )
        
        # Verificar senha
        if not self.hash_util.verificar_senha(login_data.senha, funcionario.Senha):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário ou senha incorretos"
            )
        
        # Gerar token JWT
        access_token_expires = timedelta(hours=24)
        access_token = self.jwt_util.create_access_token(
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
            cod_funcao=funcionario.CodFuncao
        )
        
        return LoginResponse(
            access_token=access_token,
            expires_in=int(access_token_expires.total_seconds()),
            user_info=user_info
        )
    
    def get_current_user(self, token: str) -> TblFuncionarios:
        """Obtém o usuário atual baseado no token JWT"""
        payload = self.jwt_util.verify_token(token)
        
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
```

### 1.5 Rotas de Autenticação

```python
# app/api/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.auth_service import AuthService
from app.schemas.auth import LoginRequest, LoginResponse, UserInfo
from app.auth.utils import JWTUtil
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()
jwt_util = JWTUtil(settings.SECRET_KEY)

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Endpoint de login usando credenciais da tabela tbl_Funcionarios"""
    auth_service = AuthService(db, jwt_util)
    return await auth_service.authenticate_user(login_data)

@router.get("/me", response_model=UserInfo)
async def get_current_user_info(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Obtém informações do usuário atual"""
    auth_service = AuthService(db, jwt_util)
    funcionario = auth_service.get_current_user(credentials.credentials)
    
    return UserInfo(
        cod_funcionario=funcionario.CodFuncionario,
        nome=funcionario.Nome or "",
        login=funcionario.Login or "",
        email=funcionario.Email,
        cod_setor=funcionario.CodSetor,
        cod_funcao=funcionario.CodFuncao
    )

@router.post("/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Endpoint de logout (invalidação do token seria implementada com Redis/cache)"""
    # Em uma implementação completa, o token seria adicionado a uma blacklist
    return {"message": "Logout realizado com sucesso"}

# Dependency para proteger rotas
async def get_current_active_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Dependency para obter usuário autenticado em rotas protegidas"""
    auth_service = AuthService(db, jwt_util)
    return auth_service.get_current_user(credentials.credentials)
```

## 2. Exemplos de Backend (Python/FastAPI) - Módulos Financeiros

### 1.1 Configuração Inicial do Projeto

#### Estrutura de Diretórios

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── security.py
│   │   └── database.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── dependencies.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── auth.py
│   │       ├── lancamentos.py
│   │       ├── contas_pagar.py
│   │       ├── contas_receber.py
│   │       └── categorias.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── lancamento.py
│   │   ├── conta_pagar.py
│   │   ├── conta_receber.py
│   │   └── categoria.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── lancamento.py
│   │   ├── conta_pagar.py
│   │   ├── conta_receber.py
│   │   └── categoria.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── lancamento_service.py
│   │   ├── conta_pagar_service.py
│   │   ├── conta_receber_service.py
│   │   └── categoria_service.py
│   └── repositories/
│       ├── __init__.py
│       ├── lancamento_repository.py
│       ├── conta_pagar_repository.py
│       ├── conta_receber_repository.py
│       └── categoria_repository.py
├── alembic/
│   ├── versions/
│   ├── env.py
│   └── alembic.ini
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_api/
│   └── test_services/
├── requirements.txt
└── Dockerfile
```

#### Arquivo main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, lancamentos, contas_pagar, contas_receber, categorias
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.PROJECT_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão dos routers
app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["auth"])
app.include_router(lancamentos.router, prefix=settings.API_V1_STR, tags=["lancamentos"])
app.include_router(contas_pagar.router, prefix=settings.API_V1_STR, tags=["contas_pagar"])
app.include_router(contas_receber.router, prefix=settings.API_V1_STR, tags=["contas_receber"])
app.include_router(categorias.router, prefix=settings.API_V1_STR, tags=["categorias"])

@app.get("/")
async def root():
    return {"message": "API Financeira do Sistema Locador"}
```

### 1.2 Configuração do Banco de Dados

#### database.py

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URI,
    pool_pre_ping=True,
    connect_args={"TrustServerCertificate": "yes"} if settings.DATABASE_URI.startswith("mssql") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency para injeção da sessão do banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 1.3 Modelos SQLAlchemy

#### models/lancamento.py

```python
from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

# Mixin para campos de auditoria com ID de usuário
class UserAuditMixin:
    """Mixin para tabelas que utilizam ID de usuário para auditoria"""
    IdUserCreate = Column(Integer, ForeignKey('tbl_Funcionarios.CodFuncionario'), nullable=False)
    IdUserAlter = Column(Integer, ForeignKey('tbl_Funcionarios.CodFuncionario'), nullable=True)
    DtCreate = Column(DateTime, default=datetime.utcnow, nullable=False)
    DtAlter = Column(DateTime, onupdate=datetime.utcnow, nullable=True)
    
    # Relacionamentos para auditoria
    user_create = relationship("TblFuncionarios", foreign_keys=[IdUserCreate])
    user_alter = relationship("TblFuncionarios", foreign_keys=[IdUserAlter])

# Mixin para campos de auditoria com login de usuário
class LoginAuditMixin:
    """Mixin para tabelas que utilizam login de usuário para auditoria"""
    NomUsuario = Column(String(50), nullable=False)  # Login do usuário
    DtCreate = Column(DateTime, default=datetime.utcnow, nullable=False)
    DtAlter = Column(DateTime, onupdate=datetime.utcnow, nullable=True)

class Lancamento(Base, LoginAuditMixin):
    __tablename__ = "tbl_FINLancamentos"

    CodLancamento = Column(Integer, primary_key=True, index=True)
    Data = Column(DateTime, default=datetime.now)
    DataEmissao = Column(DateTime, default=datetime.now)
    CodFavorecido = Column(Integer, ForeignKey("tbl_FINFavorecido.CodFavorecido"))
    CodCategoria = Column(Integer, ForeignKey("tbl_FINCategorias.CodCategoria"))
    Valor = Column(Numeric(18, 2))
    IndMov = Column(String(1))  # E: Entrada, S: Saída
    NumDocto = Column(String(50))
    CodFormaPagto = Column(Integer, ForeignKey("tbl_FINFormaPagamento.CodFormaPagto"))
    FlgConfirmacao = Column(Boolean, default=False)
    FlgFrequencia = Column(String(1))  # U: Único, R: Recorrente
    Observacao = Column(String(500))
    
    # Relacionamentos
    favorecido = relationship("Favorecido", back_populates="lancamentos")
    categoria = relationship("Categoria", back_populates="lancamentos")
    forma_pagamento = relationship("FormaPagamento", back_populates="lancamentos")
```

#### models/conta_pagar.py

```python
from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class ContaPagar(Base, UserAuditMixin):
    __tablename__ = "tbl_AccountsPayable"

    CodAccountsPayable = Column(Integer, primary_key=True, index=True)
    CodFornecedor = Column(Integer, ForeignKey("tbl_Fornecedor.CodFornecedor"))
    DataEmissao = Column(DateTime, default=datetime.now)
    DataVencimento = Column(DateTime)
    Valor = Column(Numeric(18, 2))
    ValorPago = Column(Numeric(18, 2), default=0)
    Status = Column(String(1))  # A: Aberto, P: Pago, V: Vencido
    NumeroDocumento = Column(String(50))
    Observacao = Column(String(500))
    
    # Relacionamentos
    fornecedor = relationship("Fornecedor", back_populates="contas_pagar")
    pagamentos = relationship("AccountsPayablePayment", back_populates="conta_pagar")
```

#### models/conta_receber.py

```python
from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class ContaReceber(Base, UserAuditMixin):
    __tablename__ = "tbl_AccountsReceivable"

    CodAccountsReceivable = Column(Integer, primary_key=True, index=True)
    CodCliente = Column(Integer, ForeignKey("tbl_Cliente.CodCliente"))
    DataEmissao = Column(DateTime, default=datetime.now)
    DataVencimento = Column(DateTime)
    Valor = Column(Numeric(18, 2))
    ValorRecebido = Column(Numeric(18, 2), default=0)
    Status = Column(String(1))  # A: Aberto, R: Recebido, V: Vencido
    NumeroDocumento = Column(String(50))
    Observacao = Column(String(500))
    
    # Relacionamentos
    cliente = relationship("Cliente", back_populates="contas_receber")
    recebimentos = relationship("AccountsReceivablePayment", back_populates="conta_receber")
```

#### models/favorecido.py

```python
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Favorecido(Base, UserAuditMixin):
    __tablename__ = "tbl_FINFavorecidos"

    CodFavorecido = Column(Integer, primary_key=True, index=True)
    Nome = Column(String(100), nullable=False)
    TipoFavorecido = Column(String(1))  # F: Físico, J: Jurídico
    CPFCNPJ = Column(String(20))
    Email = Column(String(100))
    Telefone = Column(String(20))
    Endereco = Column(String(200))
    Ativo = Column(Boolean, default=True)
    
    # Relacionamentos
    lancamentos = relationship("Lancamento", back_populates="favorecido")
```

#### models/categoria.py

```python
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Categoria(Base, UserAuditMixin):
    __tablename__ = "tbl_FINCategorias"

    CodCategoria = Column(Integer, primary_key=True, index=True)
    Nome = Column(String(100), nullable=False)
    Descricao = Column(String(500))
    TipoCategoria = Column(String(1))  # R: Receita, D: Despesa
    Ativo = Column(Boolean, default=True)
    
    # Relacionamentos
    lancamentos = relationship("Lancamento", back_populates="categoria")
```

#### schemas/conta_pagar.py

```python
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from decimal import Decimal

class ContaPagarBase(BaseModel):
    """Schema base para Conta a Pagar"""
    cod_favorecido: int = Field(..., description="Código do favorecido")
    cod_categoria: int = Field(..., description="Código da categoria")
    descricao: str = Field(..., max_length=255, description="Descrição da conta")
    valor: Decimal = Field(..., gt=0, description="Valor da conta")
    data_vencimento: datetime = Field(..., description="Data de vencimento")
    data_pagamento: Optional[datetime] = Field(None, description="Data do pagamento")
    valor_pago: Optional[Decimal] = Field(None, ge=0, description="Valor pago")
    observacoes: Optional[str] = Field(None, max_length=500, description="Observações")
    status: str = Field(default="PENDENTE", description="Status da conta")
    
    @validator('valor_pago')
    def validate_valor_pago(cls, v, values):
        if v is not None and v > values.get('valor', 0):
            raise ValueError('Valor pago não pode ser maior que o valor da conta')
        return v

class ContaPagarCreate(ContaPagarBase):
    """Schema para criação de Conta a Pagar"""
    pass

class ContaPagarUpdate(BaseModel):
    """Schema para atualização de Conta a Pagar"""
    cod_favorecido: Optional[int] = None
    cod_categoria: Optional[int] = None
    descricao: Optional[str] = Field(None, max_length=255)
    valor: Optional[Decimal] = Field(None, gt=0)
    data_vencimento: Optional[datetime] = None
    data_pagamento: Optional[datetime] = None
    valor_pago: Optional[Decimal] = Field(None, ge=0)
    observacoes: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = None

class ContaPagarInDB(ContaPagarBase):
    """Schema para Conta a Pagar no banco de dados"""
    id: int
    IdUserCreate: int = Field(..., description="ID do usuário que criou")
    IdUserAlter: Optional[int] = Field(None, description="ID do usuário que alterou")
    DatCreate: datetime = Field(..., description="Data de criação")
    DatAlter: Optional[datetime] = Field(None, description="Data de alteração")
    
    class Config:
        from_attributes = True

class ContaPagar(ContaPagarInDB):
    """Schema de resposta para Conta a Pagar"""
    pass
```

### 3. Schemas Pydantic

#### schemas/lancamento.py

```python
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class LancamentoBase(BaseModel):
    Data: datetime
    DataEmissao: datetime
    CodFavorecido: int
    CodCategoria: int
    Valor: Decimal = Field(..., gt=0)
    IndMov: str = Field(..., min_length=1, max_length=1)
    NumDocto: Optional[str] = None
    CodFormaPagto: int
    FlgFrequencia: str = Field(..., min_length=1, max_length=1)
    Observacao: Optional[str] = None

    @validator('IndMov')
    def validate_ind_mov(cls, v):
        if v not in ['E', 'S']:
            raise ValueError('IndMov deve ser E (Entrada) ou S (Saída)')
        return v

    @validator('FlgFrequencia')
    def validate_flg_frequencia(cls, v):
        if v not in ['U', 'R']:
            raise ValueError('FlgFrequencia deve ser U (Único) ou R (Recorrente)')
        return v

class LancamentoCreate(LancamentoBase):
    pass

class LancamentoUpdate(LancamentoBase):
    Data: Optional[datetime] = None
    DataEmissao: Optional[datetime] = None
    CodFavorecido: Optional[int] = None
    CodCategoria: Optional[int] = None
    Valor: Optional[Decimal] = None
    IndMov: Optional[str] = None
    CodFormaPagto: Optional[int] = None
    FlgFrequencia: Optional[str] = None

class LancamentoInDB(LancamentoBase):
    CodLancamento: int
    FlgConfirmacao: bool = False

    class Config:
        orm_mode = True

class Lancamento(LancamentoInDB):
    favorecido_nome: Optional[str] = None
    categoria_nome: Optional[str] = None
    forma_pagamento_nome: Optional[str] = None
```

### 1.5 Repositórios

#### repositories/lancamento_repository.py

```python
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import datetime
from app.models.lancamento import Lancamento

class LancamentoRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, lancamento_id: int) -> Optional[Lancamento]:
        return self.db.query(Lancamento).filter(Lancamento.CodLancamento == lancamento_id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Lancamento]:
        return self.db.query(Lancamento).offset(skip).limit(limit).all()

    def get_by_filters(self, 
                      data_inicio: Optional[datetime] = None,
                      data_fim: Optional[datetime] = None,
                      cod_categoria: Optional[int] = None,
                      cod_favorecido: Optional[int] = None,
                      ind_mov: Optional[str] = None,
                      confirmado: Optional[bool] = None,
                      skip: int = 0, 
                      limit: int = 100) -> List[Lancamento]:
        
        query = self.db.query(Lancamento)
        
        if data_inicio:
            query = query.filter(Lancamento.Data >= data_inicio)
        
        if data_fim:
            query = query.filter(Lancamento.Data <= data_fim)
        
        if cod_categoria:
            query = query.filter(Lancamento.CodCategoria == cod_categoria)
        
        if cod_favorecido:
            query = query.filter(Lancamento.CodFavorecido == cod_favorecido)
        
        if ind_mov:
            query = query.filter(Lancamento.IndMov == ind_mov)
        
        if confirmado is not None:
            query = query.filter(Lancamento.FlgConfirmacao == confirmado)
        
        return query.offset(skip).limit(limit).all()

    def create(self, lancamento: Lancamento) -> Lancamento:
        self.db.add(lancamento)
        self.db.commit()
        self.db.refresh(lancamento)
        return lancamento

    def update(self, lancamento: Lancamento) -> Lancamento:
        self.db.commit()
        self.db.refresh(lancamento)
        return lancamento

    def delete(self, lancamento: Lancamento) -> None:
        self.db.delete(lancamento)
        self.db.commit()

    def confirm(self, lancamento: Lancamento) -> Lancamento:
        lancamento.FlgConfirmacao = True
        self.db.commit()
        self.db.refresh(lancamento)
        return lancamento
```

### 1.6 Serviços

#### services/lancamento_service.py

```python
from typing import List, Optional
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.lancamento import Lancamento as LancamentoModel
from app.schemas.lancamento import LancamentoCreate, LancamentoUpdate, Lancamento
from app.repositories.lancamento_repository import LancamentoRepository

class LancamentoService:
    def __init__(self, db: Session):
        self.repository = LancamentoRepository(db)

    def get_lancamento(self, lancamento_id: int) -> Lancamento:
        lancamento = self.repository.get_by_id(lancamento_id)
        if not lancamento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lançamento com ID {lancamento_id} não encontrado"
            )
        return lancamento

    def get_lancamentos(self, 
                       skip: int = 0, 
                       limit: int = 100, 
                       data_inicio: Optional[datetime] = None,
                       data_fim: Optional[datetime] = None,
                       cod_categoria: Optional[int] = None,
                       cod_favorecido: Optional[int] = None,
                       ind_mov: Optional[str] = None,
                       confirmado: Optional[bool] = None) -> List[Lancamento]:
        
        return self.repository.get_by_filters(
            data_inicio=data_inicio,
            data_fim=data_fim,
            cod_categoria=cod_categoria,
            cod_favorecido=cod_favorecido,
            ind_mov=ind_mov,
            confirmado=confirmado,
            skip=skip,
            limit=limit
        )

    def create_lancamento(self, lancamento_create: LancamentoCreate, current_user: UserInfo) -> Lancamento:
        """Criar lançamento com auditoria de usuário (login)"""
        lancamento_data = lancamento_create.dict()
        # Adicionar campos de auditoria
        lancamento_data['NomUsuario'] = current_user.login
        
        lancamento = LancamentoModel(**lancamento_data)
        return self.repository.create(lancamento)

    def update_lancamento(self, lancamento_id: int, lancamento_update: LancamentoUpdate, current_user: UserInfo) -> Lancamento:
        """Atualizar lançamento com auditoria de usuário (login)"""
        lancamento = self.get_lancamento(lancamento_id)
        
        update_data = lancamento_update.dict(exclude_unset=True)
        # Atualizar campos de auditoria
        update_data['NomUsuario'] = current_user.login
        
        for key, value in update_data.items():
            setattr(lancamento, key, value)
        
        return self.repository.update(lancamento)

    def delete_lancamento(self, lancamento_id: int) -> None:
        lancamento = self.get_lancamento(lancamento_id)
        self.repository.delete(lancamento)

    def confirm_lancamento(self, lancamento_id: int) -> Lancamento:
        lancamento = self.get_lancamento(lancamento_id)
        return self.repository.confirm(lancamento)
```

#### services/conta_pagar_service.py

```python
from typing import List, Optional
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.financial import ContaPagar
from app.schemas.conta_pagar import ContaPagarCreate, ContaPagarUpdate
from app.schemas.auth import UserInfo
from app.repositories.conta_pagar_repository import ContaPagarRepository

class ContaPagarService:
    def __init__(self, db: Session):
        self.repository = ContaPagarRepository(db)

    def get_conta_pagar(self, conta_id: int) -> ContaPagar:
        conta = self.repository.get_by_id(conta_id)
        if not conta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conta a pagar com ID {conta_id} não encontrada"
            )
        return conta

    def create_conta_pagar(self, conta_create: ContaPagarCreate, current_user: UserInfo) -> ContaPagar:
        """Criar conta a pagar com auditoria de usuário (ID)"""
        # Validar se o usuário existe
        if not self.validar_usuario_existe(current_user.cod_funcionario):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não encontrado na tabela tbl_Funcionarios"
            )
        
        conta_data = conta_create.dict()
        # Adicionar campos de auditoria
        conta_data['IdUserCreate'] = current_user.cod_funcionario
        
        conta = ContaPagar(**conta_data)
        return self.repository.create(conta)

    def update_conta_pagar(self, conta_id: int, conta_update: ContaPagarUpdate, current_user: UserInfo) -> ContaPagar:
        """Atualizar conta a pagar com auditoria de usuário (ID)"""
        # Validar se o usuário existe
        if not self.validar_usuario_existe(current_user.cod_funcionario):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não encontrado na tabela tbl_Funcionarios"
            )
        
        conta = self.get_conta_pagar(conta_id)
        
        update_data = conta_update.dict(exclude_unset=True)
        # Atualizar campos de auditoria
        update_data['IdUserAlter'] = current_user.cod_funcionario
        
        for key, value in update_data.items():
            setattr(conta, key, value)
        
        return self.repository.update(conta)

    def validar_usuario_existe(self, user_id: int) -> bool:
        """Validar se o usuário existe na tabela tbl_Funcionarios"""
        from app.repositories.funcionario_repository import FuncionarioRepository
        funcionario_repo = FuncionarioRepository(self.repository.db)
        return funcionario_repo.get_by_id(user_id) is not None
```

### 1.7 Rotas API

#### routes/lancamentos.py

```python
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.schemas.lancamento import Lancamento, LancamentoCreate, LancamentoUpdate
from app.services.lancamento_service import LancamentoService
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/lancamentos")

@router.get("/", response_model=List[Lancamento])
async def get_lancamentos(
    skip: int = 0,
    limit: int = 100,
    data_inicio: Optional[datetime] = None,
    data_fim: Optional[datetime] = None,
    cod_categoria: Optional[int] = None,
    cod_favorecido: Optional[int] = None,
    ind_mov: Optional[str] = None,
    confirmado: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = LancamentoService(db)
    return service.get_lancamentos(
        skip=skip,
        limit=limit,
        data_inicio=data_inicio,
        data_fim=data_fim,
        cod_categoria=cod_categoria,
        cod_favorecido=cod_favorecido,
        ind_mov=ind_mov,
        confirmado=confirmado
    )

@router.get("/{lancamento_id}", response_model=Lancamento)
async def get_lancamento(
    lancamento_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = LancamentoService(db)
    return service.get_lancamento(lancamento_id)

@router.post("/", response_model=Lancamento, status_code=status.HTTP_201_CREATED)
async def create_lancamento(
    lancamento: LancamentoCreate,
    db: Session = Depends(get_db),
    current_user: UserInfo = Depends(get_current_active_user)
):
    service = LancamentoService(db)
    return service.create_lancamento(lancamento, current_user)

@router.put("/{lancamento_id}", response_model=Lancamento)
async def update_lancamento(
    lancamento_id: int,
    lancamento_update: LancamentoUpdate,
    db: Session = Depends(get_db),
    current_user: UserInfo = Depends(get_current_active_user)
):
    service = LancamentoService(db)
    return service.update_lancamento(lancamento_id, lancamento_update, current_user)
```

#### routes/contas_pagar.py

```python
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.schemas.conta_pagar import ContaPagar, ContaPagarCreate, ContaPagarUpdate
from app.schemas.auth import UserInfo
from app.services.conta_pagar_service import ContaPagarService
from app.api.dependencies import get_current_active_user

router = APIRouter(prefix="/contas-pagar")

@router.post("/", response_model=ContaPagar, status_code=status.HTTP_201_CREATED)
async def create_conta_pagar(
    conta: ContaPagarCreate,
    db: Session = Depends(get_db),
    current_user: UserInfo = Depends(get_current_active_user)
):
    """Criar conta a pagar com auditoria de usuário"""
    service = ContaPagarService(db)
    return service.create_conta_pagar(conta, current_user)

@router.put("/{conta_id}", response_model=ContaPagar)
async def update_conta_pagar(
    conta_id: int,
    conta_update: ContaPagarUpdate,
    db: Session = Depends(get_db),
    current_user: UserInfo = Depends(get_current_active_user)
):
    """Atualizar conta a pagar com auditoria de usuário"""
    service = ContaPagarService(db)
    return service.update_conta_pagar(conta_id, conta_update, current_user)
```

### 4. Middleware e Dependências de Auditoria

#### middleware/audit_middleware.py

```python
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from sqlalchemy.orm import Session
from typing import Optional
import jwt
from datetime import datetime

from app.core.database import get_db
from app.models.funcionario import TblFuncionarios
from app.core.config import settings

class AuditMiddleware(BaseHTTPMiddleware):
    """Middleware para auditoria de operações"""
    
    def __init__(self, app):
        super().__init__(app)
        self.security = HTTPBearer()
    
    async def dispatch(self, request: Request, call_next):
        # Verificar se é uma operação que requer auditoria
        if self._requires_audit(request):
            user_info = await self._get_current_user(request)
            if user_info:
                # Adicionar informações do usuário ao contexto da requisição
                request.state.current_user = user_info
        
        response = await call_next(request)
        return response
    
    def _requires_audit(self, request: Request) -> bool:
        """Verificar se a operação requer auditoria"""
        audit_methods = ['POST', 'PUT', 'PATCH', 'DELETE']
        audit_paths = ['/lancamentos', '/contas-pagar', '/contas-receber', '/favorecidos', '/categorias']
        
        return (
            request.method in audit_methods and
            any(path in str(request.url) for path in audit_paths)
        )
    
    async def _get_current_user(self, request: Request) -> Optional[dict]:
        """Obter usuário atual do token JWT"""
        try:
            authorization = request.headers.get('Authorization')
            if not authorization or not authorization.startswith('Bearer '):
                return None
            
            token = authorization.split(' ')[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            username = payload.get('sub')
            
            if not username:
                return None
            
            # Buscar usuário no banco
            db = next(get_db())
            user = db.query(TblFuncionarios).filter(
                TblFuncionarios.NomUsuario == username
            ).first()
            
            if not user:
                return None
            
            return {
                'cod_funcionario': user.cod_funcionario,
                'NomUsuario': user.NomUsuario,
                'NomFuncionario': user.NomFuncionario
            }
            
        except Exception:
            return None
```

#### dependencies/audit.py

```python
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.models.funcionario import TblFuncionarios
from app.schemas.auth import UserInfo

def get_current_user_from_request(request: Request) -> Optional[UserInfo]:
    """Obter usuário atual do contexto da requisição"""
    if hasattr(request.state, 'current_user'):
        user_data = request.state.current_user
        return UserInfo(
            cod_funcionario=user_data['cod_funcionario'],
            NomUsuario=user_data['NomUsuario'],
            NomFuncionario=user_data['NomFuncionario']
        )
    return None

def validate_user_exists(
    user_id: int,
    db: Session = Depends(get_db)
) -> bool:
    """Validar se o usuário existe na tabela tbl_Funcionarios"""
    user = db.query(TblFuncionarios).filter(
        TblFuncionarios.cod_funcionario == user_id
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Usuário com ID {user_id} não encontrado na tabela tbl_Funcionarios"
        )
    
    return True

def get_audit_info(current_user: UserInfo) -> dict:
    """Obter informações de auditoria formatadas"""
    now = datetime.utcnow()
    
    return {
        'user_id_audit': {
            'IdUserCreate': current_user.cod_funcionario,
            'DatCreate': now
        },
        'login_audit': {
            'NomUsuario': current_user.NomUsuario,
            'DatCreate': now
        },
        'update_audit': {
            'IdUserAlter': current_user.cod_funcionario,
            'DatAlter': now
        }
     }
```

### 5. Configuração da Aplicação Principal

#### main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine
from app.models import Base
from app.middleware.audit_middleware import AuditMiddleware
from app.api.routes import auth, lancamentos, contas_pagar

# Criar tabelas no banco de dados
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Iniciando aplicação...")
    yield
    # Shutdown
    print("Finalizando aplicação...")

app = FastAPI(
    title="Sistema Financeiro Locador",
    description="API para gerenciamento financeiro com auditoria de usuários",
    version="1.0.0",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Adicionar middleware de auditoria
app.add_middleware(AuditMiddleware)

# Registrar rotas
app.include_router(auth.router, prefix="/api/v1", tags=["Autenticação"])
app.include_router(lancamentos.router, prefix="/api/v1", tags=["Lançamentos"])
app.include_router(contas_pagar.router, prefix="/api/v1", tags=["Contas a Pagar"])

@app.get("/")
async def root():
    return {
        "message": "Sistema Financeiro Locador API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### 6. Exemplo de Uso Completo

#### Fluxo de Auditoria

```python
# Exemplo de como o sistema funciona:

# 1. Usuário faz login
POST /api/v1/auth/login
{
    "username": "admin",
    "password": "senha123"
}

# Resposta:
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "user_info": {
        "cod_funcionario": 1,
        "NomUsuario": "admin",
        "NomFuncionario": "Administrador"
    }
}

# 2. Criar lançamento (com auditoria de login)
POST /api/v1/lancamentos/
Headers: Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
{
    "cod_categoria": 1,
    "cod_favorecido": 1,
    "descricao": "Pagamento de fornecedor",
    "valor": 1500.00,
    "data_lancamento": "2024-01-15T10:00:00",
    "ind_mov": "S"
}

# Sistema automaticamente adiciona:
# - NomUsuario: "admin" (do token JWT)
# - DatCreate: timestamp atual

# 3. Criar conta a pagar (com auditoria de ID)
POST /api/v1/contas-pagar/
Headers: Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
{
    "cod_favorecido": 1,
    "cod_categoria": 1,
    "descricao": "Conta de energia",
    "valor": 350.00,
    "data_vencimento": "2024-01-30T00:00:00"
}

# Sistema automaticamente adiciona:
# - IdUserCreate: 1 (cod_funcionario do token JWT)
# - DatCreate: timestamp atual

# 4. Atualizar conta a pagar
PUT /api/v1/contas-pagar/1
Headers: Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
{
    "valor_pago": 350.00,
    "data_pagamento": "2024-01-25T14:30:00",
    "status": "PAGO"
}

# Sistema automaticamente adiciona:
# - IdUserAlter: 1 (cod_funcionario do token JWT)
# - DatAlter: timestamp atual

@router.put("/{lancamento_id}", response_model=Lancamento)
async def update_lancamento(
    lancamento_id: int,
    lancamento: LancamentoUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = LancamentoService(db)
    return service.update_lancamento(lancamento_id, lancamento)

@router.delete("/{lancamento_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lancamento(
    lancamento_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = LancamentoService(db)
    service.delete_lancamento(lancamento_id)
    return {"detail": "Lançamento removido com sucesso"}

@router.patch("/{lancamento_id}/confirm", response_model=Lancamento)
async def confirm_lancamento(
    lancamento_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = LancamentoService(db)
    return service.confirm_lancamento(lancamento_id)
```

## 2. Exemplos de Frontend (React/TypeScript)

### 2.1 Sistema de Autenticação Frontend

#### 2.1.1 Tipos TypeScript para Autenticação

```typescript
// src/types/auth.ts
export interface LoginRequest {
  login: string;
  senha: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_info: UserInfo;
}

export interface UserInfo {
  cod_funcionario: number;
  nome: string;
  login: string;
  email?: string;
  cod_setor?: number;
  cod_funcao?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
```

#### 2.1.2 Serviço de Autenticação

```typescript
// src/services/authService.ts
import axios, { AxiosResponse } from 'axios';
import { LoginRequest, LoginResponse, UserInfo } from '../types/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class AuthService {
  private readonly baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/auth`;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await axios.post(
        `${this.baseURL}/login`,
        credentials
      );
      
      // Armazenar token no localStorage
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('user_info', JSON.stringify(response.data.user_info));
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || 'Erro ao realizar login'
      );
    }
  }

  async getCurrentUser(): Promise<UserInfo> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response: AxiosResponse<UserInfo> = await axios.get(
        `${this.baseURL}/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || 'Erro ao obter informações do usuário'
      );
    }
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUserInfo(): UserInfo | null {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }
}

export const authService = new AuthService();
```

#### 2.1.3 Context de Autenticação

```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, UserInfo, LoginRequest } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: UserInfo; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (credentials: LoginRequest) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authService.login(credentials);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user_info,
          token: response.access_token,
        },
      });
    } catch (error: any) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message,
      });
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const checkAuth = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const token = authService.getToken();
      const userInfo = authService.getUserInfo();
      
      if (token && userInfo) {
        // Verificar se o token ainda é válido
        await authService.getCurrentUser();
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: userInfo,
            token,
          },
        });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      // Token inválido ou expirado
      authService.logout();
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ state, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

#### 2.1.4 Componente de Login

```typescript
// src/components/Login/LoginForm.tsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { LoginRequest } from '../../types/auth';

const schema = yup.object({
  login: yup.string().required('Login é obrigatório'),
  senha: yup.string().required('Senha é obrigatória'),
});

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { state, login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: yupResolver(schema),
    defaultValues: {
      login: '',
      senha: '',
    },
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      await login(data);
      onSuccess?.();
    } catch (error) {
      // Erro já tratado no context
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
    >
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" component="h1" gutterBottom>
              Sistema Financeiro
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Faça login para acessar o sistema
            </Typography>
          </Box>

          {state.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {state.error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box mb={2}>
              <Controller
                name="login"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Login"
                    fullWidth
                    variant="outlined"
                    error={!!errors.login}
                    helperText={errors.login?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Box>

            <Box mb={3}>
              <Controller
                name="senha"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    variant="outlined"
                    error={!!errors.senha}
                    helperText={errors.senha?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={state.loading}
              sx={{ mb: 2 }}
            >
              {state.loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
```

#### 2.1.5 Componente de Rota Protegida

```typescript
// src/components/Auth/ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { state } = useAuth();
  const location = useLocation();

  if (state.loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

#### 2.1.6 Hook para Interceptor de Requisições

```typescript
// src/hooks/useAxiosInterceptor.ts
import { useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export function useAxiosInterceptor() {
  const { state, logout } = useAuth();

  useEffect(() => {
    // Interceptor para adicionar token nas requisições
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (state.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para tratar respostas de erro
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          logout();
        }
        return Promise.reject(error);
      }
    );

    // Cleanup dos interceptors
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [state.token, logout]);
}
```

### 2.2 Estrutura de Diretórios

```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
├── src/
│   ├── index.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Table.tsx
│   │   │   └── Modal.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Layout.tsx
│   │   ├── lancamentos/
│   │   │   ├── LancamentoList.tsx
│   │   │   ├── LancamentoForm.tsx
│   │   │   ├── LancamentoFilter.tsx
│   │   │   └── LancamentoItem.tsx
│   │   ├── contas/
│   │   │   ├── ContasList.tsx
│   │   │   ├── ContasForm.tsx
│   │   │   └── ContasFilter.tsx
│   │   └── dashboard/
│   │       ├── Dashboard.tsx
│   │       ├── FluxoCaixa.tsx
│   │       └── IndicadoresFinanceiros.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── LancamentosPage.tsx
│   │   ├── ContasPagarPage.tsx
│   │   ├── ContasReceberPage.tsx
│   │   └── CategoriasPage.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useLancamentos.ts
│   │   ├── useContas.ts
│   │   └── useCategorias.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── lancamento.service.ts
│   │   ├── conta.service.ts
│   │   └── categoria.service.ts
│   ├── store/
│   │   ├── index.ts
│   │   ├── auth/
│   │   ├── lancamentos/
│   │   ├── contas/
│   │   └── categorias/
│   ├── types/
│   │   ├── lancamento.types.ts
│   │   ├── conta.types.ts
│   │   └── categoria.types.ts
│   ├── utils/
│   │   ├── date.utils.ts
│   │   ├── currency.utils.ts
│   │   └── validation.utils.ts
│   └── styles/
│       ├── global.css
│       ├── theme.ts
│       └── components/
├── package.json
└── tsconfig.json
```

### 2.2 Configuração da API

#### services/api.ts

```typescript
import axios from 'axios';
import { getToken, refreshToken } from './auth.service';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratamento de erros e refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Se o erro for 401 (Unauthorized) e não for uma tentativa de refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Tenta renovar o token
        const newToken = await refreshToken();
        
        // Se conseguir um novo token, refaz a requisição original
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Se falhar o refresh, redireciona para login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### 2.3 Tipos TypeScript

#### types/lancamento.types.ts

```typescript
export interface Lancamento {
  CodLancamento: number;
  Data: string;
  DataEmissao: string;
  CodFavorecido: number;
  CodCategoria: number;
  Valor: number;
  IndMov: 'E' | 'S';
  NumDocto?: string;
  CodFormaPagto: number;
  FlgConfirmacao: boolean;
  FlgFrequencia: 'U' | 'R';
  Observacao?: string;
  favorecido_nome?: string;
  categoria_nome?: string;
  forma_pagamento_nome?: string;
}

export interface LancamentoCreate {
  Data: string;
  DataEmissao: string;
  CodFavorecido: number;
  CodCategoria: number;
  Valor: number;
  IndMov: 'E' | 'S';
  NumDocto?: string;
  CodFormaPagto: number;
  FlgFrequencia: 'U' | 'R';
  Observacao?: string;
}

export interface LancamentoUpdate {
  Data?: string;
  DataEmissao?: string;
  CodFavorecido?: number;
  CodCategoria?: number;
  Valor?: number;
  IndMov?: 'E' | 'S';
  NumDocto?: string;
  CodFormaPagto?: number;
  FlgFrequencia?: 'U' | 'R';
  Observacao?: string;
}

export interface LancamentoFilters {
  dataInicio?: string;
  dataFim?: string;
  codCategoria?: number;
  codFavorecido?: number;
  indMov?: 'E' | 'S';
  confirmado?: boolean;
}
```

### 2.4 Serviços de API

#### services/lancamento.service.ts

```typescript
import api from './api';
import { Lancamento, LancamentoCreate, LancamentoUpdate, LancamentoFilters } from '../types/lancamento.types';

export const getLancamentos = async (filters?: LancamentoFilters, skip = 0, limit = 100): Promise<Lancamento[]> => {
  const params = {
    skip,
    limit,
    ...filters
  };
  
  const response = await api.get('/lancamentos', { params });
  return response.data;
};

export const getLancamentoById = async (id: number): Promise<Lancamento> => {
  const response = await api.get(`/lancamentos/${id}`);
  return response.data;
};

export const createLancamento = async (lancamento: LancamentoCreate): Promise<Lancamento> => {
  const response = await api.post('/lancamentos', lancamento);
  return response.data;
};

export const updateLancamento = async (id: number, lancamento: LancamentoUpdate): Promise<Lancamento> => {
  const response = await api.put(`/lancamentos/${id}`, lancamento);
  return response.data;
};

export const deleteLancamento = async (id: number): Promise<void> => {
  await api.delete(`/lancamentos/${id}`);
};

export const confirmLancamento = async (id: number): Promise<Lancamento> => {
  const response = await api.patch(`/lancamentos/${id}/confirm`);
  return response.data;
};
```

### 2.5 Hooks Personalizados

#### hooks/useLancamentos.ts

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

import { Lancamento, LancamentoCreate, LancamentoUpdate, LancamentoFilters } from '../types/lancamento.types';
import * as lancamentoService from '../services/lancamento.service';

export const useLancamentos = (filters?: LancamentoFilters) => {
  const queryClient = useQueryClient();
  const [currentFilters, setCurrentFilters] = useState<LancamentoFilters>(filters || {});
  
  // Query para buscar lançamentos
  const { data, isLoading, error, refetch } = useQuery(
    ['lancamentos', currentFilters],
    () => lancamentoService.getLancamentos(currentFilters),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutos
    }
  );
  
  // Mutation para criar lançamento
  const createMutation = useMutation(
    (lancamento: LancamentoCreate) => lancamentoService.createLancamento(lancamento),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('lancamentos');
        toast.success('Lançamento criado com sucesso!');
      },
      onError: (error: any) => {
        toast.error(`Erro ao criar lançamento: ${error.response?.data?.detail || error.message}`);
      },
    }
  );
  
  // Mutation para atualizar lançamento
  const updateMutation = useMutation(
    ({ id, lancamento }: { id: number; lancamento: LancamentoUpdate }) => 
      lancamentoService.updateLancamento(id, lancamento),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('lancamentos');
        toast.success('Lançamento atualizado com sucesso!');
      },
      onError: (error: any) => {
        toast.error(`Erro ao atualizar lançamento: ${error.response?.data?.detail || error.message}`);
      },
    }
  );
  
  // Mutation para excluir lançamento
  const deleteMutation = useMutation(
    (id: number) => lancamentoService.deleteLancamento(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('lancamentos');
        toast.success('Lançamento excluído com sucesso!');
      },
      onError: (error: any) => {
        toast.error(`Erro ao excluir lançamento: ${error.response?.data?.detail || error.message}`);
      },
    }
  );
  
  // Mutation para confirmar lançamento
  const confirmMutation = useMutation(
    (id: number) => lancamentoService.confirmLancamento(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('lancamentos');
        toast.success('Lançamento confirmado com sucesso!');
      },
      onError: (error: any) => {
        toast.error(`Erro ao confirmar lançamento: ${error.response?.data?.detail || error.message}`);
      },
    }
  );
  
  // Função para atualizar filtros
  const updateFilters = useCallback((newFilters: LancamentoFilters) => {
    setCurrentFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  return {
    lancamentos: data || [],
    isLoading,
    error,
    refetch,
    filters: currentFilters,
    updateFilters,
    createLancamento: createMutation.mutate,
    updateLancamento: updateMutation.mutate,
    deleteLancamento: deleteMutation.mutate,
    confirmLancamento: confirmMutation.mutate,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    isConfirming: confirmMutation.isLoading,
  };
};
```

### 2.6 Componentes React

#### components/lancamentos/LancamentoList.tsx

```tsx
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Tooltip,
  CircularProgress,
  Typography,
  Box
} from '@mui/material';
import { Edit, Delete, CheckCircle, CheckCircleOutline } from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Lancamento } from '../../types/lancamento.types';
import { formatCurrency } from '../../utils/currency.utils';
import LancamentoFilter from './LancamentoFilter';
import { useLancamentos } from '../../hooks/useLancamentos';

interface LancamentoListProps {
  onEdit: (lancamento: Lancamento) => void;
}

const LancamentoList: React.FC<LancamentoListProps> = ({ onEdit }) => {
  const { 
    lancamentos, 
    isLoading, 
    error, 
    filters,
    updateFilters,
    deleteLancamento,
    confirmLancamento,
    isDeleting,
    isConfirming
  } = useLancamentos();
  
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  
  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      setDeletingId(id);
      await deleteLancamento(id);
      setDeletingId(null);
    }
  };
  
  const handleConfirm = async (id: number) => {
    setConfirmingId(id);
    await confirmLancamento(id);
    setConfirmingId(null);
  };
  
  if (error) {
    return (
      <Typography color="error">
        Erro ao carregar lançamentos: {(error as Error).message}
      </Typography>
    );
  }
  
  return (
    <>
      <LancamentoFilter filters={filters} onFilterChange={updateFilters} />
      
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Favorecido</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={24} />
                  <Typography sx={{ ml: 2 }}>Carregando lançamentos...</Typography>
                </TableCell>
              </TableRow>
            ) : lancamentos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography>Nenhum lançamento encontrado</Typography>
                </TableCell>
              </TableRow>
            ) : (
              lancamentos.map((lancamento) => (
                <TableRow key={lancamento.CodLancamento}>
                  <TableCell>
                    {format(new Date(lancamento.Data), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>{lancamento.favorecido_nome}</TableCell>
                  <TableCell>{lancamento.categoria_nome}</TableCell>
                  <TableCell>
                    {lancamento.IndMov === 'E' ? 'Entrada' : 'Saída'}
                  </TableCell>
                  <TableCell align="right">
                    <Box 
                      component="span" 
                      sx={{ 
                        color: lancamento.IndMov === 'E' ? 'success.main' : 'error.main',
                        fontWeight: 'bold'
                      }}
                    >
                      {formatCurrency(lancamento.Valor)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {lancamento.FlgConfirmacao ? 'Confirmado' : 'Pendente'}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton 
                        size="small" 
                        onClick={() => onEdit(lancamento)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Excluir">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(lancamento.CodLancamento)}
                        disabled={isDeleting && deletingId === lancamento.CodLancamento}
                      >
                        {isDeleting && deletingId === lancamento.CodLancamento ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Delete fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    
                    {!lancamento.FlgConfirmacao && (
                      <Tooltip title="Confirmar">
                        <IconButton 
                          size="small" 
                          onClick={() => handleConfirm(lancamento.CodLancamento)}
                          disabled={isConfirming && confirmingId === lancamento.CodLancamento}
                          color="success"
                        >
                          {isConfirming && confirmingId === lancamento.CodLancamento ? (
                            <CircularProgress size={20} />
                          ) : (
                            <CheckCircleOutline fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default LancamentoList;
```

#### components/lancamentos/LancamentoForm.tsx

```tsx
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Typography,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale';

import { Lancamento, LancamentoCreate, LancamentoUpdate } from '../../types/lancamento.types';
import { useLancamentos } from '../../hooks/useLancamentos';
import { useCategorias } from '../../hooks/useCategorias';
import { useFavorecidos } from '../../hooks/useFavorecidos';
import { useFormasPagamento } from '../../hooks/useFormasPagamento';

interface LancamentoFormProps {
  lancamento?: Lancamento;
  onSuccess: () => void;
}

const schema = yup.object().shape({
  Data: yup.date().required('Data é obrigatória'),
  DataEmissao: yup.date().required('Data de emissão é obrigatória'),
  CodFavorecido: yup.number().required('Favorecido é obrigatório'),
  CodCategoria: yup.number().required('Categoria é obrigatória'),
  Valor: yup.number().positive('Valor deve ser positivo').required('Valor é obrigatório'),
  IndMov: yup.string().oneOf(['E', 'S'], 'Tipo inválido').required('Tipo é obrigatório'),
  NumDocto: yup.string().nullable(),
  CodFormaPagto: yup.number().required('Forma de pagamento é obrigatória'),
  FlgFrequencia: yup.string().oneOf(['U', 'R'], 'Frequência inválida').required('Frequência é obrigatória'),
  Observacao: yup.string().nullable()
});

const LancamentoForm: React.FC<LancamentoFormProps> = ({ lancamento, onSuccess }) => {
  const { createLancamento, updateLancamento, isCreating, isUpdating } = useLancamentos();
  const { categorias, isLoading: isLoadingCategorias } = useCategorias();
  const { favorecidos, isLoading: isLoadingFavorecidos } = useFavorecidos();
  const { formasPagamento, isLoading: isLoadingFormasPagamento } = useFormasPagamento();
  
  const isLoading = isLoadingCategorias || isLoadingFavorecidos || isLoadingFormasPagamento;
  const isSubmitting = isCreating || isUpdating;
  const isEditing = !!lancamento;
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm<LancamentoCreate | LancamentoUpdate>({
    resolver: yupResolver(schema),
    defaultValues: lancamento || {
      Data: new Date().toISOString(),
      DataEmissao: new Date().toISOString(),
      IndMov: 'S' as const,
      FlgFrequencia: 'U' as const,
      Valor: 0
    }
  });
  
  useEffect(() => {
    if (lancamento) {
      reset({
        ...lancamento,
        Data: lancamento.Data,
        DataEmissao: lancamento.DataEmissao
      });
    }
  }, [lancamento, reset]);
  
  const onSubmit = async (data: LancamentoCreate | LancamentoUpdate) => {
    try {
      if (isEditing && lancamento) {
        await updateLancamento({ id: lancamento.CodLancamento, lancamento: data as LancamentoUpdate });
      } else {
        await createLancamento(data as LancamentoCreate);
      }
      onSuccess();
      if (!isEditing) {
        reset();
      }
    } catch (error) {
      console.error('Erro ao salvar lançamento:', error);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="h6" gutterBottom>
        {isEditing ? 'Editar Lançamento' : 'Novo Lançamento'}
      </Typography>
      
      {isLoading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <Controller
                name="Data"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Data"
                    value={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date?.toISOString())}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                        error: !!errors.Data,
                        helperText: errors.Data?.message
                      }
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <Controller
                name="DataEmissao"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Data de Emissão"
                    value={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date?.toISOString())}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                        error: !!errors.DataEmissao,
                        helperText: errors.DataEmissao?.message
                      }
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.CodFavorecido}>
              <InputLabel>Favorecido</InputLabel>
              <Controller
                name="CodFavorecido"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Favorecido"
                  >
                    {favorecidos.map((favorecido) => (
                      <MenuItem key={favorecido.CodFavorecido} value={favorecido.CodFavorecido}>
                        {favorecido.Descricao}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.CodFavorecido && (
                <FormHelperText>{errors.CodFavorecido.message}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.CodCategoria}>
              <InputLabel>Categoria</InputLabel>
              <Controller
                name="CodCategoria"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Categoria"
                  >
                    {categorias.map((categoria) => (
                      <MenuItem key={categoria.CodCategoria} value={categoria.CodCategoria}>
                        {categoria.Descricao}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.CodCategoria && (
                <FormHelperText>{errors.CodCategoria.message}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Controller
              name="Valor"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Valor"
                  type="number"
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                  error={!!errors.Valor}
                  helperText={errors.Valor?.message}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.IndMov}>
              <InputLabel>Tipo</InputLabel>
              <Controller
                name="IndMov"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Tipo"
                  >
                    <MenuItem value="E">Entrada</MenuItem>
                    <MenuItem value="S">Saída</MenuItem>
                  </Select>
                )}
              />
              {errors.IndMov && (
                <FormHelperText>{errors.IndMov.message}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Controller
              name="NumDocto"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Número do Documento"
                  fullWidth
                  variant="outlined"
                  error={!!errors.NumDocto}
                  helperText={errors.NumDocto?.message}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.CodFormaPagto}>
              <InputLabel>Forma de Pagamento</InputLabel>
              <Controller
                name="CodFormaPagto"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Forma de Pagamento"
                  >
                    {formasPagamento.map((forma) => (
                      <MenuItem key={forma.CodFormaPagto} value={forma.CodFormaPagto}>
                        {forma.Descricao}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.CodFormaPagto && (
                <FormHelperText>{errors.CodFormaPagto.message}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.FlgFrequencia}>
              <InputLabel>Frequência</InputLabel>
              <Controller
                name="FlgFrequencia"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Frequência"
                  >
                    <MenuItem value="U">Único</MenuItem>
                    <MenuItem value="R">Recorrente</MenuItem>
                  </Select>
                )}
              />
              {errors.FlgFrequencia && (
                <FormHelperText>{errors.FlgFrequencia.message}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Controller
              name="Observacao"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Observação"
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  error={!!errors.Observacao}
                  helperText={errors.Observacao?.message}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button 
                variant="contained" 
                color="primary" 
                type="submit"
                disabled={isSubmitting}
                startIcon={isSubmitting && <CircularProgress size={20} />}
              >
                {isEditing ? 'Atualizar' : 'Salvar'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default LancamentoForm;
```

### 2.7 Páginas

#### pages/LancamentosPage.tsx

```tsx
import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Paper, 
  Tabs, 
  Tab,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton
} from '@mui/material';
import { Add, Close } from '@mui/icons-material';

import LancamentoList from '../components/lancamentos/LancamentoList';
import LancamentoForm from '../components/lancamentos/LancamentoForm';
import { Lancamento } from '../types/lancamento.types';

const LancamentosPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLancamento, setSelectedLancamento] = useState<Lancamento | undefined>(undefined);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleOpenDialog = () => {
    setSelectedLancamento(undefined);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleEditLancamento = (lancamento: Lancamento) => {
    setSelectedLancamento(lancamento);
    setOpenDialog(true);
  };
  
  const handleSuccess = () => {
    setOpenDialog(false);
  };
  
  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Lançamentos Financeiros
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleOpenDialog}
        >
          Novo Lançamento
        </Button>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Todos" />
          <Tab label="Entradas" />
          <Tab label="Saídas" />
          <Tab label="Pendentes" />
        </Tabs>
      </Paper>
      
      <LancamentoList onEdit={handleEditLancamento} />
      
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedLancamento ? 'Editar Lançamento' : 'Novo Lançamento'}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <LancamentoForm 
            lancamento={selectedLancamento} 
            onSuccess={handleSuccess} 
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default LancamentosPage;
```

## 3. Exemplos de Docker e Configuração

### 3.1 Dockerfile para Backend

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

### 3.2 Dockerfile para Frontend

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3.3 docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URI=mssql+pyodbc://username:password@host:port/database?driver=ODBC+Driver+17+for+SQL+Server
      - SECRET_KEY=your_secret_key_here
      - CORS_ORIGINS=http://localhost:3000,http://localhost
    depends_on:
      - migration

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend

  migration:
    build: ./backend
    command: alembic upgrade head
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URI=mssql+pyodbc://username:password@host:port/database?driver=ODBC+Driver+17+for+SQL+Server
    restart: on-failure
```

## 4. Exemplos de Prompts para IDEs com Agentes de IA

### 4.1 Prompt para Geração de Modelos SQLAlchemy

```
Crie modelos SQLAlchemy para a tabela {nome_tabela} do banco de dados SQL Server com os seguintes campos:

{lista_de_campos_e_tipos}

Considere os seguintes relacionamentos:
{lista_de_relacionamentos}

O modelo deve seguir as melhores práticas de SQLAlchemy, incluir tipagem adequada para SQL Server, e implementar relacionamentos bidirecionais quando apropriado.
```

### 4.2 Prompt para Geração de Endpoints FastAPI

```
Crie um conjunto completo de endpoints CRUD para a entidade {nome_entidade} usando FastAPI.

A entidade possui os seguintes atributos:
{lista_de_atributos}

Implemente:
1. Rota GET para listar todos os registros com paginação e filtros por {campos_para_filtro}
2. Rota GET para obter um registro específico por ID
3. Rota POST para criar um novo registro
4. Rota PUT para atualizar um registro existente
5. Rota DELETE para remover um registro
6. Rota PATCH para {operação_específica} (ex: confirmar um lançamento)

Utilize os padrões de projeto com separação em camadas (controller, service, repository).
Implemente validação de dados com Pydantic e tratamento adequado de erros.
```

### 4.3 Prompt para Geração de Componentes React

```
Crie um componente React com TypeScript para {funcionalidade} que:

1. Utilize hooks para gerenciamento de estado
2. Implemente formulário com validação usando {biblioteca_validação}
3. Conecte-se à API usando {biblioteca_http}
4. Seja responsivo para dispositivos móveis e desktop
5. Siga os padrões de design do Material-UI
6. Implemente tratamento de erros e feedback visual para o usuário

O componente deve lidar com os seguintes casos de uso:
{lista_casos_uso}

Considere as seguintes regras de negócio:
{regras_negócio}
```

### 4.4 Prompt para Geração de Testes

```
Crie testes unitários para {módulo_ou_componente} usando {framework_teste}.

O código a ser testado é:

```{linguagem}
{código_para_testar}
```

Implemente testes para os seguintes cenários:
1. {cenário_1}
2. {cenário_2}
3. {cenário_3}

Utilize mocks para dependências externas como banco de dados ou APIs.
Garanta cobertura de pelo menos 80% do código.
```

### 4.5 Prompt para Otimização de Desempenho

```
Analise o seguinte código {backend/frontend} e sugira otimizações de desempenho:

```{linguagem}
{código_para_otimizar}
```

Considere os seguintes aspectos:
1. Eficiência de consultas ao banco de dados
2. Carregamento e renderização de componentes
3. Gerenciamento de estado e memoização
4. Paginação e carregamento sob demanda
5. Caching e estratégias de revalidação

Forneça exemplos concretos de implementação para cada otimização sugerida.
```

## 5. Exemplos de Configuração para Responsividade Mobile

### 5.1 Configuração de Viewport e Media Queries

```html
<!-- index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```

```css
/* Breakpoints para diferentes tamanhos de tela */
:root {
  --breakpoint-xs: 0;
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
}

/* Media queries para responsividade */
@media (max-width: 576px) {
  .container {
    padding: 0.5rem;
  }
  
  .table-responsive {
    overflow-x: auto;
  }
  
  .hide-on-mobile {
    display: none;
  }
}

@media (min-width: 577px) and (max-width: 768px) {
  .container {
    padding: 1rem;
  }
}

@media (min-width: 769px) {
  .hide-on-desktop {
    display: none;
  }
}
```

### 5.2 Componente de Layout Responsivo

```tsx
import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children, sidebarContent }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
      {!isMobile && sidebarContent && (
        <Box
          component="aside"
          sx={{
            width: 280,
            flexShrink: 0,
            borderRight: `1px solid ${theme.palette.divider}`,
            height: '100vh',
            overflow: 'auto',
            position: 'sticky',
            top: 0,
            padding: 2,
          }}
        >
          {sidebarContent}
        </Box>
      )}
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: isMobile ? 2 : 3,
          width: isMobile ? '100%' : 'calc(100% - 280px)',
        }}
      >
        {isMobile && sidebarContent && (
          <Box sx={{ mb: 2 }}>
            {sidebarContent}
          </Box>
        )}
        {children}
      </Box>
    </Box>
  );
};

export default ResponsiveLayout;
```

### 5.3 Hook para Detecção de Dispositivo

```typescript
import { useEffect, useState } from 'react';

type DeviceType = 'mobile' | 'tablet' | 'desktop';

export const useDeviceDetect = (): { deviceType: DeviceType; isMobile: boolean; isTablet: boolean; isDesktop: boolean } => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width >= 768 && width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };
    
    // Inicializa
    handleResize();
    
    // Adiciona listener para redimensionamento
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
  };
};
```

## 6. Exemplos de Integração com SQL Server

### 6.1 Configuração de Conexão com SQL Server

```python
# app/core/config.py
from pydantic import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "API Financeira Locador"
    PROJECT_DESCRIPTION: str = "API para o módulo financeiro do sistema Locador"
    PROJECT_VERSION: str = "1.0.0"
    
    API_V1_STR: str = "/api/v1"
    
    # Configuração do banco de dados
    DATABASE_SERVER: str
    DATABASE_USER: str
    DATABASE_PASSWORD: str
    DATABASE_NAME: str
    DATABASE_PORT: str = "1433"
    DATABASE_DRIVER: str = "ODBC+Driver+17+for+SQL+Server"
    
    @property
    def DATABASE_URI(self) -> str:
        return f"mssql+pyodbc://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}@{self.DATABASE_SERVER}:{self.DATABASE_PORT}/{self.DATABASE_NAME}?driver={self.DATABASE_DRIVER}"
    
    # Configuração de segurança
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 dias
    
    # Configuração de CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

### 6.2 Exemplo de Consulta Complexa com SQLAlchemy

```python
# app/repositories/dashboard_repository.py
from sqlalchemy import func, and_, or_, text
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple

from app.models.lancamento import Lancamento
from app.models.conta_pagar import ContaPagar
from app.models.conta_receber import ContaReceber

class DashboardRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def get_fluxo_caixa(self, data_inicio: datetime, data_fim: datetime) -> List[Dict[str, Any]]:
        """Obtém o fluxo de caixa diário no período especificado"""
        # Subconsulta para lançamentos confirmados
        lancamentos_query = self.db.query(
            func.cast(Lancamento.Data, text('DATE')).label('data'),
            func.sum(Lancamento.Valor).filter(Lancamento.IndMov == 'E').label('entradas'),
            func.sum(Lancamento.Valor).filter(Lancamento.IndMov == 'S').label('saidas')
        ).filter(
            and_(
                Lancamento.Data >= data_inicio,
                Lancamento.Data <= data_fim,
                Lancamento.FlgConfirmacao == True
            )
        ).group_by(func.cast(Lancamento.Data, text('DATE')))
        
        # Executa a consulta e formata o resultado
        result = []
        for row in lancamentos_query.all():
            data = row.data
            entradas = float(row.entradas or 0)
            saidas = float(row.saidas or 0)
            saldo = entradas - saidas
            
            result.append({
                "data": data.strftime("%Y-%m-%d"),
                "entradas": entradas,
                "saidas": saidas,
                "saldo": saldo
            })
        
        return result
    
    def get_previsao_fluxo_caixa(self, dias: int = 30) -> List[Dict[str, Any]]:
        """Obtém a previsão de fluxo de caixa para os próximos dias"""
        hoje = datetime.now().date()
        data_fim = hoje + timedelta(days=dias)
        
        # Contas a pagar no período
        contas_pagar_query = self.db.query(
            func.cast(ContaPagar.DataVencimento, text('DATE')).label('data'),
            func.sum(ContaPagar.Valor - ContaPagar.ValorPago).label('valor')
        ).filter(
            and_(
                ContaPagar.DataVencimento >= hoje,
                ContaPagar.DataVencimento <= data_fim,
                ContaPagar.Status == 'A'  # Aberto
            )
        ).group_by(func.cast(ContaPagar.DataVencimento, text('DATE')))
        
        # Contas a receber no período
        contas_receber_query = self.db.query(
            func.cast(ContaReceber.DataVencimento, text('DATE')).label('data'),
            func.sum(ContaReceber.Valor - ContaReceber.ValorRecebido).label('valor')
        ).filter(
            and_(
                ContaReceber.DataVencimento >= hoje,
                ContaReceber.DataVencimento <= data_fim,
                ContaReceber.Status == 'A'  # Aberto
            )
        ).group_by(func.cast(ContaReceber.DataVencimento, text('DATE')))
        
        # Monta o resultado
        previsao = {}
        
        # Processa contas a pagar
        for row in contas_pagar_query.all():
            data_str = row.data.strftime("%Y-%m-%d")
            if data_str not in previsao:
                previsao[data_str] = {"data": data_str, "a_pagar": 0, "a_receber": 0, "saldo": 0}
            
            previsao[data_str]["a_pagar"] = float(row.valor or 0)
        
        # Processa contas a receber
        for row in contas_receber_query.all():
            data_str = row.data.strftime("%Y-%m-%d")
            if data_str not in previsao:
                previsao[data_str] = {"data": data_str, "a_pagar": 0, "a_receber": 0, "saldo": 0}
            
            previsao[data_str]["a_receber"] = float(row.valor or 0)
        
        # Calcula saldos
        for data_str in previsao:
            previsao[data_str]["saldo"] = previsao[data_str]["a_receber"] - previsao[data_str]["a_pagar"]
        
        # Converte para lista ordenada por data
        result = list(previsao.values())
        result.sort(key=lambda x: x["data"])
        
        return result
```

### 3.3 Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    environment:
      - DB_HOST=${DB_HOST}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGINS=${CORS_ORIGINS}
    depends_on:
      - db-migrations
    restart: unless-stopped
    networks:
      - app-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - REACT_APP_API_URL=${API_URL}
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - app-network

  db-migrations:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: ["alembic", "upgrade", "head"]
    environment:
      - DB_HOST=${DB_HOST}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
    depends_on:
      - db
    networks:
      - app-network

  db:
    image: mcr.microsoft.com/mssql/server:2019-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=${DB_PASSWORD}
      - MSSQL_PID=Express
    ports:
      - "1433:1433"
    volumes:
      - sqlserver-data:/var/opt/mssql
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  sqlserver-data:
```

## 4. Exemplos de Prompts para IDEs com Agentes de IA

### 4.1 Geração de Modelos SQLAlchemy

```
Gere um modelo SQLAlchemy para a tabela tbl_FINLancamentos com os seguintes campos:
- Id (int, primary_key)
- Descricao (string, max 255 caracteres)
- Valor (float)
- Data (datetime)
- DataEmissao (datetime, opcional)
- DataVencimento (datetime, opcional)
- Tipo (string, 1 caractere: 'E' para entrada, 'S' para saída)
- Status (string, 1 caractere: 'A' para aberto, 'C' para confirmado)
- Observacao (text, opcional)
- IdCategoria (int, foreign key para tbl_FINCategorias)
- IdConta (int, foreign key para tbl_Conta)
- IdFavorecido (int, foreign key para tbl_FINFavorecido)
- IdFormaPagamento (int, foreign key para tbl_FINFormaPagamento)

Adicione também campos de auditoria (DataCriacao, DataAlteracao, UsuarioCriacao, UsuarioAlteracao) e implemente os relacionamentos com as tabelas relacionadas.
```

### 4.2 Geração de Endpoints FastAPI

```
Crie um endpoint FastAPI para listar lançamentos financeiros com as seguintes características:

1. Rota: GET /api/lancamentos/
2. Suporte para paginação (skip e limit)
3. Filtros por:
   - data_inicio e data_fim (range de datas)
   - tipo (E ou S)
   - status (A ou C)
   - id_categoria
   - id_favorecido
   - descricao (busca parcial)
4. Ordenação por data (decrescente)
5. Retorno paginado com metadados (total, página atual, total de páginas)
6. Validação de parâmetros com Query do FastAPI
7. Documentação com docstrings

Utilize a arquitetura em camadas com repository, service e controller.
```

### 4.3 Geração de Componentes React

```
Crie um componente React responsivo para exibir um dashboard financeiro com as seguintes características:

1. Um card de resumo mostrando saldo atual, total de entradas e saídas do mês
2. Um gráfico de barras comparando receitas e despesas dos últimos 6 meses
3. Uma lista dos próximos 5 lançamentos a vencer
4. Um gráfico de pizza mostrando a distribuição de despesas por categoria
5. Filtros para selecionar período de análise

Utilize Material-UI para os componentes visuais, React Query para busca de dados, e Chart.js para os gráficos.
O componente deve ser responsivo, adaptando-se a dispositivos móveis e desktop.
```

### 4.4 Geração de Testes

```
Crie testes unitários para o serviço de lançamentos financeiros (LancamentoService) utilizando pytest.

Implemente testes para os seguintes cenários:
1. Obter lançamento por ID (sucesso e falha quando não encontrado)
2. Listar lançamentos com diferentes combinações de filtros
3. Criar novo lançamento
4. Atualizar lançamento existente
5. Excluir lançamento
6. Confirmar lançamento
7. Calcular saldo de período

Utilize mocks para simular o repositório e fixtures para configuração dos testes.
Garanta cobertura para casos de sucesso e tratamento de erros.
```

### 4.5 Otimização de Desempenho

```
Analise e otimize o seguinte código de consulta ao banco de dados para melhorar o desempenho:

```python
def get_lancamentos_by_filters(self, db, **filters):
    query = db.query(self.model)
    
    if 'data_inicio' in filters and filters['data_inicio']:
        query = query.filter(self.model.Data >= filters['data_inicio'])
    if 'data_fim' in filters and filters['data_fim']:
        query = query.filter(self.model.Data <= filters['data_fim'])
    if 'tipo' in filters and filters['tipo']:
        query = query.filter(self.model.Tipo == filters['tipo'])
    if 'status' in filters and filters['status']:
        query = query.filter(self.model.Status == filters['status'])
    if 'id_categoria' in filters and filters['id_categoria']:
        query = query.filter(self.model.IdCategoria == filters['id_categoria'])
    if 'id_favorecido' in filters and filters['id_favorecido']:
        query = query.filter(self.model.IdFavorecido == filters['id_favorecido'])
    if 'descricao' in filters and filters['descricao']:
        query = query.filter(self.model.Descricao.like(f"%{filters['descricao']}%"))
        
    return query.all()
```

Considere:
1. Uso de índices apropriados
2. Otimização de consultas com joins
3. Implementação de paginação eficiente
4. Estratégias de cache
5. Carregamento seletivo de relacionamentos
```

## 5. Exemplos de Configuração para Responsividade Mobile

### 5.1 Configuração de Viewport

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <meta name="theme-color" content="#1976d2" />
    <meta
      name="description"
      content="Sistema de Gestão Financeira"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>Sistema Financeiro</title>
  </head>
  <body>
    <noscript>Você precisa habilitar JavaScript para executar este aplicativo.</noscript>
    <div id="root"></div>
  </body>
</html>
```

### 5.2 Media Queries em CSS

```css
/* src/styles/responsive.css */

/* Base styles (mobile first) */
.container {
  padding: 1rem;
}

.card {
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-container {
  overflow-x: auto;
}

/* Tablet (portrait) */
@media (min-width: 600px) {
  .container {
    padding: 1.5rem;
  }
  
  .card {
    padding: 1.5rem;
  }
  
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

/* Desktop */
@media (min-width: 960px) {
  .container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }
  
  .sidebar {
    width: 250px;
  }
  
  .main-content {
    margin-left: 250px;
  }
}

/* Large desktop */
@media (min-width: 1280px) {
  .container {
    max-width: 1400px;
  }
}

/* Print styles */
@media print {
  .no-print {
    display: none;
  }
  
  .container {
    padding: 0;
    max-width: 100%;
  }
}
```

### 5.3 Componente de Layout Responsivo

```tsx
// src/components/common/ResponsiveLayout.tsx
import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Hidden,
  Box,
  useMediaQuery,
  useTheme,
  Container,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AttachMoney as LancamentosIcon,
  AccountBalanceWallet as ContasIcon,
  Category as CategoriasIcon,
  Person as FavorecidosIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title: string;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children, title }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Lançamentos', icon: <LancamentosIcon />, path: '/lancamentos' },
    { text: 'Contas a Pagar', icon: <ContasIcon />, path: '/contas-pagar' },
    { text: 'Contas a Receber', icon: <ContasIcon />, path: '/contas-receber' },
    { text: 'Categorias', icon: <CategoriasIcon />, path: '/categorias' },
    { text: 'Favorecidos', icon: <FavorecidosIcon />, path: '/favorecidos' },
  ];
  
  const drawer = (
    <div>
      <Box p={2} display="flex" alignItems="center" justifyContent="center">
        <Typography variant="h6" noWrap>
          Sistema Financeiro
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={() => alert('Logout')}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Sair" />
        </ListItem>
      </List>
    </div>
  );
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="abrir menu"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Box component="nav" sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}>
        {/* Drawer para dispositivos móveis */}
        <Hidden smUp implementation="css">
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        
        {/* Drawer permanente para desktop */}
        <Hidden smDown implementation="css">
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          mt: '64px',
          backgroundColor: theme.palette.background.default,
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default ResponsiveLayout;
```

### 5.4 Hook para Detecção de Dispositivo

```tsx
// src/hooks/useDevice.ts
import { useMediaQuery, useTheme } from '@mui/material';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
}

export const useDevice = (): DeviceInfo => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  // Detectar orientação
  const isPortrait = useMediaQuery('(orientation: portrait)');
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    orientation: isPortrait ? 'portrait' : 'landscape'
  };
};
```

## 6. Exemplos de Integração com SQL Server

### 6.1 Configuração de Conexão

```python
# app/core/database.py
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import urllib.parse

# Configuração da conexão com SQL Server
params = urllib.parse.quote_plus(
    f"DRIVER={{ODBC Driver 17 for SQL Server}};"
    f"SERVER={settings.DB_HOST};"
    f"DATABASE={settings.DB_NAME};"
    f"UID={settings.DB_USER};"
    f"PWD={settings.DB_PASSWORD};"
    f"TrustServerCertificate=yes;"
)

CONNECTION_STRING = f"mssql+pyodbc:///?odbc_connect={params}"

engine = create_engine(
    CONNECTION_STRING,
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args={"autocommit": False},
    echo=settings.SQL_ECHO
)

# Otimizações para SQL Server
@event.listens_for(engine, "before_cursor_execute")
def receive_before_cursor_execute(conn, cursor, statement, params, context, executemany):
    if executemany:
        cursor.fast_executemany = True

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Função para obter sessão do banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 6.2 Exemplo de Consulta Complexa com SQLAlchemy

```python
# app/repositories/dashboard_repository.py
from sqlalchemy import func, and_, or_, case, literal, text
from sqlalchemy.orm import Session, aliased
from datetime import datetime, timedelta
from typing import Dict, List, Any

from app.models.lancamento import Lancamento
from app.models.conta_pagar import ContaPagar
from app.models.conta_receber import ContaReceber
from app.models.categoria import Categoria

class DashboardRepository:
    def get_fluxo_caixa(self, db: Session, data_inicio: datetime, data_fim: datetime) -> Dict[str, Any]:
        # Subconsulta para lançamentos confirmados
        lancamentos = db.query(
            func.sum(case([(Lancamento.Tipo == 'E', Lancamento.Valor)], else_=0)).label('entradas'),
            func.sum(case([(Lancamento.Tipo == 'S', Lancamento.Valor)], else_=0)).label('saidas'),
            func.date(Lancamento.Data).label('data')
        ).filter(
            Lancamento.Status == 'C',
            Lancamento.Data >= data_inicio,
            Lancamento.Data <= data_fim
        ).group_by(func.date(Lancamento.Data)).subquery()
        
        # Subconsulta para contas a pagar
        contas_pagar = db.query(
            func.sum(ContaPagar.Value).label('valor'),
            func.date(ContaPagar.DueDate).label('data')
        ).filter(
            ContaPagar.Status == 'A',  # Apenas contas abertas
            ContaPagar.DueDate >= data_inicio,
            ContaPagar.DueDate <= data_fim
        ).group_by(func.date(ContaPagar.DueDate)).subquery()
        
        # Subconsulta para contas a receber
        contas_receber = db.query(
            func.sum(ContaReceber.Value).label('valor'),
            func.date(ContaReceber.DueDate).label('data')
        ).filter(
            ContaReceber.Status == 'A',  # Apenas contas abertas
            ContaReceber.DueDate >= data_inicio,
            ContaReceber.DueDate <= data_fim
        ).group_by(func.date(ContaReceber.DueDate)).subquery()
        
        # Consulta principal para obter todas as datas no período
        datas_query = db.query(
            func.dateadd(text("day"), func.row_number().over() - 1, literal(data_inicio)).label('data')
        ).from_statement(
            text(f"SELECT TOP {(data_fim - data_inicio).days + 1} ROW_NUMBER() OVER (ORDER BY object_id) FROM sys.objects")
        ).subquery()
        
        # Consulta final juntando todas as informações
        result = db.query(
            datas_query.c.data.label('data'),
            func.coalesce(lancamentos.c.entradas, 0).label('entradas'),
            func.coalesce(lancamentos.c.saidas, 0).label('saidas'),
            func.coalesce(contas_pagar.c.valor, 0).label('a_pagar'),
            func.coalesce(contas_receber.c.valor, 0).label('a_receber')
        ).outerjoin(
            lancamentos, datas_query.c.data == lancamentos.c.data
        ).outerjoin(
            contas_pagar, datas_query.c.data == contas_pagar.c.data
        ).outerjoin(
            contas_receber, datas_query.c.data == contas_receber.c.data
        ).order_by(datas_query.c.data).all()
        
        # Formatar resultado
        fluxo_caixa = []
        saldo_acumulado = 0
        
        for row in result:
            data_str = row.data.strftime('%Y-%m-%d')
            entradas = float(row.entradas)
            saidas = float(row.saidas)
            saldo_dia = entradas - saidas
            saldo_acumulado += saldo_dia
            
            fluxo_caixa.append({
                'data': data_str,
                'entradas': entradas,
                'saidas': saidas,
                'saldo_dia': saldo_dia,
                'saldo_acumulado': saldo_acumulado,
                'a_pagar': float(row.a_pagar),
                'a_receber': float(row.a_receber)
            })
        
        return {
            'fluxo_diario': fluxo_caixa,
            'totais': {
                'entradas': sum(item['entradas'] for item in fluxo_caixa),
                'saidas': sum(item['saidas'] for item in fluxo_caixa),
                'saldo': saldo_acumulado,
                'a_pagar': sum(item['a_pagar'] for item in fluxo_caixa),
                'a_receber': sum(item['a_receber'] for item in fluxo_caixa)
            }
        }
    
    def get_previsao_fluxo_caixa(self, db: Session, dias: int = 30) -> List[Dict[str, Any]]:
        data_atual = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        data_fim = data_atual + timedelta(days=dias)
        
        # Dicionário para armazenar previsão por data
        previsao = {}
        
        # Inicializar todas as datas no período
        for i in range(dias + 1):
            data = data_atual + timedelta(days=i)
            data_str = data.strftime('%Y-%m-%d')
            previsao[data_str] = {
                'data': data_str,
                'a_pagar': 0.0,
                'a_receber': 0.0
            }
        
        # Buscar contas a pagar
        contas_pagar = db.query(
            func.date(ContaPagar.DueDate).label('data'),
            func.sum(ContaPagar.Value).label('valor')
        ).filter(
            ContaPagar.Status == 'A',
            ContaPagar.DueDate >= data_atual,
            ContaPagar.DueDate <= data_fim
        ).group_by(func.date(ContaPagar.DueDate)).all()
        
        # Adicionar contas a pagar à previsão
        for cp in contas_pagar:
            data_str = cp.data.strftime('%Y-%m-%d')
            if data_str in previsao:
                previsao[data_str]['a_pagar'] = float(cp.valor)
        
        # Buscar contas a receber
        contas_receber = db.query(
            func.date(ContaReceber.DueDate).label('data'),
            func.sum(ContaReceber.Value).label('valor')
        ).filter(
            ContaReceber.Status == 'A',
            ContaReceber.DueDate >= data_atual,
            ContaReceber.DueDate <= data_fim
        ).group_by(func.date(ContaReceber.DueDate)).all()
        
        # Adicionar contas a receber à previsão
        for cr in contas_receber:
            data_str = cr.data.strftime('%Y-%m-%d')
            if data_str in previsao:
                previsao[data_str]['a_receber'] = float(cr.valor)
        
        # Calcula saldos
        for data_str in previsao:
            previsao[data_str]["saldo"] = previsao[data_str]["a_receber"] - previsao[data_str]["a_pagar"]
        
        # Converte para lista ordenada por data
        result = list(previsao.values())
        result.sort(key=lambda x: x["data"])
        
        return result
```

Estes exemplos de código complementam o planejamento principal e fornecem uma base sólida para o desenvolvimento do aplicativo web financeiro, abrangendo tanto o backend em Python/FastAPI quanto o frontend em React/TypeScript, com foco em responsividade para dispositivos móveis e integração com o banco de dados SQL Server existente.