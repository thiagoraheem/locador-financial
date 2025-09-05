"""
Core configuration settings for the Financial Web Application
"""
from typing import List, Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Informações do Projeto
    PROJECT_NAME: str = "Sistema Financeiro Locador"
    PROJECT_DESCRIPTION: str = "API REST para gestão financeira do sistema Locador"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Configurações de Segurança
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24
    
    # Senha master do sistema (compatível com sistema atual)
    MASTER_PASSWORD: str = "YpP7sPnjw2G/TO5357wt1w=="
    
    # Configurações do Banco de Dados
    DATABASE_URI: str = "mssql+pyodbc://financeiro:BlomaqFinanceiro$@54.232.194.197:1433/Locador_2?driver=ODBC+Driver+17+for+SQL+Server"
    
    # Configurações de CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
    ]
    
    # Configurações de Redis (opcional)
    REDIS_URL: Optional[str] = "redis://localhost:6379"
    
    # Configurações de Logging
    LOG_LEVEL: str = "INFO"
    
    # Configurações de Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 5
    RATE_LIMIT_WINDOW: int = 60  # seconds
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()