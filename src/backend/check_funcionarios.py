import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.core.config import settings

def check_funcionarios():
    try:
        # Get database URL from settings
        db_url = settings.DATABASE_URI
        print(f"Connecting to database...")
        
        # Create engine and session
        engine = create_engine(db_url)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        with SessionLocal() as session:
            print("\n=== tbl_Funcionarios Structure ===")
            
            # Get full column information
            result = session.execute(text("""
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH, COLUMN_DEFAULT
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'tbl_Funcionarios'
                ORDER BY ORDINAL_POSITION
            """))
            
            columns = result.fetchall()
            print("All columns:")
            for col in columns:
                length = f"({col[3]})" if col[3] else ""
                nullable = "NULL" if col[2] == 'YES' else "NOT NULL"
                default = f" DEFAULT {col[4]}" if col[4] else ""
                print(f"  - {col[0]}: {col[1]}{length} {nullable}{default}")
            
            # Get record count
            result = session.execute(text("SELECT COUNT(*) FROM tbl_Funcionarios"))
            count = result.scalar()
            print(f"\nTotal records: {count}")
            
            if count > 0:
                # Show all records with login/senha info
                result = session.execute(text("""
                    SELECT CodFuncionario, Nome, Login, Senha, Email
                    FROM tbl_Funcionarios
                    ORDER BY CodFuncionario
                """))
                
                records = result.fetchall()
                print("\nAll funcionarios with login info:")
                for record in records:
                    record_dict = dict(record._mapping)
                    print(f"  ID: {record_dict.get('CodFuncionario')}")
                    print(f"  Nome: {record_dict.get('Nome')}")
                    print(f"  Login: {record_dict.get('Login')}")
                    print(f"  Senha: {record_dict.get('Senha')}")
                    print(f"  Email: {record_dict.get('Email')}")
                    print("  ---")
                    
                # Try to create a test user if none exists with login 'admin'
                result = session.execute(text("""
                    SELECT COUNT(*) FROM tbl_Funcionarios WHERE Login = 'admin'
                """))
                admin_count = result.scalar()
                
                if admin_count == 0:
                    print("\nNo admin user found. Creating test admin user...")
                    try:
                        session.execute(text("""
                            INSERT INTO tbl_Funcionarios (Nome, Login, Senha, DatCadastro, NomUsuario)
                            VALUES ('Administrador', 'admin', '123456', GETDATE(), 'system')
                        """))
                        session.commit()
                        print("Test admin user created successfully!")
                    except Exception as e:
                        print(f"Error creating admin user: {e}")
                        session.rollback()
                else:
                    print(f"\nFound {admin_count} admin user(s)")
                    
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_funcionarios()