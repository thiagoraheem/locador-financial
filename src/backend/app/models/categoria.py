from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Categoria(Base):
    __tablename__ = "tbl_FINCategorias"
    
    CodCategoria = Column(Integer, primary_key=True, autoincrement=True)
    DesCategoria = Column(String(50), nullable=False)
    flgTipo = Column(String(1), nullable=False)  # R=Receita, D=Despesa
    FlgAtivo = Column(String(1), default='S', nullable=False)  # S=Ativo, N=Inativo
    CodGrupoCategoria = Column(Integer)
    CodPai = Column(Integer, ForeignKey("tbl_FINCategorias.CodCategoria"))
    idCostCenter = Column(Integer)
    idChartsOfAccount = Column(Integer)
    IdUserCreate = Column(Integer, nullable=False)
    IdUserAlter = Column(Integer)
    DateCreate = Column(DateTime, nullable=False, default=datetime.utcnow)
    DateUpdate = Column(DateTime)
    
    # Propriedades de compatibilidade para schemas
    @property
    def TipoCategoria(self):
        return self.flgTipo
    
    @property
    def NomUsuario(self):
        # Buscar o nome do usuário baseado no IdUserCreate
        # Por enquanto retornamos um valor padrão
        return "SISTEMA"
    
    @property
    def DtCreate(self):
        return self.DateCreate
    
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