import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import get_db, Base

# Banco de dados de teste em memória
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dados de teste
@pytest.fixture
def test_user_data():
    return {
        "login": "admin",
        "senha": "123456"
    }

@pytest.fixture
def auth_headers(client, test_user_data):
    """Retorna headers de autenticação para testes"""
    # Para testes, podemos usar um usuário mock ou senha master
    response = client.post("/api/v1/auth/login", json={
        "login": "admin",
        "senha": "YpP7sPnjw2G/TO5357wt1w=="  # senha master
    })
    
    if response.status_code == 200:
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    return {}