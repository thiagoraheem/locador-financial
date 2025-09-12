#!/usr/bin/env python3
"""
Script para testar os schemas Pydantic atualizados
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models import TblFuncionarios, Favorecido, Banco, Categoria
from app.schemas import (
    FuncionarioResponse, 
    FavorecidoResponse, 
    BancoResponse, 
    CategoriaResponse
)

def test_pydantic_schemas():
    """Testa os schemas Pydantic atualizados"""
    db = SessionLocal()
    
    try:
        print("=== Testando Schemas Pydantic Atualizados ===")
        
        # Teste schema FuncionarioResponse
        print("\n1. Testando schema FuncionarioResponse...")
        funcionario = db.query(TblFuncionarios).first()
        if funcionario:
            try:
                funcionario_schema = FuncionarioResponse.model_validate(funcionario)
                print(f"   ✓ Schema validado: {funcionario_schema.Nome} (ID: {funcionario_schema.CodFuncionario})")
                print(f"   ✓ Propriedade is_active: {funcionario_schema.is_active}")
                print(f"   ✓ Propriedade DtCreate: {funcionario_schema.DtCreate}")
            except Exception as e:
                print(f"   ✗ Erro no schema: {e}")
        else:
            print("   ⚠ Nenhum funcionário encontrado")
        
        # Teste schema FavorecidoResponse
        print("\n2. Testando schema FavorecidoResponse...")
        favorecido = db.query(Favorecido).first()
        if favorecido:
            try:
                favorecido_schema = FavorecidoResponse.model_validate(favorecido)
                print(f"   ✓ Schema validado: {favorecido_schema.DesFavorecido} (ID: {favorecido_schema.CodFavorecido})")
                print(f"   ✓ Propriedade DtCreate: {favorecido_schema.DtCreate}")
            except Exception as e:
                print(f"   ✗ Erro no schema: {e}")
        else:
            print("   ⚠ Nenhum favorecido encontrado")
        
        # Teste schema BancoResponse
        print("\n3. Testando schema BancoResponse...")
        banco = db.query(Banco).first()
        if banco:
            try:
                banco_schema = BancoResponse.model_validate(banco)
                print(f"   ✓ Schema validado: {banco_schema.Nome} (Código: {banco_schema.Codigo})")
                print(f"   ✓ Propriedade codigo_completo: {banco_schema.codigo_completo}")
                print(f"   ✓ Propriedade DtCreate: {banco_schema.DtCreate}")
            except Exception as e:
                print(f"   ✗ Erro no schema: {e}")
        else:
            print("   ⚠ Nenhum banco encontrado")
        
        # Teste schema CategoriaResponse
        print("\n4. Testando schema CategoriaResponse...")
        categoria = db.query(Categoria).first()
        if categoria:
            try:
                categoria_schema = CategoriaResponse.model_validate(categoria)
                print(f"   ✓ Schema validado: {categoria_schema.DesCategoria} (ID: {categoria_schema.CodCategoria})")
                print(f"   ✓ Propriedade TipoCategoria: {categoria_schema.TipoCategoria}")
                print(f"   ✓ Propriedade CodCategoriaPai: {categoria_schema.CodCategoriaPai}")
                print(f"   ✓ Propriedade DtCreate: {categoria_schema.DtCreate}")
            except Exception as e:
                print(f"   ✗ Erro no schema: {e}")
        else:
            print("   ⚠ Nenhuma categoria encontrada")
        
        print("\n=== Teste dos Schemas Concluído ===")
        
    except Exception as e:
        print(f"Erro geral: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_pydantic_schemas()