#!/usr/bin/env python3
"""
Script para verificar todos os modelos SQLAlchemy e identificar possíveis
referências a colunas que não existem no banco de dados.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, MetaData, inspect
from sqlalchemy.orm import sessionmaker
from app.core.database import get_database_url
from app.models import *
from app.models.base import Base
import importlib
import pkgutil

def get_all_model_classes():
    """Obtém todas as classes de modelo SQLAlchemy."""
    model_classes = []
    
    # Importa todos os módulos do pacote models
    import app.models as models_package
    
    for importer, modname, ispkg in pkgutil.iter_modules(models_package.__path__):
        if modname != '__init__' and modname != 'base' and modname != 'mixins':
            try:
                module = importlib.import_module(f'app.models.{modname}')
                print(f"\n=== Verificando módulo: {modname} ===")
                
                # Procura por classes que herdam de Base
                for attr_name in dir(module):
                    attr = getattr(module, attr_name)
                    if (isinstance(attr, type) and 
                        hasattr(attr, '__tablename__') and 
                        issubclass(attr, Base)):
                        model_classes.append((modname, attr_name, attr))
                        print(f"  Encontrada classe: {attr_name}")
                        
            except Exception as e:
                print(f"  Erro ao importar {modname}: {e}")
    
    return model_classes

def check_model_columns(model_class, engine):
    """Verifica se todas as colunas do modelo existem na tabela real."""
    try:
        table_name = model_class.__tablename__
        print(f"\n--- Verificando modelo {model_class.__name__} (tabela: {table_name}) ---")
        
        # Obtém colunas do modelo
        model_columns = set()
        if hasattr(model_class, '__table__'):
            for column in model_class.__table__.columns:
                model_columns.add(column.name)
                print(f"  Modelo tem coluna: {column.name}")
        
        # Obtém colunas reais da tabela
        inspector = inspect(engine)
        if inspector.has_table(table_name):
            real_columns = set()
            for column in inspector.get_columns(table_name):
                real_columns.add(column['name'])
            
            print(f"  Tabela real tem {len(real_columns)} colunas")
            
            # Verifica diferenças
            missing_in_db = model_columns - real_columns
            missing_in_model = real_columns - model_columns
            
            if missing_in_db:
                print(f"  ⚠️  PROBLEMA: Colunas no modelo mas não no banco: {missing_in_db}")
                return False, missing_in_db
            
            if missing_in_model:
                print(f"  ℹ️  Info: Colunas no banco mas não no modelo: {missing_in_model}")
            
            if not missing_in_db and not missing_in_model:
                print(f"  ✅ Modelo sincronizado com o banco")
                return True, set()
            
            return len(missing_in_db) == 0, missing_in_db
        else:
            print(f"  ❌ Tabela {table_name} não existe no banco!")
            return False, model_columns
            
    except Exception as e:
        print(f"  ❌ Erro ao verificar modelo {model_class.__name__}: {e}")
        return False, set()

def check_model_relationships(model_class):
    """Verifica relacionamentos do modelo."""
    try:
        print(f"\n--- Verificando relacionamentos de {model_class.__name__} ---")
        
        if hasattr(model_class, '__mapper__'):
            relationships = model_class.__mapper__.relationships
            if relationships:
                for rel_name, rel in relationships.items():
                    print(f"  Relacionamento: {rel_name} -> {rel.mapper.class_.__name__}")
                    
                    # Verifica foreign keys
                    if hasattr(rel, 'local_columns') and rel.local_columns:
                        for col in rel.local_columns:
                            print(f"    FK local: {col.name}")
                    
                    if hasattr(rel, 'remote_side') and rel.remote_side:
                        for col in rel.remote_side:
                            print(f"    FK remota: {col.name}")
            else:
                print(f"  Nenhum relacionamento encontrado")
        
    except Exception as e:
        print(f"  ❌ Erro ao verificar relacionamentos: {e}")

def main():
    print("=== VERIFICAÇÃO COMPLETA DE TODOS OS MODELOS ===")
    
    try:
        # Conecta ao banco
        database_url = get_database_url()
        engine = create_engine(database_url)
        
        print(f"Conectado ao banco: {database_url}")
        
        # Obtém todas as classes de modelo
        model_classes = get_all_model_classes()
        print(f"\nEncontradas {len(model_classes)} classes de modelo")
        
        problems_found = []
        
        # Verifica cada modelo
        for module_name, class_name, model_class in model_classes:
            print(f"\n{'='*60}")
            print(f"VERIFICANDO: {module_name}.{class_name}")
            print(f"{'='*60}")
            
            # Verifica colunas
            is_ok, missing_columns = check_model_columns(model_class, engine)
            if not is_ok:
                problems_found.append({
                    'module': module_name,
                    'class': class_name,
                    'missing_columns': missing_columns
                })
            
            # Verifica relacionamentos
            check_model_relationships(model_class)
        
        # Resumo final
        print(f"\n{'='*60}")
        print("RESUMO FINAL")
        print(f"{'='*60}")
        
        if problems_found:
            print(f"❌ PROBLEMAS ENCONTRADOS em {len(problems_found)} modelos:")
            for problem in problems_found:
                print(f"  - {problem['module']}.{problem['class']}: {problem['missing_columns']}")
        else:
            print("✅ TODOS OS MODELOS ESTÃO SINCRONIZADOS COM O BANCO!")
        
        return len(problems_found) == 0
        
    except Exception as e:
        print(f"❌ Erro geral: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)