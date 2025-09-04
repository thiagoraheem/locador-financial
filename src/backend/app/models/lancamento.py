"""
Modelo de Lançamentos Financeiros
"""
from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from app.models.mixins import LoginAuditMixin


class Lancamento(Base, LoginAuditMixin):
    """Modelo para lançamentos financeiros"""
    
    __tablename__ = "tbl_FINLancamentos"

    CodLancamento = Column(Integer, primary_key=True, index=True)
    Data = Column(DateTime, nullable=False, default=datetime.now)
    DataEmissao = Column(DateTime, nullable=False, default=datetime.now)
    CodFavorecido = Column(Integer, ForeignKey("tbl_FINFavorecido.CodFavorecido"))
    CodCategoria = Column(Integer, ForeignKey("tbl_FINCategorias.CodCategoria"))
    Valor = Column(Numeric(18, 2), nullable=False)
    IndMov = Column(String(1), nullable=False)  # E: Entrada, S: Saída
    NumDocto = Column(String(50))
    CodFormaPagto = Column(Integer, ForeignKey("tbl_FINFormaPagamento.CodFormaPagto"))
    FlgConfirmacao = Column(Boolean, default=False)
    FlgFrequencia = Column(String(1), nullable=False)  # U: Único, R: Recorrente
    Observacao = Column(String(500))
    
    # Relacionamentos
    favorecido = relationship("Favorecido", back_populates="lancamentos")
    categoria = relationship("Categoria", back_populates="lancamentos")
    forma_pagamento = relationship("FormaPagamento", back_populates="lancamentos")
    
    def __repr__(self):
        return f"<Lancamento(CodLancamento={self.CodLancamento}, Valor={self.Valor}, IndMov='{self.IndMov}')>"