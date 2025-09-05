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
                query = query.filter(Lancamento.NumDocto.ilike(f\"%{filtros.num_docto}%\"))\n        \n        # Ordenação\n        if filtros and filtros.order_by:\n            if filtros.order_by == \"data_desc\":\n                query = query.order_by(desc(Lancamento.Data))\n            elif filtros.order_by == \"data_asc\":\n                query = query.order_by(asc(Lancamento.Data))\n            elif filtros.order_by == \"valor_desc\":\n                query = query.order_by(desc(Lancamento.Valor))\n            elif filtros.order_by == \"valor_asc\":\n                query = query.order_by(asc(Lancamento.Valor))\n        else:\n            # Ordenação padrão: mais recentes primeiro\n            query = query.order_by(desc(Lancamento.Data))\n        \n        # Aplicar paginação\n        return query.offset(skip).limit(limit).all()\n    \n    def update_lancamento(\n        self, \n        lancamento_id: int, \n        lancamento_update: LancamentoUpdate, \n        current_user: TblFuncionarios\n    ) -> Lancamento:\n        \"\"\"Atualizar lançamento existente\"\"\"\n        \n        # Buscar lançamento\n        lancamento = self.get_lancamento_by_id(lancamento_id)\n        \n        # Validar se pode ser alterado\n        if lancamento.FlgConfirmacao:\n            raise HTTPException(\n                status_code=status.HTTP_400_BAD_REQUEST,\n                detail=\"Não é possível alterar lançamento já confirmado\"\n            )\n        \n        # Preparar dados para atualização\n        update_data = lancamento_update.dict(exclude_unset=True)\n        \n        # Validar dados se fornecidos\n        if update_data:\n            self._validate_lancamento_update(update_data, lancamento)\n        \n        try:\n            # Aplicar alterações\n            for key, value in update_data.items():\n                setattr(lancamento, key, value)\n            \n            # Atualizar auditoria\n            lancamento.NomUsuario = current_user.Login\n            \n            self.db.commit()\n            self.db.refresh(lancamento)\n            return lancamento\n            \n        except Exception as e:\n            self.db.rollback()\n            raise HTTPException(\n                status_code=status.HTTP_400_BAD_REQUEST,\n                detail=f\"Erro ao atualizar lançamento: {str(e)}\"\n            )\n    \n    def delete_lancamento(self, lancamento_id: int, current_user: TblFuncionarios) -> None:\n        \"\"\"Excluir lançamento\"\"\"\n        \n        # Buscar lançamento\n        lancamento = self.get_lancamento_by_id(lancamento_id)\n        \n        # Validar se pode ser excluído\n        if lancamento.FlgConfirmacao:\n            raise HTTPException(\n                status_code=status.HTTP_400_BAD_REQUEST,\n                detail=\"Não é possível excluir lançamento já confirmado\"\n            )\n        \n        try:\n            self.db.delete(lancamento)\n            self.db.commit()\n        except Exception as e:\n            self.db.rollback()\n            raise HTTPException(\n                status_code=status.HTTP_400_BAD_REQUEST,\n                detail=f\"Erro ao excluir lançamento: {str(e)}\"\n            )\n    \n    def confirm_lancamento(self, lancamento_id: int, current_user: TblFuncionarios) -> Lancamento:\n        \"\"\"Confirmar lançamento\"\"\"\n        \n        # Buscar lançamento\n        lancamento = self.get_lancamento_by_id(lancamento_id)\n        \n        # Validar se já está confirmado\n        if lancamento.FlgConfirmacao:\n            raise HTTPException(\n                status_code=status.HTTP_400_BAD_REQUEST,\n                detail=\"Lançamento já está confirmado\"\n            )\n        \n        try:\n            # Confirmar\n            lancamento.FlgConfirmacao = True\n            lancamento.NomUsuario = current_user.Login\n            \n            # TODO: Aqui seria o local para atualizar saldos, gerar movimentações, etc.\n            \n            self.db.commit()\n            self.db.refresh(lancamento)\n            return lancamento\n            \n        except Exception as e:\n            self.db.rollback()\n            raise HTTPException(\n                status_code=status.HTTP_400_BAD_REQUEST,\n                detail=f\"Erro ao confirmar lançamento: {str(e)}\"\n            )\n    \n    def unconfirm_lancamento(self, lancamento_id: int, current_user: TblFuncionarios) -> Lancamento:\n        \"\"\"Desconfirmar lançamento\"\"\"\n        \n        # Buscar lançamento\n        lancamento = self.get_lancamento_by_id(lancamento_id)\n        \n        # Validar se está confirmado\n        if not lancamento.FlgConfirmacao:\n            raise HTTPException(\n                status_code=status.HTTP_400_BAD_REQUEST,\n                detail=\"Lançamento não está confirmado\"\n            )\n        \n        try:\n            # Desconfirmar\n            lancamento.FlgConfirmacao = False\n            lancamento.NomUsuario = current_user.Login\n            \n            # TODO: Aqui seria o local para reverter saldos, estornar movimentações, etc.\n            \n            self.db.commit()\n            self.db.refresh(lancamento)\n            return lancamento\n            \n        except Exception as e:\n            self.db.rollback()\n            raise HTTPException(\n                status_code=status.HTTP_400_BAD_REQUEST,\n                detail=f\"Erro ao desconfirmar lançamento: {str(e)}\"\n            )\n    \n    def get_total_by_period(\n        self, \n        data_inicio: datetime, \n        data_fim: datetime, \n        ind_mov: Optional[str] = None\n    ) -> Decimal:\n        \"\"\"Calcular total de lançamentos por período\"\"\"\n        \n        query = self.db.query(Lancamento).filter(\n            and_(\n                Lancamento.Data >= data_inicio,\n                Lancamento.Data <= data_fim,\n                Lancamento.FlgConfirmacao == True\n            )\n        )\n        \n        if ind_mov:\n            query = query.filter(Lancamento.IndMov == ind_mov)\n        \n        lancamentos = query.all()\n        total = sum(lancamento.Valor for lancamento in lancamentos)\n        \n        return Decimal(str(total))\n    \n    def get_saldo_by_period(self, data_inicio: datetime, data_fim: datetime) -> Decimal:\n        \"\"\"Calcular saldo (receitas - despesas) por período\"\"\"\n        \n        receitas = self.get_total_by_period(data_inicio, data_fim, 'E')\n        despesas = self.get_total_by_period(data_inicio, data_fim, 'S')\n        \n        return receitas - despesas\n    \n    def _validate_lancamento_data(self, lancamento_data) -> None:\n        \"\"\"Validações de negócio para lançamento\"\"\"\n        \n        # Validar valor\n        if lancamento_data.Valor <= 0:\n            raise HTTPException(\n                status_code=status.HTTP_400_BAD_REQUEST,\n                detail=\"Valor deve ser maior que zero\"\n            )\n        \n        # Validar data\n        if lancamento_data.Data > datetime.now():\n            raise HTTPException(\n                status_code=status.HTTP_400_BAD_REQUEST,\n                detail=\"Data do lançamento não pode ser futura\"\n            )\n        \n        # Validar indicador de movimento\n        if lancamento_data.IndMov not in ['E', 'S']:\n            raise HTTPException(\n                status_code=status.HTTP_400_BAD_REQUEST,\n                detail=\"Indicador de movimento deve ser 'E' (Entrada) ou 'S' (Saída)\"\n            )\n        \n        # Validar frequência\n        if lancamento_data.FlgFrequencia not in ['U', 'R']:\n            raise HTTPException(\n                status_code=status.HTTP_400_BAD_REQUEST,\n                detail=\"Frequência deve ser 'U' (Único) ou 'R' (Recorrente)\"\n            )\n        \n        # TODO: Validar se categoria existe\n        # TODO: Validar se favorecido existe\n        # TODO: Validar se forma de pagamento existe\n    \n    def _validate_lancamento_update(self, update_data: dict, lancamento: Lancamento) -> None:\n        \"\"\"Validações específicas para atualização\"\"\"\n        \n        # Se está atualizando valor, validar\n        if 'Valor' in update_data and update_data['Valor'] <= 0:\n            raise HTTPException(\n                status_code=status.HTTP_400_BAD_REQUEST,\n                detail=\"Valor deve ser maior que zero\"\n            )\n        \n        # Se está atualizando data, validar\n        if 'Data' in update_data and update_data['Data'] > datetime.now():\n            raise HTTPException(\n                status_code=status.HTTP_400_BAD_REQUEST,\n                detail=\"Data do lançamento não pode ser futura\"\n            )\n        \n        # Validar indicador de movimento\n        if 'IndMov' in update_data and update_data['IndMov'] not in ['E', 'S']:\n            raise HTTPException(\n                status_code=status.HTTP_400_BAD_REQUEST,\n                detail=\"Indicador de movimento deve ser 'E' (Entrada) ou 'S' (Saída)\"\n            )