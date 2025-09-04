"""
Modelo do funcionário para autenticação
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, DECIMAL, LargeBinary
from datetime import datetime
from app.core.database import Base


class TblFuncionarios(Base):
    """Modelo da tabela tbl_Funcionarios para autenticação"""
    
    __tablename__ = 'tbl_Funcionarios'
    
    CodFuncionario = Column(Integer, primary_key=True, index=True)
    NumCTPS = Column(String(50))
    CPF = Column(String(14))
    Nome = Column(String(100))
    Telefone = Column(String(20))
    Endereco = Column(String(200))
    Salario = Column(DECIMAL(10, 2))
    DatAdmissao = Column(DateTime)
    DatDemissao = Column(DateTime, nullable=True)  # NULL = usuário ativo
    FlgComissao = Column(Boolean)
    ValComissao = Column(DECIMAL(5, 2))
    VlrDesconto = Column(DECIMAL(10, 2))
    Email = Column(String(100))
    Login = Column(String(50), unique=True, index=True)
    Senha = Column(String(255))  # Hash SHA-256
    AssinaturaDigitalizada = Column(LargeBinary)
    CodSetor = Column(Integer)
    CodFavorecido = Column(Integer)
    CodFuncao = Column(Integer)
    Settings = Column(String(500))
    Foto = Column(LargeBinary)
    DatCadastro = Column(DateTime, default=datetime.utcnow)
    NomUsuario = Column(String(50), nullable=False)
    DatAlteracao = Column(DateTime)
    NomUsuarioAlteracao = Column(String(50))
    
    def is_active(self) -> bool:
        """Verifica se o funcionário está ativo (não demitido)"""
        return self.DatDemissao is None
    
    def __repr__(self):
        return f"<TblFuncionarios(CodFuncionario={self.CodFuncionario}, Login='{self.Login}', Nome='{self.Nome}')>"