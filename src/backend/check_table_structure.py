import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

# Configurar conexão
DATABASE_URI = os.getenv('DATABASE_URI')
engine = create_engine(DATABASE_URI)

conn = engine.connect()

try:
    # Verificar estrutura da tabela tbl_AccountsPayable
    print("=== Estrutura da tabela tbl_AccountsPayable ===")
    result = conn.execute(text("""
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'tbl_AccountsPayable'
        ORDER BY ORDINAL_POSITION
    """))
    
    for row in result:
        print(f"- {row[0]} ({row[1]}) - Nullable: {row[2]} - Default: {row[3]}")
    
    print("\n=== Estrutura da tabela tbl_AccountsReceivable ===")
    result = conn.execute(text("""
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'tbl_AccountsReceivable'
        ORDER BY ORDINAL_POSITION
    """))
    
    for row in result:
        print(f"- {row[0]} ({row[1]}) - Nullable: {row[2]} - Default: {row[3]}")
        
    # Verificar se existe coluna Status nas tabelas
    print("\n=== Verificando coluna Status ===")
    result = conn.execute(text("""
        SELECT TABLE_NAME, COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME IN ('tbl_AccountsPayable', 'tbl_AccountsReceivable')
        AND COLUMN_NAME LIKE '%Status%'
    """))
    
    status_columns = list(result)
    if status_columns:
        for row in status_columns:
            print(f"- {row[0]}.{row[1]}")
    else:
        print("- Nenhuma coluna Status encontrada")
        
except Exception as e:
    print(f"Erro: {e}")
finally:
    conn.close()