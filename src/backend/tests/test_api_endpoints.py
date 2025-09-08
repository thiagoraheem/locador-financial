"""
Tests for API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_empresas_endpoint():
    """Test empresas endpoint exists"""
    response = client.get("/api/v1/empresas/")
    # Should return 403 Forbidden without authentication
    assert response.status_code == 403

def test_bancos_endpoint():
    """Test bancos endpoint exists"""
    response = client.get("/api/v1/bancos/")
    # Should return 403 Forbidden without authentication
    assert response.status_code == 403

def test_contas_endpoint():
    """Test contas endpoint exists"""
    response = client.get("/api/v1/contas/")
    # Should return 403 Forbidden without authentication
    assert response.status_code == 403

def test_clientes_endpoint():
    """Test clientes endpoint exists"""
    response = client.get("/api/v1/clientes/")
    # Should return 403 Forbidden without authentication
    assert response.status_code == 403