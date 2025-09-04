"""
Modelo de Categorias Financeiras
"""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.mixins import LoginAuditMixin


class Categoria(Base, LoginAuditMixin):
    """Modelo para categorias financeiras"""
    
    __tablename__ = "tbl_FINCategorias"

    CodCategoria = Column(Integer, primary_key=True, index=True)
    NomCategoria = Column(String(100), nullable=False)
    Descricao = Column(String(500))
    TipoCategoria = Column(String(1), nullable=False)  # R: Receita, D: Despesa, T: Transferência
    CodCategoriaPai = Column(Integer, ForeignKey("tbl_FINCategorias.CodCategoria"), nullable=True)
    FlgAtivo = Column(String(1), default='S')  # S: Sim, N: Não
    
    # Relacionamento hierárquico
    categoria_pai = relationship("Categoria", remote_side=[CodCategoria], back_populates="subcategorias")
    subcategorias = relationship("Categoria", back_populates="categoria_pai")
    
    # Relacionamento com lançamentos
    lancamentos = relationship("Lancamento", back_populates="categoria")
    
    def __repr__(self):
        return f"<Categoria(CodCategoria={self.CodCategoria}, NomCategoria='{self.NomCategoria}')>"