"""
Modelo de Formas de Pagamento
"""
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.mixins import LoginAuditMixin


class FormaPagamento(Base, LoginAuditMixin):
    """Modelo para formas de pagamento"""
    
    __tablename__ = "tbl_FINFormaPagamento"

    CodFormaPagto = Column(Integer, primary_key=True, index=True)
    NomFormaPagto = Column(String(50), nullable=False)
    Descricao = Column(String(200))
    FlgAtivo = Column(String(1), default='S')  # S: Sim, N: Não
    
    # Relacionamento com lançamentos removido - sem foreign key definida
    
    def __repr__(self):
        return f"<FormaPagamento(CodFormaPagto={self.CodFormaPagto}, NomFormaPagto='{self.NomFormaPagto}')>"