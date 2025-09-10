import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

# Configurar conexão
DATABASE_URI = os.getenv('DATABASE_URI')
engine = create_engine(DATABASE_URI)

conn = engine.connect()

try:
    # Verificar tabelas relacionadas a finanças
    result = conn.execute(text("""
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        AND (TABLE_NAME LIKE '%FIN%' OR TABLE_NAME LIKE '%Account%' OR TABLE_NAME LIKE '%Conta%')
        ORDER BY TABLE_NAME
    """))
    
    print("Tabelas financeiras disponíveis:")
    for row in result:
        print(f"- {row[0]}")
        
except Exception as e:
    print(f"Erro: {e}")
finally:
    conn.close()