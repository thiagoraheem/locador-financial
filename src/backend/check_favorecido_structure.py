#!/usr/bin/env python3
"""
Script para verificar a estrutura completa da tabela tbl_FINFavorecido
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db
from sqlalchemy import text

def check_table_structure():
    """Verifica a estrutura da tabela tbl_FINFavorecido"""
    
    db = next(get_db())
    
    try:
        print("=== Estrutura da tabela tbl_FINFavorecido ===")
        
        # Query para obter informações das colunas
        query = text("""
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                IS_NULLABLE,
                CHARACTER_MAXIMUM_LENGTH
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'tbl_FINFavorecido' 
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
        
    except Exception as e:
        print(f"Erro: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_table_structure()