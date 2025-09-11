#!/usr/bin/env python3
"""
Script para verificar a estrutura de todas as tabelas que podem ter problemas com LoginAuditMixin
"""

from sqlalchemy import create_engine, inspect
from app.core.config import settings

def check_table_structure(table_name):
    """Verifica a estrutura de uma tabela específica"""
    try:
        engine = create_engine(settings.DATABASE_URI)
        inspector = inspect(engine)
        
        if inspector.has_table(table_name):
            columns = inspector.get_columns(table_name)
            print(f"\n=== Tabela: {table_name} ===")
            print("Colunas encontradas:")
            for col in columns:
                print(f"  - {col['name']} ({col['type']})")
        else:
            print(f"\n❌ Tabela {table_name} não encontrada!")
            
    except Exception as e:
        print(f"❌ Erro ao verificar tabela {table_name}: {e}")

if __name__ == "__main__":
    # Tabelas que usam LoginAuditMixin
    tables_to_check = [
        "tbl_Empresa",
        "tbl_Banco", 
        "tbl_FINFormaPagamento",
        "tbl_Clientes",
        "tbl_Conta"
    ]
    
    print("🔍 Verificando estrutura das tabelas com LoginAuditMixin...")
    
    for table in tables_to_check:
        check_table_structure(table)
    
    print("\n✅ Verificação concluída!")