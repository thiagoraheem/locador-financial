"""
Modelo de Lançamentos Financeiros
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Numeric, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base


class Lancamento(Base):
    """Modelo para lançamentos financeiros"""
    
    __tablename__ = "tbl_FINLancamentos"
    
    # Campos principais
    CodLancamento = Column(Integer, primary_key=True, name='CodLancamento')
    CodEmpresa = Column(Integer, name='CodEmpresa', default=1)
    CodConta = Column(Integer, ForeignKey('tbl_Conta.idConta'), name='CodConta')
    CodFavorecido = Column(Integer, ForeignKey('tbl_FINFavorecido.CodFavorecido'), name='CodFavorecido', nullable=False)
    CodCategoria = Column(Integer, ForeignKey('tbl_FINCategorias.CodCategoria'), name='CodCategoria', nullable=False)
    NumDocto = Column(String(15), name='NumDocto')
    data_emissao = Column(DateTime, name='DataEmissao')
    Data = Column(Date, name='Data', nullable=False)
    IndMov = Column(Boolean, name='IndMov', nullable=False)  # True=Entrada, False=Saída
    Valor = Column(Numeric(19,4), name='Valor', nullable=False)
    valor_pago = Column(Numeric(19,4), name='ValorPago')
    flg_confirmacao = Column(Boolean, name='FlgConfirmacao', default=False)
    dat_confirmacao = Column(Date, name='DatConfirmacao')
    Comentario = Column(Text, name='Comentario')
    flg_frequencia = Column(Integer, name='FlgFrequencia')
    qtd_parcelas = Column(Integer, name='QtdParcelas')
    parcela_atual = Column(Integer, name='ParcelaAtual')
    cod_lancamento_anterior = Column(Integer, name='CodLancamentoAnterior')
    cod_fatura = Column(Integer, name='CodFatura')
    cod_medicao = Column(Integer, name='CodMedicao')
    flg_tipo_divisao = Column(String(1), name='FlgTipoDivisao')
    cod_forma_pagto = Column(Integer, name='CodFormaPagto')
    codigo_barras_boleto = Column(String(100), name='CodigoBarrasBoleto')
    flg_boleto_emitido = Column(Boolean, name='FlgBoletoEmitido', default=False)
    num_remessa = Column(Integer, name='NumRemessa')
    DatCadastro = Column(DateTime, nullable=False)
    NomUsuario = Column(String(20), nullable=False)
    DatAlteracao = Column(DateTime)
    NomUsuarioAlteracao = Column(String(20))
    
    # Relacionamentos
    favorecido = relationship("Favorecido", back_populates="lancamentos")
    categoria = relationship("Categoria", back_populates="lancamentos")
    conta = relationship("Conta", back_populates="lancamentos")
    
    def __repr__(self):
        return f"<Lancamento(CodLancamento={self.CodLancamento}, Valor={self.Valor}, IndMov={self.IndMov})>"