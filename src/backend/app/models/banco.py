"""
Modelo de Bancos
"""
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Banco(Base):
    __tablename__ = "tbl_Banco"
    
    # Campos conforme estrutura real da tabela tbl_Banco
    Codigo = Column(Integer, primary_key=True, name='Codigo', nullable=False)
    Digito = Column(String(4), name='Digito')
    Nome = Column(String(100), name='Nome')
    
    # Relacionamentos
    contas = relationship("Conta", back_populates="banco")
    
    def __repr__(self):
        return f"<Banco(Codigo={self.Codigo}, Nome='{self.Nome}')>"
    
    @property
    def codigo_completo(self) -> str:
        """Retorna código do banco com dígito"""
        if self.Digito:
            return f"{self.Codigo}-{self.Digito}"
        return str(self.Codigo)
    
    @classmethod
    def validate_codigo_febraban(cls, codigo: int) -> bool:
        """Valida se o código está dentro do padrão FEBRABAN (001-999)"""
        return 1 <= codigo <= 999