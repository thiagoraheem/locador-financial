"""
Modelo de Bancos
"""
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.mixins import LoginAuditMixin


class Banco(Base, LoginAuditMixin):
    """Modelo para bancos do sistema financeiro nacional"""
    
    __tablename__ = "tbl_Banco"

    Codigo = Column(Integer, primary_key=True, index=True, comment="Código do banco (padrão FEBRABAN)")
    Digito = Column(String(1), comment="Dígito verificador do banco")
    Nome = Column(String(100), nullable=False, comment="Nome do banco")
    NomeAbreviado = Column(String(20), comment="Nome abreviado do banco")
    FlgAtivo = Column(String(1), default='S', comment="S=Ativo, N=Inativo")
    
    # Relacionamentos
    contas = relationship("Conta", back_populates="banco")
    clientes_contas = relationship("ClienteConta", back_populates="banco")
    
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