"""
Tests for Empresa module
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.models.empresa import Empresa

client = TestClient(app)

def test_create_empresa(client, db_session: Session, auth_headers):
    """Test creating a new empresa"""
    empresa_data = {
        "NomEmpresa": "Test Company",
        "RazaoSocial": "Test Company LTDA",
        "CNPJ": "12345678901234",
        "FlgPadrao": False,
        "FlgAtivo": "S"
    }
    
    response = client.post("/api/v1/empresas/", json=empresa_data, headers=auth_headers)
    assert response.status_code == 201
    
    data = response.json()
    assert data["NomEmpresa"] == empresa_data["NomEmpresa"]
    assert data["RazaoSocial"] == empresa_data["RazaoSocial"]
    assert data["CNPJ"] == empresa_data["CNPJ"]

def test_get_empresa(client, db_session: Session, auth_headers):
    """Test getting an empresa by ID"""
    # First create an empresa
    empresa = Empresa(
        NomEmpresa="Test Company",
        RazaoSocial="Test Company LTDA",
        CNPJ="12345678901234",
        NomUsuario="test"
    )
    db_session.add(empresa)
    db_session.commit()
    db_session.refresh(empresa)
    
    # Then get it
    response = client.get(f"/api/v1/empresas/{empresa.CodEmpresa}", headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["CodEmpresa"] == empresa.CodEmpresa
    assert data["NomEmpresa"] == empresa.NomEmpresa

def test_list_empresas(client, db_session: Session, auth_headers):
    """Test listing empresas"""
    # Create a couple of empresas
    empresa1 = Empresa(
        NomEmpresa="Company 1",
        RazaoSocial="Company 1 LTDA",
        CNPJ="12345678901234",
        NomUsuario="test"
    )
    empresa2 = Empresa(
        NomEmpresa="Company 2",
        RazaoSocial="Company 2 LTDA",
        CNPJ="43210987654321",
        NomUsuario="test"
    )
    db_session.add(empresa1)
    db_session.add(empresa2)
    db_session.commit()
    
    # List them
    response = client.get("/api/v1/empresas/", headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) >= 2

def test_update_empresa(client, db_session: Session, auth_headers):
    """Test updating an empresa"""
    # First create an empresa
    empresa = Empresa(
        NomEmpresa="Original Name",
        RazaoSocial="Original LTDA",
        CNPJ="12345678901234",
        NomUsuario="test"
    )
    db_session.add(empresa)
    db_session.commit()
    db_session.refresh(empresa)
    
    # Update it
    update_data = {
        "NomEmpresa": "Updated Name",
        "RazaoSocial": "Updated LTDA"
    }
    
    response = client.put(f"/api/v1/empresas/{empresa.CodEmpresa}", json=update_data, headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["NomEmpresa"] == update_data["NomEmpresa"]
    assert data["RazaoSocial"] == update_data["RazaoSocial"]

def test_delete_empresa(client, db_session: Session, auth_headers):
    """Test deleting an empresa"""
    # First create an empresa
    empresa = Empresa(
        NomEmpresa="To Delete",
        RazaoSocial="To Delete LTDA",
        CNPJ="12345678901234",
        NomUsuario="test"
    )
    db_session.add(empresa)
    db_session.commit()
    db_session.refresh(empresa)
    
    # Delete it
    response = client.delete(f"/api/v1/empresas/{empresa.CodEmpresa}", headers=auth_headers)
    assert response.status_code == 200
    
    # Verify it's marked as inactive
    deleted_empresa = db_session.query(Empresa).filter(Empresa.CodEmpresa == empresa.CodEmpresa).first()
    assert deleted_empresa.FlgAtivo == 'N'