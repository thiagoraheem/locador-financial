#!/usr/bin/env python3
"""
Teste corrigido para verificar consultas nas tabelas AccountsPayable e AccountsReceivable
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db
from app.models.accounts_payable import AccountsPayable
from app.models.accounts_receivable import AccountsReceivable
from sqlalchemy import text

def test_accounts_queries_fixed():
    """Testa consultas básicas nas tabelas de contas (versão corrigida)"""
    
    db = next(get_db())
    
    try:
        print("=== Testando consultas nas tabelas de contas (CORRIGIDO) ===")
        
        # Teste 1: Contar registros em AccountsPayable
        print("\n1. Contando registros em tbl_AccountsPayable:")
        count_payable = db.query(AccountsPayable).count()
        print(f"   Total de registros: {count_payable}")
        
        # Teste 2: Contar registros em AccountsReceivable
        print("\n2. Contando registros em tbl_AccountsReceivable:")
        count_receivable = db.query(AccountsReceivable).count()
        print(f"   Total de registros: {count_receivable}")
        
        # Teste 3: Verificar alguns registros de AccountsPayable
        print("\n3. Primeiros 5 registros de AccountsPayable:")
        payable_records = db.query(AccountsPayable).limit(5).all()
        for record in payable_records:
            print(f"   ID: {record.IdAccountsPayable}, Valor: {record.Amount}, Vencimento: {record.DueDate}")
        
        # Teste 4: Verificar registros vencidos em AccountsPayable
        print("\n4. Testando consulta de contas vencidas (PaymentDate IS NULL e DueDate < hoje):")
        try:
            from datetime import date
            vencidas = db.query(AccountsPayable).filter(
                AccountsPayable.PaymentDate.is_(None),
                AccountsPayable.DueDate < date.today()
            ).count()
            print(f"   Contas vencidas não pagas: {vencidas}")
        except Exception as e:
            print(f"   ERRO na consulta de vencidas: {e}")
        
        # Teste 5: Verificar contas pagas
        print("\n5. Testando consulta de contas pagas (PaymentDate IS NOT NULL):")
        try:
            pagas = db.query(AccountsPayable).filter(
                AccountsPayable.PaymentDate.isnot(None)
            ).count()
            print(f"   Contas pagas: {pagas}")
        except Exception as e:
            print(f"   ERRO na consulta de pagas: {e}")
        
        # Teste 6: Consulta SQL direta para verificar estrutura
        print("\n6. Testando consulta SQL direta:")
        try:
            result = db.execute(text("SELECT COUNT(*) FROM tbl_AccountsPayable WHERE PaymentDate IS NULL")).scalar()
            print(f"   SQL direto - AccountsPayable não pagas: {result}")
        except Exception as e:
            print(f"   ERRO na consulta SQL direta: {e}")
            
        try:
            result = db.execute(text("SELECT COUNT(*) FROM tbl_AccountsReceivable WHERE PaymentDate IS NULL")).scalar()
            print(f"   SQL direto - AccountsReceivable não recebidas: {result}")
        except Exception as e:
            print(f"   ERRO na consulta SQL direta: {e}")
        
        print("\n=== Teste concluído com sucesso ===")
        
    except Exception as e:
        print(f"Erro geral no teste: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_accounts_queries_fixed()