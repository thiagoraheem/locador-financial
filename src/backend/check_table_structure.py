#!/usr/bin/env python3
"""
Script para verificar a estrutura da tabela tbl_Empresa
"""

from app.core.database import engine
import sqlalchemy

def check_table_structure():
    try:
        inspector = sqlalchemy.inspect(engine)
        
        # Verificar se a tabela existe
        tables = inspector.get_table_names()
        print(f"Tabelas disponíveis: {tables}")
        
        if 'tbl_Empresa' in tables:
            print("\n=== Estrutura da tabela tbl_Empresa ===")
            columns = inspector.get_columns('tbl_Empresa')
            for col in columns:
                print(f"- {col['name']} ({col['type']}) - Nullable: {col['nullable']}")
        else:
            print("Tabela tbl_Empresa não encontrada!")
            
    except Exception as e:
        print(f"Erro ao verificar estrutura da tabela: {e}")

if __name__ == "__main__":
    check_table_structure()