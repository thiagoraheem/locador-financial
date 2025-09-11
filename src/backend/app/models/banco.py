"""
Modelo de Bancos
"""
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Banco(Base):
    """Modelo para bancos do sistema financeiro nacional"""
    
    __tablename__ = "tbl_Banco"

    CodBanco = Column(Integer, primary_key=True, index=True)
    NomBanco = Column(String(100), nullable=False)
    CodBacen = Column(String(10), unique=True, index=True)
    Site = Column(String(200))
    
    # Colunas de auditoria (conforme estrutura real da tabela)
    DatCadastro = Column(DateTime, default=datetime.utcnow, nullable=False)
    NomUsuario = Column(String(15), nullable=False)
    DatAlteracao = Column(DateTime, onupdate=datetime.utcnow, nullable=True)
    NomUsuarioAlteracao = Column(String(15), nullable=True)
    
    # Relacionamentos
    contas = relationship("Conta", back_populates="banco")
    
    # Propriedades de compatibilidade para schemas
    @property
    def DtCreate(self):
        return self.DatCadastro
    
    @property
    def DtAlter(self):
        return self.DatAlteracao
    
    def __repr__(self):
        return f"<Banco(Codigo={self.Codigo}, Nome='{self.Nome}')>"
    
    @property
    def codigo_completo(self) -> str:
        """Retorna código do banco com dígito"""
        if self.Digito:
            return f"{self.Codigo}-{self.Digito}"
        return str(self.Codigo)
    
    @property
    def is_active(self) -> bool:
        """Verifica se o banco está ativo"""
        return self.FlgAtivo == 'S'
    
    @classmethod
    def validate_codigo_febraban(cls, codigo: int) -> bool:
        """Valida se o código está dentro do padrão FEBRABAN (001-999)"""
        return 1 <= codigo <= 999