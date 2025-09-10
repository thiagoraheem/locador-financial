"""
Serviço de Lançamentos Financeiros
"""
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc
from fastapi import HTTPException, status

from app.models.lancamento import Lancamento
from app.models.funcionario import TblFuncionarios
from app.schemas.lancamento import (
    LancamentoCreate, 
    LancamentoUpdate, 
    LancamentoResponse,
    LancamentoFilter
)


class LancamentoService:
    """Serviço para operações com lançamentos financeiros"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_lancamento(self, lancamento_create: LancamentoCreate, current_user: TblFuncionarios) -> Lancamento:
        """Criar novo lançamento com validações e auditoria"""
        
        # Validações de negócio
        self._validate_lancamento_data(lancamento_create)
        
        # Preparar dados
        lancamento_data = lancamento_create.dict()
        lancamento_data['NomUsuario'] = current_user.Login
        
        # Criar lançamento
        lancamento = Lancamento(**lancamento_data)
        
        try:
            self.db.add(lancamento)
            self.db.commit()
            self.db.refresh(lancamento)
            return lancamento
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao criar lançamento: {str(e)}"
            )
    
    def get_lancamento_by_id(self, lancamento_id: int) -> Lancamento:
        """Buscar lançamento por ID"""
        lancamento = self.db.query(Lancamento).filter(
            Lancamento.CodLancamento == lancamento_id
        ).first()
        
        if not lancamento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lançamento com ID {lancamento_id} não encontrado"
            )
        
        return lancamento
    
    def list_lancamentos(
        self,
        skip: int = 0,
        limit: int = 100,
        filtros: Optional[LancamentoFilter] = None
    ) -> List[Lancamento]:
        """Listar lançamentos com filtros e paginação"""
        
        query = self.db.query(Lancamento)
        
        # Aplicar filtros se fornecidos
        if filtros:
            if filtros.data_inicio:
                query = query.filter(Lancamento.Data >= filtros.data_inicio)
            
            if filtros.data_fim:
                query = query.filter(Lancamento.Data <= filtros.data_fim)
            
            if filtros.cod_categoria:
                query = query.filter(Lancamento.CodCategoria == filtros.cod_categoria)
            
            if filtros.cod_favorecido:
                query = query.filter(Lancamento.CodFavorecido == filtros.cod_favorecido)
            
            if filtros.ind_mov:
                query = query.filter(Lancamento.IndMov == filtros.ind_mov)
            
            if filtros.confirmado is not None:
                query = query.filter(Lancamento.FlgConfirmacao == filtros.confirmado)
            
            if filtros.cod_empresa:
                query = query.filter(Lancamento.CodEmpresa == filtros.cod_empresa)
            
            if filtros.id_conta:
                query = query.filter(Lancamento.idConta == filtros.id_conta)
            
            if filtros.valor_min:
                query = query.filter(Lancamento.Valor >= filtros.valor_min)
            
            if filtros.valor_max:
                query = query.filter(Lancamento.Valor <= filtros.valor_max)
            
            if filtros.num_docto:
                query = query.filter(Lancamento.NumDocto.ilike(f"%{filtros.num_docto}%"))
            
            # Ordenação
            if filtros and filtros.order_by:
                if filtros.order_by == "data_desc":
                    query = query.order_by(desc(Lancamento.Data))
                elif filtros.order_by == "data_asc":
                    query = query.order_by(asc(Lancamento.Data))
                elif filtros.order_by == "valor_desc":
                    query = query.order_by(desc(Lancamento.Valor))
                elif filtros.order_by == "valor_asc":
                    query = query.order_by(asc(Lancamento.Valor))
            else:
                # Ordenação padrão: mais recentes primeiro
                query = query.order_by(desc(Lancamento.Data))
            
            # Aplicar paginação
            return query.offset(skip).limit(limit).all()
        
    def update_lancamento(
        self, 
        lancamento_id: int, 
        lancamento_update: LancamentoUpdate, 
        current_user: TblFuncionarios
    ) -> Lancamento:
        """Atualizar lançamento existente"""
        
        # Buscar lançamento
        lancamento = self.get_lancamento_by_id(lancamento_id)
        
        # Validar se pode ser alterado
        if lancamento.FlgConfirmacao:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível alterar lançamento já confirmado"
            )
        
        # Preparar dados para atualização
        update_data = lancamento_update.dict(exclude_unset=True)
        
        # Validar dados se fornecidos
        if update_data:
            self._validate_lancamento_update(update_data, lancamento)
        
        try:
            # Aplicar alterações
            for key, value in update_data.items():
                setattr(lancamento, key, value)
            
            # Atualizar auditoria
            lancamento.NomUsuario = current_user.Login
            
            self.db.commit()
            self.db.refresh(lancamento)
            return lancamento
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao atualizar lançamento: {str(e)}"
            )
        
    def delete_lancamento(self, lancamento_id: int, current_user: TblFuncionarios) -> None:
        """Excluir lançamento"""
        
        # Buscar lançamento
        lancamento = self.get_lancamento_by_id(lancamento_id)
        
        # Validar se pode ser excluído
        if lancamento.FlgConfirmacao:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível excluir lançamento já confirmado"
            )
        
        try:
            self.db.delete(lancamento)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao excluir lançamento: {str(e)}"
            )
        
    def confirm_lancamento(self, lancamento_id: int, current_user: TblFuncionarios) -> Lancamento:
        """Confirmar lançamento"""
        
        # Buscar lançamento
        lancamento = self.get_lancamento_by_id(lancamento_id)
        
        # Validar se já está confirmado
        if lancamento.FlgConfirmacao:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lançamento já está confirmado"
            )
        
        try:
            # Confirmar
            lancamento.FlgConfirmacao = True
            lancamento.NomUsuario = current_user.Login
            
            # TODO: Aqui seria o local para atualizar saldos, gerar movimentações, etc.
            
            self.db.commit()
            self.db.refresh(lancamento)
            return lancamento
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao confirmar lançamento: {str(e)}"
            )
        
    def unconfirm_lancamento(self, lancamento_id: int, current_user: TblFuncionarios) -> Lancamento:
        """Desconfirmar lançamento"""
        
        # Buscar lançamento
        lancamento = self.get_lancamento_by_id(lancamento_id)
        
        # Validar se está confirmado
        if not lancamento.FlgConfirmacao:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lançamento não está confirmado"
            )
        
        try:
            # Desconfirmar
            lancamento.FlgConfirmacao = False
            lancamento.NomUsuario = current_user.Login
            
            # TODO: Aqui seria o local para reverter saldos, estornar movimentações, etc.
            
            self.db.commit()
            self.db.refresh(lancamento)
            return lancamento
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao desconfirmar lançamento: {str(e)}"
            )
        
    def get_total_by_period(
        self, 
        data_inicio: datetime, 
        data_fim: datetime, 
        ind_mov: Optional[str] = None
    ) -> Decimal:
        """Calcular total de lançamentos por período"""
        
        query = self.db.query(Lancamento).filter(
            and_(
                Lancamento.Data >= data_inicio,
                Lancamento.Data <= data_fim,
                Lancamento.FlgConfirmacao == True
            )
        )
        
        if ind_mov:
            query = query.filter(Lancamento.IndMov == ind_mov)
        
        lancamentos = query.all()
        total = sum(lancamento.Valor for lancamento in lancamentos)
        
        return Decimal(str(total))
    
    def get_saldo_by_period(self, data_inicio: datetime, data_fim: datetime) -> Decimal:
        """Calcular saldo (receitas - despesas) por período"""
        
        receitas = self.get_total_by_period(data_inicio, data_fim, 'E')
        despesas = self.get_total_by_period(data_inicio, data_fim, 'S')
        
        return receitas - despesas
    
    def _validate_lancamento_data(self, lancamento_data) -> None:
        """Validações de negócio para lançamento"""
        
        # Validar valor
        if lancamento_data.Valor <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valor deve ser maior que zero"
            )
        
        # Validar data
        if lancamento_data.Data > datetime.now():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Data do lançamento não pode ser futura"
            )
        
        # Validar indicador de movimento
        if not isinstance(lancamento_data.IndMov, bool):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Indicador de movimento deve ser True (Entrada) ou False (Saída)"
            )
        
        # Validar frequência
        if lancamento_data.FlgFrequencia not in ['U', 'R']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Frequência deve ser 'U' (Único) ou 'R' (Recorrente)"
            )
        
        # TODO: Validar se categoria existe
        # TODO: Validar se favorecido existe
        # TODO: Validar se forma de pagamento existe
    
    def _validate_lancamento_update(self, update_data: dict, lancamento: Lancamento) -> None:
        """Validações específicas para atualização"""
        
        # Se está atualizando valor, validar
        if 'Valor' in update_data and update_data['Valor'] <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valor deve ser maior que zero"
            )
        
        # Se está atualizando data, validar
        if 'Data' in update_data and update_data['Data'] > datetime.now():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Data do lançamento não pode ser futura"
            )
        
        # Validar indicador de movimento
        if 'IndMov' in update_data and not isinstance(update_data['IndMov'], bool):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Indicador de movimento deve ser True (Entrada) ou False (Saída)"
            )