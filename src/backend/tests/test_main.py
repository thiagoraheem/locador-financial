import pytest
from fastapi.testclient import TestClient

def test_health_check(client: TestClient):
    """Testa o endpoint de health check"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "locador-financial-api"}

def test_root_endpoint(client: TestClient):
    """Testa o endpoint raiz"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "Sistema Financeiro" in data["message"]

def test_openapi_docs(client: TestClient):
    """Testa se a documentação OpenAPI está disponível"""
    response = client.get("/api/v1/openapi.json")
    assert response.status_code == 200
    
def test_docs_ui(client: TestClient):
    """Testa se a UI da documentação está acessível"""
    response = client.get("/docs")
    assert response.status_code == 200