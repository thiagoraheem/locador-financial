#!/usr/bin/env python3
"""
Script para verificar a estrutura da tabela tbl_FINLancamentos
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db
from sqlalchemy import text

def check_table_structure():
    """Verifica a estrutura da tabela tbl_FINLancamentos"""
    
    db = next(get_db())
    
    try:
        print("=== Estrutura da tabela tbl_FINLancamentos ===")
        
        # Query para obter informações das colunas
        query = text("""
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                IS_NULLABLE,
                CHARACTER_MAXIMUM_LENGTH
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'tbl_FINLancamentos' 
            ORDER BY ORDINAL_POSITION
        """)
        
        result = db.execute(query)
        columns = result.fetchall()
        
        print(f"Total de colunas: {len(columns)}")
        print("\nColunas encontradas:")
        
        for col in columns:
            nullable = "NULL" if col[2] == "YES" else "NOT NULL"
            max_length = f"({col[3]})" if col[3] else ""
            print(f"  {col[0]:<25} {col[1]}{max_length:<15} {nullable}")
        
        # Verificar alguns valores de exemplo dos campos problemáticos
        print("\n=== Valores de exemplo dos campos IndMov e FlgConfirmacao ===")
        sample_query = text("""
            SELECT TOP 10 
                IndMov, 
                FlgConfirmacao,
                CAST(FlgConfirmacao AS VARCHAR) as FlgConfirmacao_str
            FROM tbl_FINLancamentos
        """)
        
        result = db.execute(sample_query)
        samples = result.fetchall()
        
        print("IndMov | FlgConfirmacao | FlgConfirmacao_str")
        print("-------|----------------|------------------")
        for sample in samples:
            print(f"  {sample[0]:<5} | {sample[1]:<14} | {sample[2]}")
        
    except Exception as e:
        print(f"Erro: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_table_structure()