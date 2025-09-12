from app.core.database import get_db
from sqlalchemy import text, inspect
from app.models.conta import Conta

def check_conta_table():
    db = next(get_db())
    
    # Usar inspector para ver a estrutura da tabela
    inspector = inspect(db.bind)
    
    print("Colunas da tabela tbl_Conta:")
    columns = inspector.get_columns('tbl_Conta')
    for col in columns:
        print(f"  {col['name']} - {col['type']} - Nullable: {col['nullable']}")
    
    # Verificar se existe algum registro
    try:
        result = db.execute(text("SELECT COUNT(*) FROM tbl_Conta"))
        count = result.scalar()
        print(f"\nTotal de registros: {count}")
        
        if count > 0:
            result = db.execute(text("SELECT TOP 3 * FROM tbl_Conta"))
            rows = result.fetchall()
            print("\nPrimeiros registros:")
            for row in rows:
                print(f"  {dict(row._mapping)}")
    except Exception as e:
        print(f"Erro ao consultar dados: {e}")
    
    db.close()

if __name__ == '__main__':
    check_conta_table()