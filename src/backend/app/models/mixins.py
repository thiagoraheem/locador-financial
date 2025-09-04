"""
Mixins for audit trail functionality
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime


class UserAuditMixin:
    """Mixin para tabelas que utilizam ID de usuário para auditoria"""
    
    IdUserCreate = Column(Integer, ForeignKey('tbl_Funcionarios.CodFuncionario'), nullable=False)
    IdUserAlter = Column(Integer, ForeignKey('tbl_Funcionarios.CodFuncionario'), nullable=True)
    DtCreate = Column(DateTime, default=datetime.utcnow, nullable=False)
    DtAlter = Column(DateTime, onupdate=datetime.utcnow, nullable=True)
    
    # Relacionamentos para auditoria (definidos nas classes filhas)
    # user_create = relationship("TblFuncionarios", foreign_keys=[IdUserCreate])
    # user_alter = relationship("TblFuncionarios", foreign_keys=[IdUserAlter])


class LoginAuditMixin:
    """Mixin para tabelas que utilizam login de usuário para auditoria"""
    
    NomUsuario = Column(String(50), nullable=False)  # Login do usuário
    DtCreate = Column(DateTime, default=datetime.utcnow, nullable=False)
    DtAlter = Column(DateTime, onupdate=datetime.utcnow, nullable=True)