import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

# Configurar conexão
DATABASE_URI = os.getenv('DATABASE_URI')
engine = create_engine(DATABASE_URI)

conn = engine.connect()

try:
    # Verificar se existe coluna relacionada a status
    result = conn.execute(text("""
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME IN ('tbl_AccountsPayable', 'tbl_AccountsReceivable')
        AND (COLUMN_NAME LIKE '%Status%' OR COLUMN_NAME LIKE '%Estado%' OR COLUMN_NAME LIKE '%Situacao%')
    """))
    
    print("Colunas relacionadas a status:")
    status_columns = list(result)
    if status_columns:
        for row in status_columns:
            print(f"- {row[0]}")
    else:
        print("- Nenhuma coluna de status encontrada")
        
except Exception as e:
    print(f"Erro: {e}")
finally:
    conn.close()