"""
Tests for Banco module
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.models.banco import Banco

client = TestClient(app)

def test_create_banco(client, db_session: Session, auth_headers):
    """Test creating a new banco"""
    banco_data = {
        "Codigo": 123,
        "Nome": "Test Bank",
        "FlgAtivo": "S"
    }
    
    response = client.post("/api/v1/bancos/", json=banco_data, headers=auth_headers)
    assert response.status_code == 201
    
    data = response.json()
    assert data["Codigo"] == banco_data["Codigo"]
    assert data["Nome"] == banco_data["Nome"]

def test_get_banco(client, db_session: Session, auth_headers):
    """Test getting a banco by ID"""
    # First create a banco
    banco = Banco(
        Codigo=321,
        Nome="Test Bank",
        NomUsuario="test"
    )
    db_session.add(banco)
    db_session.commit()
    db_session.refresh(banco)
    
    # Then get it
    response = client.get(f"/api/v1/bancos/{banco.Codigo}", headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["Codigo"] == banco.Codigo
    assert data["Nome"] == banco.Nome

def test_list_bancos(client, db_session: Session, auth_headers):
    """Test listing bancos"""
    # Create a couple of bancos
    banco1 = Banco(
        Codigo=100,
        Nome="Bank 1",
        NomUsuario="test"
    )
    banco2 = Banco(
        Codigo=200,
        Nome="Bank 2",
        NomUsuario="test"
    )
    db_session.add(banco1)
    db_session.add(banco2)
    db_session.commit()
    
    # List them
    response = client.get("/api/v1/bancos/", headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) >= 2

def test_update_banco(client, db_session: Session, auth_headers):
    """Test updating a banco"""
    # First create a banco
    banco = Banco(
        Codigo=999,
        Nome="Original Bank",
        NomUsuario="test"
    )
    db_session.add(banco)
    db_session.commit()
    db_session.refresh(banco)
    
    # Update it
    update_data = {
        "Nome": "Updated Bank"
    }
    
    response = client.put(f"/api/v1/bancos/{banco.Codigo}", json=update_data, headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["Nome"] == update_data["Nome"]

def test_delete_banco(client, db_session: Session, auth_headers):
    """Test deleting a banco"""
    # First create a banco
    banco = Banco(
        Codigo=777,
        Nome="To Delete Bank",
        NomUsuario="test"
    )
    db_session.add(banco)
    db_session.commit()
    db_session.refresh(banco)
    
    # Delete it
    response = client.delete(f"/api/v1/bancos/{banco.Codigo}", headers=auth_headers)
    assert response.status_code == 200
    
    # Verify it's marked as inactive
    deleted_banco = db_session.query(Banco).filter(Banco.Codigo == banco.Codigo).first()
    assert deleted_banco.FlgAtivo == 'N'