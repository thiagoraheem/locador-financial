from app.core.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        # Verificar se a tabela existe
        result = conn.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'tbl_FINCategorias'
            ORDER BY ordinal_position
        """))
        
        columns = result.fetchall()
        if columns:
            print("Colunas da tabela tbl_FINCategorias:")
            for col in columns:
                print(f"  - {col[0]} ({col[1]})")
        else:
            print("Tabela tbl_FINCategorias não encontrada")
            
        # Verificar especificamente a coluna FlgAtivo
        result2 = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'tbl_FINCategorias' AND column_name = 'FlgAtivo'
        """))
        
        flg_ativo_exists = result2.fetchone()
        print(f"\nColuna FlgAtivo existe: {flg_ativo_exists is not None}")
        
except Exception as e:
    print(f"Erro ao verificar tabela: {e}")