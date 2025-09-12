#!/usr/bin/env python3
"""
Script para testar o modelo Categoria diretamente
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import sessionmaker
from app.core.database import engine
from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaResponse

def test_categoria_model():
    """Testa o modelo Categoria diretamente"""
    
    # Criar sessão
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        print("=== Teste do Modelo Categoria ===")
        
        # Buscar uma categoria
        categoria = db.query(Categoria).first()
        
        if not categoria:
            print("Nenhuma categoria encontrada no banco")
            return
        
        print(f"Categoria encontrada: {categoria.CodCategoria} - {categoria.DesCategoria}")
        print(f"FlgAtivo original: {categoria.FlgAtivo}")
        print(f"FlgAtivo convertido: {categoria.FlgAtivo_converted}")
        print(f"Tipo de subcategorias: {type(categoria.subcategorias)}")
        print(f"Subcategorias: {categoria.subcategorias}")
        
        # Testar conversão para CategoriaResponse
        print("\n=== Teste de Conversão para CategoriaResponse ===")
        try:
            response = CategoriaResponse.model_validate(categoria)
            print("✅ Conversão bem-sucedida!")
            print(f"FlgAtivo no response: {response.FlgAtivo}")
            print(f"Subcategorias no response: {response.subcategorias}")
        except Exception as e:
            print(f"❌ Erro na conversão: {e}")
            
        # Testar com categoria que tem subcategorias
        print("\n=== Teste com Categoria que tem Subcategorias ===")
        categoria_com_subs = db.query(Categoria).filter(
            Categoria.CodPai.is_(None)
        ).first()
        
        if categoria_com_subs:
            print(f"Categoria pai: {categoria_com_subs.CodCategoria} - {categoria_com_subs.DesCategoria}")
            print(f"Subcategorias: {categoria_com_subs.subcategorias}")
            
            try:
                response = CategoriaResponse.model_validate(categoria_com_subs)
                print("✅ Conversão da categoria pai bem-sucedida!")
                print(f"Número de subcategorias: {len(response.subcategorias)}")
            except Exception as e:
                print(f"❌ Erro na conversão da categoria pai: {e}")
        
    except Exception as e:
        print(f"Erro geral: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_categoria_model()