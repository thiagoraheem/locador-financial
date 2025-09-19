import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from app.core.database import get_db
from app.core.security import JWTUtil
from datetime import datetime, timedelta
import os

# Configuração do banco de teste
TEST_DATABASE_URL = "sqlite:///:memory:"

# Engine de teste
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)

# Desabilitar foreign keys no SQLite para testes
@event.listens_for(test_engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=OFF")
    cursor.close()

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="function")
def db_session():
    """Cria uma sessão de banco de dados para cada teste"""
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client():
    """Cliente de teste simples para testes de API"""
    # Import app here to avoid circular imports
    from app.main import app
    
    # Para testes simples de autenticação, não precisamos do banco
    yield TestClient(app)

# Fixtures de dados de teste
@pytest.fixture
def test_user_data():
    """Dados de usuário para testes"""
    return {
        "login": "admin",
        "senha": "123456",
        "email": "admin@locador.com"
    }

@pytest.fixture
def authenticated_user(client, test_user_data):
    """Usuário autenticado para testes"""
    # Usar senha master para testes
    response = client.post("/api/v1/auth/login", json={
        "login": "admin",
        "senha": "YpP7sPnjw2G/TO5357wt1w=="  # senha master
    })
    
    if response.status_code == 200:
        token_data = response.json()
        return {
            "token": token_data["access_token"],
            "user_data": test_user_data
        }
    
    return None

@pytest.fixture
def auth_token(test_user_data):
    """Token de autenticação para testes"""
    jwt_util = JWTUtil()
    token_data = {"sub": str(test_user_data["cod_funcionario"])}
    return jwt_util.create_access_token(data=token_data)

@pytest.fixture
def auth_headers(auth_token):
    """Headers de autenticação para testes"""
    return {"Authorization": f"Bearer {auth_token}"}

@pytest.fixture
def sample_lancamentos(db_session):
    """Dados de exemplo de lançamentos para testes"""
    from app.models.lancamento import Lancamento
    from datetime import date, datetime
    
    lancamentos = [
        Lancamento(
            data=date.today(),
            descricao="Teste Receita",
            valor=1000.00,
            tipo="R",
            created_at=datetime.now()
        ),
        Lancamento(
            data=date.today(),
            descricao="Teste Despesa",
            valor=500.00,
            tipo="D",
            created_at=datetime.now()
        )
    ]
    
    for lancamento in lancamentos:
        db_session.add(lancamento)
    db_session.commit()
    
    return lancamentos