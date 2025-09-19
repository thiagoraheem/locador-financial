from app.core.config import settings
from sqlalchemy import create_engine, text

def check_flgativo_columns():
    try:
        engine = create_engine(settings.DATABASE_URI)
        with engine.connect() as conn:
            # Verificar colunas da tabela tbl_FINFavorecido
            print('=== VERIFICANDO TABELA tbl_FINFavorecido ===')
            result = conn.execute(text(
                "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE "
                "FROM INFORMATION_SCHEMA.COLUMNS "
                "WHERE TABLE_NAME = 'tbl_FINFavorecido' "
                "ORDER BY ORDINAL_POSITION"
            ))
            
            favorecido_columns = []
            for row in result:
                favorecido_columns.append(row[0])
                print(f"{row[0]} - {row[1]} - Nullable: {row[2]}")
            
            print(f"\nColuna FlgAtivo existe em tbl_FINFavorecido: {'FlgAtivo' in favorecido_columns}")
            
            # Verificar colunas da tabela tbl_FINCategorias
            print('\n=== VERIFICANDO TABELA tbl_FINCategorias ===')
            result = conn.execute(text(
                "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE "
                "FROM INFORMATION_SCHEMA.COLUMNS "
                "WHERE TABLE_NAME = 'tbl_FINCategorias' "
                "ORDER BY ORDINAL_POSITION"
            ))
            
            categoria_columns = []
            for row in result:
                categoria_columns.append(row[0])
                print(f"{row[0]} - {row[1]} - Nullable: {row[2]}")
            
            print(f"\nColuna FlgAtivo existe em tbl_FINCategorias: {'FlgAtivo' in categoria_columns}")
            
            return {
                'favorecido_has_flgativo': 'FlgAtivo' in favorecido_columns,
                'categoria_has_flgativo': 'FlgAtivo' in categoria_columns,
                'favorecido_columns': favorecido_columns,
                'categoria_columns': categoria_columns
            }
            
    except Exception as e:
        print(f"Erro ao verificar colunas: {e}")
        return None

if __name__ == "__main__":
    result = check_flgativo_columns()
    if result:
        print("\n=== RESUMO ===")
        print(f"tbl_FINFavorecido tem FlgAtivo: {result['favorecido_has_flgativo']}")
        print(f"tbl_FINCategorias tem FlgAtivo: {result['categoria_has_flgativo']}")