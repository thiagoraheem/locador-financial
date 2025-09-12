#!/usr/bin/env python3
"""
Script para verificar a estrutura da tabela tbl_FINLancamentos
"""

from app.core.database import engine
import sqlalchemy

def check_lancamentos_table():
    try:
        inspector = sqlalchemy.inspect(engine)
        
        # Verificar se a tabela existe
        tables = inspector.get_table_names()
        print(f"Tabelas disponíveis: {len(tables)} tabelas")
        
        if 'tbl_FINLancamentos' in tables:
            print("\n=== Estrutura da tabela tbl_FINLancamentos ===")
            columns = inspector.get_columns('tbl_FINLancamentos')
            for col in columns:
                print(f"- {col['name']} ({col['type']}) - Nullable: {col['nullable']}")
                
            # Verificar especificamente se idConta existe
            column_names = [col['name'] for col in columns]
            if 'idConta' in column_names:
                print("\n✅ Coluna 'idConta' encontrada!")
            else:
                print("\n❌ Coluna 'idConta' NÃO encontrada!")
                print("Colunas relacionadas a conta encontradas:")
                conta_cols = [name for name in column_names if 'conta' in name.lower()]
                if conta_cols:
                    for col in conta_cols:
                        print(f"  - {col}")
                else:
                    print("  Nenhuma coluna relacionada a 'conta' encontrada")
        else:
            print("Tabela tbl_FINLancamentos não encontrada!")
            
    except Exception as e:
        print(f"Erro ao verificar estrutura da tabela: {e}")

if __name__ == "__main__":
    check_lancamentos_table()