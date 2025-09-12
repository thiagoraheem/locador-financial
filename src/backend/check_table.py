from app.core.database import engine
from sqlalchemy import text

print("Verificando estrutura da tabela tbl_Funcionarios...")

with engine.connect() as conn:
    try:
        # Obter estrutura detalhada das colunas
        result = conn.execute(text("""
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                IS_NULLABLE,
                CHARACTER_MAXIMUM_LENGTH,
                NUMERIC_PRECISION,
                NUMERIC_SCALE,
                COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'tbl_Funcionarios'
            ORDER BY ORDINAL_POSITION
        """))
        
        print("\n=== Estrutura da tabela tbl_Funcionarios ===")
        columns = []
        for row in result:
            col_name = row[0]
            data_type = row[1]
            is_nullable = row[2]
            max_length = row[3]
            precision = row[4]
            scale = row[5]
            default_val = row[6]
            
            columns.append(col_name)
            
            # Formatação do tipo de dados
            type_info = data_type
            if max_length:
                type_info += f"({max_length})"
            elif precision and scale:
                type_info += f"({precision},{scale})"
            elif precision:
                type_info += f"({precision})"
                
            nullable = "NULL" if is_nullable == "YES" else "NOT NULL"
            default_info = f" DEFAULT {default_val}" if default_val else ""
            
            print(f"  {col_name}: {type_info} {nullable}{default_info}")
        
        print(f"\nTotal de colunas: {len(columns)}")
        
        # Verificar campos específicos
        has_login = 'Login' in columns
        has_nome = 'Nome' in columns
        has_nomfuncionario = 'NomFuncionario' in columns
        
        print(f"\n=== Verificação de campos específicos ===")
        print(f"Campo 'Login' existe: {has_login}")
        print(f"Campo 'Nome' existe: {has_nome}")
        print(f"Campo 'NomFuncionario' existe: {has_nomfuncionario}")
        
        # Listar todos os campos que contêm 'nom' ou 'login' (case insensitive)
        matching_fields = [col for col in columns if 'nom' in col.lower() or 'login' in col.lower()]
        if matching_fields:
            print(f"\nCampos relacionados a nome/login: {matching_fields}")
        
        # Tentar obter um registro de exemplo
        try:
            sample_result = conn.execute(text("SELECT TOP 1 * FROM tbl_Funcionarios"))
            sample_row = sample_result.fetchone()
            
            if sample_row:
                print("\n=== Exemplo de registro ===")
                for i, col in enumerate(columns):
                    value = sample_row[i] if sample_row[i] is not None else "NULL"
                    # Truncar valores muito longos
                    if isinstance(value, str) and len(str(value)) > 50:
                        value = str(value)[:50] + "..."
                    print(f"  {col}: {value}")
            else:
                print("\nNenhum registro encontrado na tabela.")
                
        except Exception as sample_error:
            print(f"\nErro ao obter registro de exemplo: {sample_error}")
            
    except Exception as e:
        print(f"Erro ao consultar estrutura da tabela: {e}")
        
        # Verificar se a tabela existe
        try:
            table_check = conn.execute(text("""
                SELECT TABLE_NAME 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME LIKE '%Funcionario%'
            """))
            
            print("\n=== Tabelas relacionadas a Funcionarios ===")
            for row in table_check:
                print(f"  - {row[0]}")
                
        except Exception as check_error:
            print(f"Erro ao verificar tabelas: {check_error}")