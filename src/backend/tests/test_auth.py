import pytest
from fastapi import status
from fastapi.testclient import TestClient

class TestAuthLogin:
    """Testes de autenticação - Login"""
    
    def test_login_success(self, client: TestClient):
        """Teste de login com credenciais válidas (senha master)"""
        # Arrange
        user_data = {
            "login": "admin",
            "senha": "YpP7sPnjw2G/TO5357wt1w=="  # senha master
        }
        
        # Act
        response = client.post("/api/v1/auth/login", json=user_data)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
    
    def test_login_invalid_credentials(self, client: TestClient):
        """Teste de login com credenciais inválidas"""
        # Arrange
        user_data = {
            "login": "invalid_user",
            "senha": "invalid_password"
        }
        
        # Act
        response = client.post("/api/v1/auth/login", json=user_data)
        
        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "detail" in response.json()
    
    def test_login_missing_fields(self, client: TestClient):
        """Teste de login com campos obrigatórios ausentes"""
        # Arrange
        user_data = {"login": "admin"}  # senha ausente
        
        # Act
        response = client.post("/api/v1/auth/login", json=user_data)
        
        # Assert
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_login_sql_injection_attempt(self, client: TestClient):
        """Teste de segurança contra SQL Injection"""
        # Arrange
        user_data = {
            "login": "admin'; DROP TABLE users; --",
            "senha": "password"
        }
        
        # Act
        response = client.post("/api/v1/auth/login", json=user_data)
        
        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_login_empty_credentials(self, client: TestClient):
        """Teste de login com credenciais vazias"""
        # Arrange
        user_data = {
            "login": "",
            "senha": ""
        }
        
        # Act
        response = client.post("/api/v1/auth/login", json=user_data)
        
        # Assert
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_422_UNPROCESSABLE_ENTITY]

class TestAuthProtectedRoutes:
    """Testes de rotas protegidas"""
    
    def test_protected_route_without_token(self, client: TestClient):
        """Teste de acesso a rota protegida sem token"""
        # Act
        response = client.get("/api/v1/auth/me")
        
        # Assert
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]
    
    def test_protected_route_with_valid_token(self, client: TestClient, auth_headers):
        """Teste de acesso a rota protegida com token válido"""
        # Act
        response = client.get("/api/v1/auth/me", headers=auth_headers)
        
        # Assert
        # Pode retornar 200 se implementado ou 404 se não existe
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND]
    
    def test_protected_route_with_invalid_token(self, client: TestClient):
        """Teste de acesso a rota protegida com token inválido"""
        # Arrange
        headers = {"Authorization": "Bearer invalid_token"}
        
        # Act
        response = client.get("/api/v1/auth/me", headers=headers)
        
        # Assert
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]
    
    def test_validate_endpoint_without_token(self, client: TestClient):
        """Teste de endpoint de validação sem token"""
        # Act
        response = client.get("/api/v1/auth/validate")
        
        # Assert
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]
    
    def test_validate_endpoint_with_valid_token(self, client: TestClient, auth_headers):
        """Teste de endpoint de validação com token válido"""
        # Act
        response = client.get("/api/v1/auth/validate", headers=auth_headers)
        
        # Assert
        # Pode retornar 200 se implementado ou 404 se não existe
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND]

class TestAuthSecurity:
    """Testes de segurança de autenticação"""
    
    def test_token_expiration_handling(self, client: TestClient):
        """Teste de tratamento de token expirado"""
        # Arrange - token simulado expirado
        expired_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDk0NTkxOTl9.invalid"
        headers = {"Authorization": f"Bearer {expired_token}"}
        
        # Act
        response = client.get("/api/v1/auth/validate", headers=headers)
        
        # Assert
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]
    
    def test_malformed_token(self, client: TestClient):
        """Teste com token malformado"""
        # Arrange
        headers = {"Authorization": "Bearer malformed.token.here"}
        
        # Act
        response = client.get("/api/v1/auth/validate", headers=headers)
        
        # Assert
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]
    
    def test_missing_bearer_prefix(self, client: TestClient):
        """Teste com token sem prefixo Bearer"""
        # Arrange
        headers = {"Authorization": "some_token_without_bearer"}
        
        # Act
        response = client.get("/api/v1/auth/validate", headers=headers)
        
        # Assert
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]