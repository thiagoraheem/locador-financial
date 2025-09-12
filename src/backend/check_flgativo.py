#!/usr/bin/env python3
"""
Script para verificar os valores de FlgAtivo na tabela de categorias
"""

from app.core.database import engine
from sqlalchemy import text

def check_flgativo_values():
    try:
        with engine.connect() as conn:
            # Verificar valores únicos de FlgAtivo
            result = conn.execute(text("""
                SELECT DISTINCT FlgAtivo, COUNT(*) as count
                FROM tbl_FINCategorias 
                GROUP BY FlgAtivo
                ORDER BY FlgAtivo
            """))
            
            print("Valores únicos de FlgAtivo:")
            for row in result.fetchall():
                print(f"  FlgAtivo: '{row[0]}' - Count: {row[1]}")
            
            # Verificar alguns registros específicos
            result = conn.execute(text("""
                SELECT CodCategoria, DesCategoria, FlgAtivo, flgTipo 
                FROM tbl_FINCategorias 
                LIMIT 5
            """))
            
            print("\nPrimeiros 5 registros:")
            for row in result.fetchall():
                print(f"  ID: {row[0]}, Nome: {row[1]}, FlgAtivo: '{row[2]}', Tipo: {row[3]}")
                
    except Exception as e:
        print(f"Erro ao verificar dados: {e}")

if __name__ == "__main__":
    check_flgativo_values()