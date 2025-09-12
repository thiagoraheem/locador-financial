from app.core.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        # Verificar senha do usuário admin
        result = conn.execute(text("""
            SELECT Login, Senha 
            FROM tbl_Funcionarios 
            WHERE Login = 'admin'
        """))
        
        user = result.fetchone()
        if user:
            print(f"Usuário: {user[0]}")
            print(f"Senha: {user[1]}")
        else:
            print("Usuário admin não encontrado")
            
except Exception as e:
    print(f"Erro ao verificar usuário: {e}")