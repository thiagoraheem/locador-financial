"""
Modelo de Bancos
"""
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Banco(Base):
    __tablename__ = "tbl_Banco"
    
    Codigo = Column(Integer, primary_key=True, index=True)
    Digito = Column(String(4), nullable=True)
    Nome = Column(String(100), nullable=True)
    
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
        """Verifica se o banco está ativo - sempre True pois não há campo FlgAtivo"""
        return True
    
    @classmethod
    def validate_codigo_febraban(cls, codigo: int) -> bool:
        """Valida se o código está dentro do padrão FEBRABAN (001-999)"""
        return 1 <= codigo <= 999