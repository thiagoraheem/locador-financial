from app.core.config import settings
from sqlalchemy import create_engine, text

def check_categoria_table():
    try:
        engine = create_engine(settings.DATABASE_URI)
        with engine.connect() as conn:
            result = conn.execute(text(
                "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE "
                "FROM INFORMATION_SCHEMA.COLUMNS "
                "WHERE TABLE_NAME = 'tbl_FINCategorias' "
                "ORDER BY ORDINAL_POSITION"
            ))
            
            print('Colunas da tabela tbl_FINCategorias:')
            print('-' * 50)
            for row in result:
                print(f'{row[0]} - {row[1]} - Nullable: {row[2]}')
                
    except Exception as e:
        print(f'Erro ao verificar tabela: {e}')

if __name__ == '__main__':
    check_categoria_table()