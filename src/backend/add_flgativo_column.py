#!/usr/bin/env python3
"""
Script para adicionar a coluna FlgAtivo à tabela tbl_FINCategorias
"""

from app.core.database import engine
from sqlalchemy import text

def add_flgativo_column():
    try:
        with engine.connect() as conn:
            # Verificar se a coluna já existe
            check_sql = """
            SELECT COUNT(*) as count
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'tbl_FINCategorias' 
            AND COLUMN_NAME = 'FlgAtivo'
            """
            
            result = conn.execute(text(check_sql))
            count = result.fetchone()[0]
            
            if count == 0:
                # Adicionar a coluna se não existir
                alter_sql = "ALTER TABLE tbl_FINCategorias ADD FlgAtivo VARCHAR(1) DEFAULT 'S'"
                conn.execute(text(alter_sql))
                conn.commit()
                print("Coluna FlgAtivo adicionada com sucesso!")
            else:
                print("Coluna FlgAtivo já existe na tabela.")
                
    except Exception as e:
        print(f"Erro ao adicionar coluna: {e}")

if __name__ == "__main__":
    add_flgativo_column()