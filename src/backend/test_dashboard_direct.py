import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.services.dashboard_service import DashboardService

load_dotenv()

# Configurar conexão
DATABASE_URI = os.getenv('DATABASE_URI')
engine = create_engine(DATABASE_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

db = SessionLocal()

try:
    print("Testando DashboardService diretamente...")
    
    service = DashboardService(db)
    result = service.get_financial_summary()
    
    print("Resultado do dashboard:")
    print(result)
    
except Exception as e:
    print(f"Erro: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()