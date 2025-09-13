from app.core.database import engine, Base
from app.models.categoria import Categoria
from sqlalchemy import MetaData

def force_metadata_refresh():
    try:
        print("Forçando refresh do metadata do SQLAlchemy...")
        
        # Limpar metadata existente
        Base.metadata.clear()
        
        # Criar novo metadata
        metadata = MetaData()
        
        # Refletir a estrutura atual do banco
        metadata.reflect(bind=engine)
        
        # Verificar se a tabela existe
        if 'tbl_FINCategorias' in metadata.tables:
            table = metadata.tables['tbl_FINCategorias']
            print(f"Colunas encontradas na tabela tbl_FINCategorias:")
            for column in table.columns:
                print(f"  - {column.name}: {column.type}")
        else:
            print("Tabela tbl_FINCategorias não encontrada!")
            
        # Recriar metadata do modelo
        Base.metadata.create_all(bind=engine, checkfirst=True)
        
        print("Metadata atualizado com sucesso!")
        
    except Exception as e:
        print(f"Erro ao atualizar metadata: {e}")

if __name__ == '__main__':
    force_metadata_refresh()