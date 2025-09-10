#!/usr/bin/env python3
"""
Teste específico para verificar consultas nas tabelas AccountsPayable e AccountsReceivable
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db
from app.models.accounts_payable import AccountsPayable
from app.models.accounts_receivable import AccountsReceivable
from sqlalchemy import text

def test_accounts_queries():
    """Testa consultas básicas nas tabelas de contas"""
    
    db = next(get_db())
    
    try:
        print("=== Testando consultas nas tabelas de contas ===")
        
        # Teste 1: Contar registros em AccountsPayable
        print("\n1. Contando registros em tbl_AccountsPayable:")
        count_payable = db.query(AccountsPayable).count()
        print(f"   Total de registros: {count_payable}")
        
        # Teste 2: Contar registros em AccountsReceivable
        print("\n2. Contando registros em tbl_AccountsReceivable:")
        count_receivable = db.query(AccountsReceivable).count()
        print(f"   Total de registros: {count_receivable}")
        
        # Teste 3: Verificar valores únicos de Status em AccountsPayable
        print("\n3. Valores únicos de Status em tbl_AccountsPayable:")
        status_values_payable = db.query(AccountsPayable.Status).distinct().all()
        print(f"   Status encontrados: {[s[0] for s in status_values_payable]}")
        
        # Teste 4: Verificar valores únicos de Status em AccountsReceivable
        print("\n4. Valores únicos de Status em tbl_AccountsReceivable:")
        status_values_receivable = db.query(AccountsReceivable.Status).distinct().all()
        print(f"   Status encontrados: {[s[0] for s in status_values_receivable]}")
        
        # Teste 5: Consulta com filtro Status.in_(['A', 'V']) em AccountsPayable
        print("\n5. Testando filtro Status.in_(['A', 'V']) em AccountsPayable:")
        try:
            count_filtered_payable = db.query(AccountsPayable).filter(
                AccountsPayable.Status.in_(['A', 'V'])
            ).count()
            print(f"   Registros com Status A ou V: {count_filtered_payable}")
        except Exception as e:
            print(f"   ERRO na consulta: {e}")
        
        # Teste 6: Consulta com filtro Status.in_(['A', 'V']) em AccountsReceivable
        print("\n6. Testando filtro Status.in_(['A', 'V']) em AccountsReceivable:")
        try:
            count_filtered_receivable = db.query(AccountsReceivable).filter(
                AccountsReceivable.Status.in_(['A', 'V'])
            ).count()
            print(f"   Registros com Status A ou V: {count_filtered_receivable}")
        except Exception as e:
            print(f"   ERRO na consulta: {e}")
        
        # Teste 7: Consulta SQL direta
        print("\n7. Testando consulta SQL direta:")
        try:
            result = db.execute(text("SELECT COUNT(*) FROM tbl_AccountsPayable WHERE Status IN ('A', 'V')")).scalar()
            print(f"   SQL direto - AccountsPayable com Status A ou V: {result}")
        except Exception as e:
            print(f"   ERRO na consulta SQL direta: {e}")
            
        try:
            result = db.execute(text("SELECT COUNT(*) FROM tbl_AccountsReceivable WHERE Status IN ('A', 'V')")).scalar()
            print(f"   SQL direto - AccountsReceivable com Status A ou V: {result}")
        except Exception as e:
            print(f"   ERRO na consulta SQL direta: {e}")
        
        print("\n=== Teste concluído ===")
        
    except Exception as e:
        print(f"Erro geral no teste: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_accounts_queries()