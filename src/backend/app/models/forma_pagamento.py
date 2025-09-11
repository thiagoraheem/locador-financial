"""
Modelo de Formas de Pagamento
"""
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class FormaPagamento(Base):
    """Modelo para formas de pagamento"""
    
    __tablename__ = "tbl_FINFormaPagamento"

    CodFormaPagto = Column(Integer, primary_key=True, index=True)
    NomFormaPagto = Column(String(50), nullable=False)
    Descricao = Column(String(200))
    FlgAtivo = Column(String(1), default='S')  # S: Sim, N: Não
    
    # Colunas de auditoria (conforme estrutura real da tabela)
    DatCadastro = Column(DateTime, default=datetime.utcnow, nullable=False)
    NomUsuario = Column(String(15), nullable=False)
    DatAlteracao = Column(DateTime, onupdate=datetime.utcnow, nullable=True)
    NomUsuarioAlteracao = Column(String(15), nullable=True)
    
    # Relacionamentos
    lancamentos = relationship("Lancamento", back_populates="forma_pagamento")
    
    # Propriedades de compatibilidade para schemas
    @property
    def DtCreate(self):
        return self.DatCadastro
    
    @property
    def DtAlter(self):
        return self.DatAlteracao
    
    def __repr__(self):
        return f"<FormaPagamento(CodFormaPagto={self.CodFormaPagto}, NomFormaPagto='{self.NomFormaPagto}')>"