#!/usr/bin/env python3
"""
Script para testar os modelos atualizados
"""

from app.core.database import SessionLocal
from app.models.funcionario import TblFuncionarios
from app.models.favorecido import Favorecido
from app.models.banco import Banco
from app.models.categoria import Categoria

def test_models():
    """Testa os modelos atualizados"""
    db = SessionLocal()
    
    try:
        print("=== Testando Modelos Atualizados ===")
        
        # Teste modelo TblFuncionarios
        print("\n1. Testando modelo TblFuncionarios...")
        funcionario = db.query(TblFuncionarios).first()
        if funcionario:
            print(f"   ✓ Funcionário encontrado: {funcionario.Nome} (ID: {funcionario.CodFuncionario})")
        else:
            print("   ⚠ Nenhum funcionário encontrado")
        
        # Teste modelo Favorecido
        print("\n2. Testando modelo Favorecido...")
        favorecido = db.query(Favorecido).first()
        if favorecido:
            print(f"   ✓ Favorecido encontrado: {favorecido.DesFavorecido} (ID: {favorecido.CodFavorecido})")
        else:
            print("   ⚠ Nenhum favorecido encontrado")
        
        # Teste modelo Banco
        print("\n3. Testando modelo Banco...")
        banco = db.query(Banco).first()
        if banco:
            print(f"   ✓ Banco encontrado: {banco.Nome} (Código: {banco.Codigo})")
        else:
            print("   ⚠ Nenhum banco encontrado")
        
        # Teste modelo Categoria
        print("\n4. Testando modelo Categoria...")
        categoria = db.query(Categoria).first()
        if categoria:
            print(f"   ✓ Categoria encontrada: {categoria.DesCategoria} (ID: {categoria.CodCategoria})")
        else:
            print("   ⚠ Nenhuma categoria encontrada")
        
        print("\n=== Teste dos Modelos Concluído ===")
        
    except Exception as e:
        print(f"❌ Erro durante o teste: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_models()