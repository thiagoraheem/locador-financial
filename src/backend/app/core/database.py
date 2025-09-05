from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import logging

# Configuração do engine SQLAlchemy
try:
    engine = create_engine(
        settings.DATABASE_URI,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=5,
        max_overflow=0,
        connect_args={
            "TrustServerCertificate": "yes",
            "timeout": 30
        } if "mssql" in settings.DATABASE_URI else {}
    )
    logging.info("Conexão com banco de dados estabelecida com sucesso")
except Exception as e:
    logging.error(f"Erro ao conectar ao banco de dados: {e}")
    logging.error(f"String de conexão utilizada: {settings.DATABASE_URI}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency para injeção da sessão do banco de dados
def get_db():
    """
    Dependency que fornece uma sessão de banco de dados
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()