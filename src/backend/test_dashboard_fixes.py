#!/usr/bin/env python3
"""
Teste para verificar se as correções nos endpoints de dashboard resolveram os erros de conversão
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db
from app.services.dashboard_service import DashboardService

def test_dashboard_endpoints():
    """Testa os métodos do dashboard service com parâmetros boolean corretos"""
    
    db = next(get_db())
    service = DashboardService(db)
    
    try:
        print("=== Testando Dashboard Service ===\n")
        
        # Test 1: Category summary with boolean parameters
        print("1. Testando get_category_summary com tipo=True (Receitas)...")
        try:
            result = service.get_category_summary(tipo=True, empresa_id=None)
            print(f"   ✓ Sucesso: {len(result)} categorias encontradas")
        except Exception as e:
            print(f"   ✗ Erro: {e}")
        
        print("\n2. Testando get_category_summary com tipo=False (Despesas)...")
        try:
            result = service.get_category_summary(tipo=False, empresa_id=None)
            print(f"   ✓ Sucesso: {len(result)} categorias encontradas")
        except Exception as e:
            print(f"   ✗ Erro: {e}")
        
        # Test 2: Top favorecidos with boolean parameters
        print("\n3. Testando get_top_favorecidos com tipo=True (Receitas)...")
        try:
            result = service.get_top_favorecidos(tipo=True, limit=5, empresa_id=None)
            print(f"   ✓ Sucesso: {len(result)} favorecidos encontrados")
        except Exception as e:
            print(f"   ✗ Erro: {e}")
        
        print("\n4. Testando get_top_favorecidos com tipo=False (Despesas)...")
        try:
            result = service.get_top_favorecidos(tipo=False, limit=5, empresa_id=None)
            print(f"   ✓ Sucesso: {len(result)} favorecidos encontrados")
        except Exception as e:
            print(f"   ✗ Erro: {e}")
        
        # Test 3: String to boolean conversion (simulating endpoint logic)
        print("\n5. Testando conversão de string para boolean...")
        
        # Test E -> True
        tipo_str = 'E'
        tipo_bool = tipo_str.upper() == 'E'
        print(f"   'E' -> {tipo_bool} (deve ser True)")
        
        # Test S -> False
        tipo_str = 'S'
        tipo_bool = tipo_str.upper() == 'E'
        print(f"   'S' -> {tipo_bool} (deve ser False)")
        
        print("\n=== Todos os testes concluídos ===")
        
    except Exception as e:
        print(f"Erro geral: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_dashboard_endpoints()