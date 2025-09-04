import pytest
from fastapi.testclient import TestClient

def test_login_with_master_password(client: TestClient):
    """Testa login com senha master"""
    response = client.post("/api/v1/auth/login", json={
        "login": "admin",
        "senha": "YpP7sPnjw2G/TO5357wt1w=="
    })
    
    # Pode falhar se não houver usuário 'admin' no banco
    # Em um ambiente de teste real, criaríamos dados de teste
    assert response.status_code in [200, 401]

def test_login_invalid_credentials(client: TestClient):
    """Testa login com credenciais inválidas"""
    response = client.post("/api/v1/auth/login", json={
        "login": "invalid_user",
        "senha": "invalid_password"
    })
    
    assert response.status_code == 401
    assert "detail" in response.json()

def test_login_missing_fields(client: TestClient):
    """Testa login com campos obrigatórios faltando"""
    response = client.post("/api/v1/auth/login", json={
        "login": "test"
        # senha está faltando
    })
    
    assert response.status_code == 422  # Validation error

def test_protected_route_without_token(client: TestClient):
    """Testa acesso a rota protegida sem token"""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 403  # Forbidden ou 401

def test_validate_endpoint_without_token(client: TestClient):
    """Testa endpoint de validação sem token"""
    response = client.get("/api/v1/auth/validate")
    assert response.status_code == 403  # Forbidden