"""
Service layer for Dashboard and Financial Indicators
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, extract
from fastapi import HTTPException, status

from app.models.lancamento import Lancamento
from app.models.accounts_payable import AccountsPayable
from app.models.accounts_receivable import AccountsReceivable
from app.models.funcionario import TblFuncionarios


class DashboardService:
    """Service for Dashboard operations and financial indicators"""

    def __init__(self, db: Session):
        self.db = db

    def get_financial_summary(self, empresa_id: Optional[int] = None) -> Dict:
        """Get financial summary with main indicators"""
        
        # Get total revenues (confirmed entries)
        total_receitas = self._get_total_lancamentos(True, empresa_id)
        
        # Get total expenses (confirmed exits)
        total_despesas = self._get_total_lancamentos(False, empresa_id)
        
        # Calculate current balance
        saldo = total_receitas - total_despesas
        
        # Get accounts payable count
        contas_pagar_count = self._get_accounts_count('payable', empresa_id)
        
        # Get accounts receivable count
        contas_receber_count = self._get_accounts_count('receivable', empresa_id)
        
        return {
            "total_receitas": float(total_receitas),
            "total_despesas": float(total_despesas),
            "saldo": float(saldo),
            "contas_a_pagar": contas_pagar_count,
            "contas_a_receber": contas_receber_count
        }

    def get_cash_flow(self, months: int = 12, empresa_id: Optional[int] = None) -> Dict:
        """Get cash flow data for the specified number of months"""
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30 * months)
        
        # Get monthly entries
        entradas = self._get_monthly_totals(True, start_date, end_date, empresa_id)
        
        # Get monthly exits
        saidas = self._get_monthly_totals(False, start_date, end_date, empresa_id)
        
        # Calculate balance
        saldo_mensal = []
        for entrada in entradas:
            mes_ano = entrada['mes_ano']
            valor_entrada = entrada['valor']
            
            # Find corresponding exit
            valor_saida = 0
            for saida in saidas:
                if saida['mes_ano'] == mes_ano:
                    valor_saida = saida['valor']
                    break
            
            saldo_mensal.append({
                "mes_ano": mes_ano,
                "saldo": float(valor_entrada - valor_saida)
            })
        
        return {
            "periodo": f"Últimos {months} meses",
            "entradas": entradas,
            "saidas": saidas,
            "saldo_mensal": saldo_mensal
        }

    def get_category_summary(self, tipo: bool = True, empresa_id: Optional[int] = None) -> List[Dict]:
        """Get summary by category for revenues or expenses"""
        
        from app.models.categoria import Categoria
        
        # Query to get category totals
        query = self.db.query(
            Categoria.DesCategoria,
            func.sum(Lancamento.Valor).label('total')
        ).join(
            Lancamento, Lancamento.CodCategoria == Categoria.CodCategoria
        ).filter(
            and_(
                Lancamento.IndMov == tipo,
                Lancamento.FlgConfirmacao == True  # Campo bit: True = confirmado
            )
        )
        
        # Filter by empresa if provided
        if empresa_id:
            query = query.filter(Lancamento.CodEmpresa == empresa_id)
        
        # Group by category and order by total
        results = query.group_by(
            Categoria.DesCategoria
        ).order_by(
            func.sum(Lancamento.Valor).desc()
        ).all()
        
        # Format results
        category_data = []
        for result in results:
            category_data.append({
                "categoria": result.DesCategoria,
                "valor": float(result.total or 0)
            })
        
        return category_data

    def get_overdue_summary(self, empresa_id: Optional[int] = None) -> Dict:
        """Get summary of overdue accounts"""
        
        # Get overdue accounts payable
        contas_pagar_vencidas = self._get_overdue_count('payable', empresa_id)
        
        # Get overdue accounts receivable
        contas_receber_vencidas = self._get_overdue_count('receivable', empresa_id)
        
        # Get delinquent accounts receivable
        contas_receber_inadimplentes = self._get_delinquent_count(empresa_id)
        
        return {
            "contas_pagar_vencidas": contas_pagar_vencidas,
            "contas_receber_vencidas": contas_receber_vencidas,
            "contas_receber_inadimplentes": contas_receber_inadimplentes
        }

    def get_top_favorecidos(self, tipo: bool = False, limit: int = 10, empresa_id: Optional[int] = None) -> List[Dict]:
        """Get top payees or clients by total value"""
        
        from app.models.favorecido import Favorecido
        
        # Query to get top favorecidos
        query = self.db.query(
            Favorecido.DesFavorecido,
            func.sum(Lancamento.Valor).label('total')
        ).join(
            Lancamento, Lancamento.CodFavorecido == Favorecido.CodFavorecido
        ).filter(
            and_(
                Lancamento.IndMov == tipo,
                Lancamento.FlgConfirmacao == True  # Campo bit: True = confirmado
            )
        )
        
        # Filter by empresa if provided
        if empresa_id:
            query = query.filter(Lancamento.CodEmpresa == empresa_id)
        
        # Group by favorecido and order by total
        results = query.group_by(
            Favorecido.DesFavorecido
        ).order_by(
            func.sum(Lancamento.Valor).desc()
        ).limit(limit).all()
        
        # Format results
        favorecidos_data = []
        for result in results:
            favorecidos_data.append({
                "nome": result.DesFavorecido,
                "valor": float(result.total or 0)
            })
        
        return favorecidos_data

    def _get_total_lancamentos(self, ind_mov: bool, empresa_id: Optional[int] = None) -> Decimal:
        """Get total value of confirmed lancamentos"""
        
        query = self.db.query(
            func.sum(Lancamento.Valor)
        ).filter(
            and_(
                Lancamento.IndMov == ind_mov,
                Lancamento.FlgConfirmacao == True  # Campo bit: True = confirmado
            )
        )
        
        # Filter by empresa if provided
        if empresa_id:
            query = query.filter(Lancamento.CodEmpresa == empresa_id)
        
        result = query.scalar()
        return result or Decimal('0')

    def _get_accounts_count(self, account_type: str, empresa_id: Optional[int] = None) -> int:
        """Get count of active accounts (payable or receivable)"""
        
        if account_type == 'payable':
            # Contas em aberto são aquelas que não foram pagas (PaymentDate é NULL)
            query = self.db.query(AccountsPayable).filter(
                AccountsPayable.PaymentDate.is_(None)
            )
            
            # Filter by empresa if provided
            if empresa_id:
                query = query.filter(AccountsPayable.IdCompany == empresa_id)
                
            return query.count()
        else:  # receivable
            # Contas em aberto são aquelas que não foram recebidas (PaymentDate é NULL)
            query = self.db.query(AccountsReceivable).filter(
                AccountsReceivable.PaymentDate.is_(None)
            )
            
            # Filter by empresa if provided
            if empresa_id:
                query = query.filter(AccountsReceivable.IdCompany == empresa_id)
                
            return query.count()

    def _get_monthly_totals(self, ind_mov: bool, start_date: datetime, end_date: datetime, empresa_id: Optional[int] = None) -> List[Dict]:
        """Get monthly totals for lancamentos"""
        
        # Query to get monthly totals
        query = self.db.query(
            extract('year', Lancamento.Data).label('ano'),
            extract('month', Lancamento.Data).label('mes'),
            func.sum(Lancamento.Valor).label('total')
        ).filter(
            and_(
                Lancamento.IndMov == ind_mov,
                Lancamento.FlgConfirmacao == True,  # Campo bit: True = confirmado
                Lancamento.Data >= start_date,
                Lancamento.Data <= end_date
            )
        )
        
        # Filter by empresa if provided
        if empresa_id:
            query = query.filter(Lancamento.CodEmpresa == empresa_id)
        
        # Group by month and year
        results = query.group_by(
            extract('year', Lancamento.Data),
            extract('month', Lancamento.Data)
        ).order_by(
            extract('year', Lancamento.Data),
            extract('month', Lancamento.Data)
        ).all()
        
        # Format results
        monthly_data = []
        for result in results:
            # Format month/year as MM/YYYY
            mes_ano = f"{int(result.mes):02d}/{int(result.ano)}"
            monthly_data.append({
                "mes_ano": mes_ano,
                "valor": float(result.total or 0)
            })
        
        return monthly_data

    def _get_overdue_count(self, account_type: str, empresa_id: Optional[int] = None) -> int:
        """Get count of overdue accounts"""
        
        from datetime import datetime
        
        if account_type == 'payable':
            # Contas vencidas são aquelas não pagas e com data de vencimento anterior a hoje
            query = self.db.query(AccountsPayable).filter(
                and_(
                    AccountsPayable.PaymentDate.is_(None),  # Não pago
                    AccountsPayable.DueDate < datetime.now()  # Vencido
                )
            )
            
            # Filter by empresa if provided
            if empresa_id:
                query = query.filter(AccountsPayable.IdCompany == empresa_id)
                
            return query.count()
        else:  # receivable
            # Contas vencidas são aquelas não recebidas e com data de vencimento anterior a hoje
            query = self.db.query(AccountsReceivable).filter(
                and_(
                    AccountsReceivable.PaymentDate.is_(None),  # Não recebido
                    AccountsReceivable.DueDate < datetime.now()  # Vencido
                )
            )
            
            # Filter by empresa if provided
            if empresa_id:
                query = query.filter(AccountsReceivable.IdCompany == empresa_id)
                
            return query.count()

    def _get_delinquent_count(self, empresa_id: Optional[int] = None) -> int:
        """Get count of delinquent accounts receivable"""
        
        # Como não há campo de protesto na estrutura atual, vamos considerar
        # contas vencidas há mais de 30 dias como inadimplentes
        from datetime import datetime, timedelta
        thirty_days_ago = datetime.now() - timedelta(days=30)
        
        query = self.db.query(AccountsReceivable).filter(
            and_(
                AccountsReceivable.PaymentDate.is_(None),  # Não recebido
                AccountsReceivable.DueDate < thirty_days_ago  # Vencido há mais de 30 dias
            )
        )
        
        # Filter by empresa if provided
        if empresa_id:
            query = query.filter(AccountsReceivable.IdCompany == empresa_id)
            
        return query.count()