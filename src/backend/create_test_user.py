import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from app.core.security import hash_util
from app.core.config import settings

def create_test_user():
    try:
        # Usar a mesma configuração do backend
        engine = create_engine(
            settings.DATABASE_URI,
            pool_pre_ping=True,
            connect_args={
                "TrustServerCertificate": "yes",
                "timeout": 60
            }
        )
        
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Dados do usuário de teste
        login_test = "teste"
        senha_test = "123456"
        senha_hash = hash_util.gera_hash(senha_test)
        
        print(f"Criando usuário de teste:")
        print(f"Login: {login_test}")
        print(f"Senha: {senha_test}")
        print(f"Hash: {senha_hash}")
        
        # Verificar se já existe
        result = db.execute(text("SELECT COUNT(*) FROM tbl_Funcionarios WHERE Login = :login"), {"login": login_test})
        exists = result.scalar()
        
        if exists > 0:
            print(f"\nUsuário '{login_test}' já existe. Atualizando senha...")
            db.execute(text("""
                UPDATE tbl_Funcionarios 
                SET Senha = :senha, DatCadastro = :data
                WHERE Login = :login
            """), {
                "senha": senha_hash, 
                "data": datetime.now(), 
                "login": login_test
            })
        else:
            print(f"\nCriando novo usuário '{login_test}'...")
            db.execute(text("""
                INSERT INTO tbl_Funcionarios (Nome, Login, Senha, Email, DatCadastro, NomUsuario)
                VALUES (:nome, :login, :senha, :email, :data, :nomusuario)
            """), {
                "nome": "Usuário Teste",
                "login": login_test,
                "senha": senha_hash,
                "email": "teste@teste.com",
                "data": datetime.now(),
                "nomusuario": "TESTE"
            })
        
        db.commit()
        print("\n✓ Usuário de teste criado/atualizado com sucesso!")
        print(f"\nPara testar o login, use:")
        print(f"Login: {login_test}")
        print(f"Senha: {senha_test}")
        
        # Verificar o usuário criado
        result = db.execute(text("SELECT CodFuncionario, Nome, Login, Email FROM tbl_Funcionarios WHERE Login = :login"), {"login": login_test})
        user = result.fetchone()
        if user:
            print(f"\nUsuário verificado:")
            print(f"ID: {user[0]}")
            print(f"Nome: {user[1]}")
            print(f"Login: {user[2]}")
            print(f"Email: {user[3]}")
        
        db.close()
        
    except Exception as e:
        print(f"Erro: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_test_user()