"""
Modelo de Lançamentos Financeiros
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Numeric, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from typing import Literal


class Lancamento(Base):
    """Modelo para lançamentos financeiros"""
    
    __tablename__ = "tbl_FINLancamentos"
    
    CodLancamento = Column(Integer, primary_key=True, autoincrement=True)
    CodEmpresa = Column(Integer, nullable=False)
    CodFavorecido = Column(Integer, ForeignKey("tbl_FINFavorecido.CodFavorecido"), nullable=False)
    CodCategoria = Column(Integer, ForeignKey("tbl_FINCategorias.CodCategoria"), nullable=False)
    NumDocto = Column(String(15))
    DataEmissao = Column(DateTime)
    Data = Column(Date, nullable=False)
    IndMov = Column(Boolean, nullable=False)  # True = Entrada, False = Saída
    Valor = Column(Numeric(19, 4), nullable=False)  # money type
    ValorPago = Column(Numeric(19, 4))
    FlgConfirmacao = Column(Boolean)  # Campo bit: True = confirmado
    DatConfirmacao = Column(Date)
    Comentario = Column(Text)
    FlgFrequencia = Column(Integer)
    QtdParcelas = Column(Integer)
    ParcelaAtual = Column(Integer)
    CodLancamentoAnterior = Column(Integer)
    CodFatura = Column(Integer)
    CodMedicao = Column(Integer)
    FlgTipoDivisao = Column(String(1))
    CodFormaPagto = Column(Integer)
    CodigoBarrasBoleto = Column(String(100))
    FlgBoletoEmitido = Column(Boolean)
    NumRemessa = Column(Integer)
    DatCadastro = Column(DateTime, nullable=False)
    NomUsuario = Column(String(20), nullable=False)
    DatAlteracao = Column(DateTime)
    NomUsuarioAlteracao = Column(String(20))
    
    # Relacionamentos
    favorecido = relationship("Favorecido", back_populates="lancamentos")
    categoria = relationship("Categoria", back_populates="lancamentos")
    
    def __repr__(self):
        return f"<Lancamento(CodLancamento={self.CodLancamento}, Valor={self.Valor}, IndMov={self.IndMov})>"