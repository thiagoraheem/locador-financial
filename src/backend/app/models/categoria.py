from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class Categoria(Base):
    __tablename__ = "tbl_FINCategorias"
    
    CodCategoria = Column(Integer, primary_key=True, autoincrement=True)
    DesCategoria = Column(String(50))
    flgTipo = Column(String(1))  # R=Receita, D=Despesa
    FlgAtivo = Column(String(1), default='S')  # S=Ativo, N=Inativo
    CodGrupoCategoria = Column(Integer)
    CodPai = Column(Integer, ForeignKey("tbl_FINCategorias.CodCategoria"))
    idCostCenter = Column(Integer)
    idChartsOfAccount = Column(Integer)
    IdUserCreate = Column(Integer, nullable=False)
    IdUserAlter = Column(Integer)
    DateCreate = Column(DateTime, nullable=False)
    DateUpdate = Column(DateTime)
    
    # Relacionamentos
    lancamentos = relationship("Lancamento", back_populates="categoria")
    subcategorias = relationship(
        "Categoria",
        backref="categoria_pai",
        remote_side=[CodCategoria]
    )
    
    @property
    def is_active(self) -> bool:
        """Verifica se a categoria está ativa"""
        return self.FlgAtivo == 'S'
    
    def __repr__(self):
        return f"<Categoria(CodCategoria={self.CodCategoria}, DesCategoria='{self.DesCategoria}')>"