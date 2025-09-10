"""
Modelo de Favorecidos
"""
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class Favorecido(Base):
    """Modelo para favorecidos/beneficiários dos lançamentos"""
    
    __tablename__ = "tbl_FINFavorecido"

    CodFavorecido = Column(Integer, primary_key=True, autoincrement=True)
    DesFavorecido = Column(String(100), nullable=False)
    Endereco = Column(String(150))
    Numero = Column(String(10))
    Bairro = Column(String(50))
    CEP = Column(String(9))
    Municipio = Column(String(20))
    Estado = Column(String(2))
    RG = Column(String(20))
    CPF = Column(String(14))
    CNPJ = Column(String(18))
    IE = Column(String(15))
    IM = Column(String(10))
    FlgTipo = Column(String(1))
    Email = Column(String(50))
    Telefone = Column(String(16))
    Comentario = Column(String(300))
    DatCadastro = Column(DateTime)
    NomUsuario = Column(String(15))
    CodClienteLocador = Column(Integer)
    
    # Relacionamento com lançamentos
    lancamentos = relationship("Lancamento", back_populates="favorecido")
    
    def __repr__(self):
        return f"<Favorecido(CodFavorecido={self.CodFavorecido}, DesFavorecido='{self.DesFavorecido}')>"