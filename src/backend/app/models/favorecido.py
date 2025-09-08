"""
Modelo de Favorecidos
"""
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.mixins import LoginAuditMixin


class Favorecido(Base, LoginAuditMixin):
    """Modelo para favorecidos/beneficiários dos lançamentos"""
    
    __tablename__ = "tbl_FINFavorecido"

    CodFavorecido = Column(Integer, primary_key=True, index=True)
    NomFavorecido = Column(String(100), nullable=False)
    TipoFavorecido = Column(String(1), nullable=False)  # F: Físico, J: Jurídico
    CPF_CNPJ = Column(String(20))
    Telefone = Column(String(20))
    Email = Column(String(100))
    Endereco = Column(String(200))
    FlgAtivo = Column(String(1), default='S')  # S: Sim, N: Não
    
    # Relacionamento com lançamentos
    lancamentos = relationship("Lancamento", back_populates="favorecido")
    
    # Relacionamento com contas a pagar
    contas_pagar = relationship("AccountsPayable", back_populates="fornecedor")
    
    def __repr__(self):
        return f"<Favorecido(CodFavorecido={self.CodFavorecido}, NomFavorecido='{self.NomFavorecido}')>"