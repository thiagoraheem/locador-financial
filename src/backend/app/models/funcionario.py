"""
Modelo do funcionário para autenticação
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Numeric, Date
from datetime import datetime
from .base import Base


class TblFuncionarios(Base):
    """Modelo da tabela tbl_Funcionarios para autenticação"""
    
    __tablename__ = 'tbl_Funcionarios'
    
    # Campos conforme estrutura real do banco de dados
    CodFuncionario = Column(Integer, primary_key=True, name='CodFuncionario')
    NumCTPS = Column(String(15), name='NumCTPS')
    CPF = Column(String(14), name='CPF')
    Nome = Column(String(50), name='Nome')
    Telefone = Column(String(16), name='Telefone')
    Endereco = Column(String(100), name='Endereco')
    Salario = Column(Numeric(19,4), name='Salario')
    DatAdmissao = Column(DateTime, name='DatAdmissao')
    DatDemissao = Column(DateTime, name='DatDemissao')
    FlgComissao = Column(Boolean, name='FlgComissao', default=False)
    ValComissao = Column(Numeric(8,2), name='ValComissao')
    VlrDesconto = Column(Numeric(8,2), name='VlrDesconto', default=100)
    Email = Column(String(100), name='Email')
    Login = Column(String(15), name='Login')
    Senha = Column(String(30), name='Senha')
    AssinaturaDigitalizada = Column(Text, name='AssinaturaDigitalizada')  # image type
    CodSetor = Column(Integer, name='CodSetor')
    CodFavorecido = Column(Integer, name='CodFavorecido')
    CodFuncao = Column(Integer, name='CodFuncao')
    Settings = Column(Text, name='Settings')  # varchar(max)
    Foto = Column(Text, name='Foto')  # image type
    DatCadastro = Column(DateTime, name='DatCadastro', nullable=False)
    NomUsuario = Column(String(15), name='NomUsuario', nullable=False)
    DatAlteracao = Column(DateTime, name='DatAlteracao')
    NomUsuarioAlteracao = Column(String(15), name='NomUsuarioAlteracao')
    
    def is_active(self) -> bool:
        """Verifica se o funcionário está ativo (não demitido)"""
        return self.DatDemissao is None
    
    def __repr__(self):
        return f"<TblFuncionarios(CodFuncionario={self.CodFuncionario}, Login='{self.Login}', Nome='{self.Nome}')>"