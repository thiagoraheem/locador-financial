import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

# Configurar conexão
DATABASE_URI = os.getenv('DATABASE_URI')
engine = create_engine(DATABASE_URI)

conn = engine.connect()

try:
    print("Testando queries com SQL direto...")
    
    # Contar lançamentos confirmados
    result = conn.execute(text("SELECT COUNT(*) FROM tbl_FINLancamentos WHERE FlgConfirmacao = 1"))
    confirmados = result.scalar()
    print(f"Lançamentos confirmados: {confirmados}")
    
    # Contar entradas (IndMov = 1/True)
    result = conn.execute(text("SELECT COUNT(*) FROM tbl_FINLancamentos WHERE IndMov = 1 AND FlgConfirmacao = 1"))
    entradas = result.scalar()
    print(f"Entradas confirmadas: {entradas}")
    
    # Contar saídas (IndMov = 0/False)
    result = conn.execute(text("SELECT COUNT(*) FROM tbl_FINLancamentos WHERE IndMov = 0 AND FlgConfirmacao = 1"))
    saidas = result.scalar()
    print(f"Saídas confirmadas: {saidas}")
    
    # Somar valores de entradas
    result = conn.execute(text("SELECT SUM(Valor) FROM tbl_FINLancamentos WHERE IndMov = 1 AND FlgConfirmacao = 1"))
    total_entradas = result.scalar() or 0
    print(f"Total de entradas: R$ {total_entradas}")
    
    # Somar valores de saídas
    result = conn.execute(text("SELECT SUM(Valor) FROM tbl_FINLancamentos WHERE IndMov = 0 AND FlgConfirmacao = 1"))
    total_saidas = result.scalar() or 0
    print(f"Total de saídas: R$ {total_saidas}")
    
    print("\nTodas as queries executaram com sucesso!")
    
except Exception as e:
    print(f"Erro: {e}")
    import traceback
    traceback.print_exc()
finally:
    conn.close()