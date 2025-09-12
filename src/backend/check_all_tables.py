import pyodbc
from sqlalchemy import create_engine, text
from app.core.config import settings

def check_table_structure(table_name):
    """Verifica a estrutura de uma tabela específica"""
    try:
        engine = create_engine(settings.DATABASE_URI)
        
        print(f"\n=== Estrutura da tabela {table_name} ===")
        
        with engine.connect() as connection:
            # Usar INFORMATION_SCHEMA para obter estrutura detalhada
            query = text("""
                SELECT 
                    COLUMN_NAME,
                    DATA_TYPE,
                    CHARACTER_MAXIMUM_LENGTH,
                    NUMERIC_PRECISION,
                    NUMERIC_SCALE,
                    IS_NULLABLE,
                    COLUMN_DEFAULT
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = :table_name
                ORDER BY ORDINAL_POSITION
            """)
            
            result = connection.execute(query, {"table_name": table_name})
            columns = result.fetchall()
            
            if not columns:
                print(f"  Tabela {table_name} não encontrada!")
                return False
            
            for col in columns:
                col_name = col[0]
                data_type = col[1]
                max_length = col[2] if col[2] else ''
                precision = col[3] if col[3] else ''
                scale = col[4] if col[4] else ''
                nullable = 'NULL' if col[5] == 'YES' else 'NOT NULL'
                default = f" DEFAULT {col[6]}" if col[6] else ''
                
                # Formatação do tipo
                if max_length and data_type in ['varchar', 'char', 'nvarchar', 'nchar']:
                    type_info = f"{data_type}({max_length})"
                elif precision and data_type in ['numeric', 'decimal']:
                    if scale:
                        type_info = f"{data_type}({precision},{scale})"
                    else:
                        type_info = f"{data_type}({precision})"
                elif data_type == 'money':
                    type_info = f"{data_type}(19,4)"
                else:
                    type_info = data_type
                
                print(f"  {col_name}: {type_info} {nullable}{default}")
            
            print(f"\nTotal de colunas: {len(columns)}")
            return True
            
    except Exception as e:
        print(f"Erro ao verificar tabela {table_name}: {str(e)}")
        return False

def main():
    """Verifica estrutura de todas as tabelas principais"""
    tables_to_check = [
        'tbl_Funcionarios',
        'tbl_FINCategorias',
        'tbl_Clientes',
        'tbl_FINLancamentos',
        'tbl_AccountsReceivable',
        'tbl_AccountsPayable',
        'tbl_FINFavorecido',
        'tbl_Banco'
    ]
    
    print("Verificando estrutura das tabelas principais...")
    
    for table in tables_to_check:
        success = check_table_structure(table)
        if not success:
            print(f"ATENÇÃO: Problema ao verificar {table}")
    
    print("\n=== Verificação concluída ===")

if __name__ == "__main__":
    main()