"""
Modelo de Favorecidos
"""
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Favorecido(Base):
    """Modelo para favorecidos/beneficiários dos lançamentos"""
    
    __tablename__ = "tbl_FINFavorecido"

    # Campos conforme estrutura real da tabela tbl_FINFavorecido
    CodFavorecido = Column(Integer, primary_key=True, name='CodFavorecido')
    DesFavorecido = Column(String(100), name='DesFavorecido', nullable=False)
    Endereco = Column(String(150), name='Endereco')
    Numero = Column(String(10), name='Numero')
    Bairro = Column(String(50), name='Bairro')
    CEP = Column(String(9), name='CEP')
    Municipio = Column(String(20), name='Municipio')
    Estado = Column(String(2), name='Estado')
    RG = Column(String(20), name='RG')
    CPF = Column(String(14), name='CPF')
    CNPJ = Column(String(18), name='CNPJ')
    IE = Column(String(15), name='IE')
    IM = Column(String(10), name='IM')
    FlgTipo = Column(String(1), name='FlgTipo')
    FlgAtivo = Column(String(1), name='FlgAtivo', default='S')
    Email = Column(String(50), name='Email')
    Telefone = Column(String(16), name='Telefone')
    Comentario = Column(String(300), name='Comentario')
    DatCadastro = Column(DateTime, name='DatCadastro')
    NomUsuario = Column(String(15), name='NomUsuario')
    CodClienteLocador = Column(Integer, name='CodClienteLocador')
    
    # Relacionamentos
    lancamentos = relationship("Lancamento", back_populates="favorecido")
    contas_pagar = relationship("AccountsPayable", back_populates="favorecido")
    contas_receber = relationship("AccountsReceivable", back_populates="favorecido")
    
    def __repr__(self):
        return f"<Favorecido(CodFavorecido={self.CodFavorecido}, DesFavorecido='{self.DesFavorecido}')>"