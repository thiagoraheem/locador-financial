from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text, Numeric, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Categoria(Base):
    __tablename__ = "tbl_FINCategorias"
    
    # Campos conforme estrutura real da tabela tbl_FINCategorias
    CodCategoria = Column(Integer, primary_key=True, name='CodCategoria')
    DesCategoria = Column(String(50), name='DesCategoria')
    flgTipo = Column(String(1), name='flgTipo')
    CodGrupoCategoria = Column(Integer, name='CodGrupoCategoria')
    CodPai = Column(Integer, ForeignKey('tbl_FINCategorias.CodCategoria'), name='CodPai', nullable=True)
    idCostCenter = Column(Integer, name='idCostCenter')
    idChartsOfAccount = Column(Integer, name='idChartsOfAccount')
    IdUserCreate = Column(Integer, name='IdUserCreate', nullable=False, default=1)
    IdUserAlter = Column(Integer, name='IdUserAlter')
    DateCreate = Column(DateTime, name='DateCreate', nullable=False, default=datetime.utcnow)
    DateUpdate = Column(DateTime, name='DateUpdate')
    FlgAtivo = Column(String(1), name='FlgAtivo', default='S')
    
    # Campos adicionais identificados na análise
    flgImprimirRelEquip = Column(Boolean, name='flgImprimirRelEquip', default=False)
    flgNecessitaSerial = Column(Boolean, name='flgNecessitaSerial', default=False)
    FlgAplicarDescontoAuto = Column(Boolean, name='FlgAplicarDescontoAuto', default=False)
    VlrPercDesconto = Column(Numeric(18,2), name='VlrPercDesconto')
    DatValidadeDesconto = Column(Date, name='DatValidadeDesconto')
    Observacao = Column(Text, name='Observacao')
    IdIncomeCenter = Column(Integer, name='IdIncomeCenter')
    
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
    
    @property
    def FlgAtivo_converted(self):
        """Converte FlgAtivo do banco (1/0) para o formato esperado (S/N)"""
        if self.FlgAtivo == '1':
            return 'S'
        elif self.FlgAtivo == '0':
            return 'N'
        else:
            # Se já está no formato correto, retorna como está
            return self.FlgAtivo
    
    # Relacionamentos
    lancamentos = relationship("Lancamento", back_populates="categoria")
    _subcategorias_rel = relationship(
        "Categoria",
        backref="categoria_pai",
        remote_side=[CodCategoria]
    )
    
    @property
    def subcategorias(self):
        """Retorna subcategorias como lista (sempre)"""
        if self._subcategorias_rel is None:
            return []
        elif isinstance(self._subcategorias_rel, list):
            return self._subcategorias_rel
        else:
            # Se for um objeto único, converte para lista
            return [self._subcategorias_rel]
    
    @property
    def is_active(self) -> bool:
        """Verifica se a categoria está ativa"""
        return self.FlgAtivo == 'S'
    
    def __repr__(self):
        return f"<Categoria(CodCategoria={self.CodCategoria}, DesCategoria='{self.DesCategoria}')>"