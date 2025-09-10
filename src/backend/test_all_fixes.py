#!/usr/bin/env python3
"""
Teste abrangente para verificar se todas as correções foram aplicadas corretamente
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db
from app.models.lancamento import Lancamento
from app.models.favorecido import Favorecido
from app.models.categoria import Categoria
from sqlalchemy import func, and_
from sqlalchemy.orm import Session

def test_indmov_boolean_queries():
    """Testa consultas com IndMov usando valores booleanos"""
    print("=== Testando consultas com IndMov (boolean) ===")
    
    db = next(get_db())
    
    try:
        # Teste 1: Consulta com IndMov = True (entrada)
        print("\n1. Testando IndMov = True (entradas)...")
        entradas = db.query(Lancamento).filter(
            and_(
                Lancamento.IndMov == True,
                Lancamento.FlgConfirmacao == True
            )
        ).limit(5).all()
        print(f"   ✓ Encontradas {len(entradas)} entradas confirmadas")
        
        # Teste 2: Consulta com IndMov = False (saída)
        print("\n2. Testando IndMov = False (saídas)...")
        saidas = db.query(Lancamento).filter(
            and_(
                Lancamento.IndMov == False,
                Lancamento.FlgConfirmacao == True
            )
        ).limit(5).all()
        print(f"   ✓ Encontradas {len(saidas)} saídas confirmadas")
        
        # Teste 3: Top favorecidos por entradas
        print("\n3. Testando top favorecidos por entradas...")
        top_entradas = db.query(
            Favorecido.DesFavorecido,
            func.sum(Lancamento.Valor).label('total')
        ).join(
            Lancamento, Lancamento.CodFavorecido == Favorecido.CodFavorecido
        ).filter(
            and_(
                Lancamento.IndMov == True,  # Entradas
                Lancamento.FlgConfirmacao == True
            )
        ).group_by(
            Favorecido.DesFavorecido
        ).order_by(
            func.sum(Lancamento.Valor).desc()
        ).limit(3).all()
        
        print(f"   ✓ Top 3 favorecidos por entradas:")
        for fav in top_entradas:
            print(f"     - {fav.DesFavorecido}: R$ {fav.total:,.2f}")
        
        # Teste 4: Top favorecidos por saídas
        print("\n4. Testando top favorecidos por saídas...")
        top_saidas = db.query(
            Favorecido.DesFavorecido,
            func.sum(Lancamento.Valor).label('total')
        ).join(
            Lancamento, Lancamento.CodFavorecido == Favorecido.CodFavorecido
        ).filter(
            and_(
                Lancamento.IndMov == False,  # Saídas
                Lancamento.FlgConfirmacao == True
            )
        ).group_by(
            Favorecido.DesFavorecido
        ).order_by(
            func.sum(Lancamento.Valor).desc()
        ).limit(3).all()
        
        print(f"   ✓ Top 3 favorecidos por saídas:")
        for fav in top_saidas:
            print(f"     - {fav.DesFavorecido}: R$ {fav.total:,.2f}")
            
        return True
        
    except Exception as e:
        print(f"   ✗ Erro: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

def test_categoria_queries():
    """Testa consultas com o campo DesCategoria"""
    print("\n=== Testando consultas com DesCategoria ===")
    
    db = next(get_db())
    
    try:
        # Teste 1: Listar categorias
        print("\n1. Testando listagem de categorias...")
        categorias = db.query(Categoria).limit(5).all()
        print(f"   ✓ Encontradas {len(categorias)} categorias")
        for cat in categorias:
            print(f"     - {cat.CodCategoria}: {cat.DesCategoria}")
        
        # Teste 2: Consulta com join categoria + lançamento
        print("\n2. Testando join categoria + lançamento...")
        categoria_totais = db.query(
            Categoria.DesCategoria,
            func.sum(Lancamento.Valor).label('total')
        ).join(
            Lancamento, Lancamento.CodCategoria == Categoria.CodCategoria
        ).filter(
            Lancamento.FlgConfirmacao == True
        ).group_by(
            Categoria.DesCategoria
        ).order_by(
            func.sum(Lancamento.Valor).desc()
        ).limit(5).all()
        
        print(f"   ✓ Top 5 categorias por valor:")
        for cat in categoria_totais:
            print(f"     - {cat.DesCategoria}: R$ {cat.total:,.2f}")
            
        return True
        
    except Exception as e:
        print(f"   ✗ Erro: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

def test_dashboard_queries():
    """Testa as consultas do dashboard que estavam falhando"""
    print("\n=== Testando consultas do dashboard ===")
    
    db = next(get_db())
    
    try:
        # Simulando a consulta que estava falhando no dashboard
        print("\n1. Testando consulta de favorecidos (simulando dashboard)...")
        
        # Query similar à do dashboard_service.py
        query_entradas = db.query(
            Favorecido.DesFavorecido,
            func.sum(Lancamento.Valor).label('total')
        ).join(
            Lancamento, Lancamento.CodFavorecido == Favorecido.CodFavorecido
        ).filter(
            and_(
                Lancamento.IndMov == True,  # Usando boolean em vez de 'E'
                Lancamento.FlgConfirmacao == True  # Usando boolean em vez de 1
            )
        ).group_by(
            Favorecido.DesFavorecido
        ).order_by(
            func.sum(Lancamento.Valor).desc()
        ).limit(5)
        
        resultados = query_entradas.all()
        print(f"   ✓ Consulta de entradas executada com sucesso: {len(resultados)} resultados")
        
        # Query de saídas
        query_saidas = db.query(
            Favorecido.DesFavorecido,
            func.sum(Lancamento.Valor).label('total')
        ).join(
            Lancamento, Lancamento.CodFavorecido == Favorecido.CodFavorecido
        ).filter(
            and_(
                Lancamento.IndMov == False,  # Usando boolean em vez de 'S'
                Lancamento.FlgConfirmacao == True  # Usando boolean em vez de 1
            )
        ).group_by(
            Favorecido.DesFavorecido
        ).order_by(
            func.sum(Lancamento.Valor).desc()
        ).limit(5)
        
        resultados_saidas = query_saidas.all()
        print(f"   ✓ Consulta de saídas executada com sucesso: {len(resultados_saidas)} resultados")
        
        return True
        
    except Exception as e:
        print(f"   ✗ Erro: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

def main():
    """Executa todos os testes"""
    print("🔧 TESTE ABRANGENTE DAS CORREÇÕES")
    print("=" * 50)
    
    tests = [
        ("IndMov Boolean Queries", test_indmov_boolean_queries),
        ("Categoria Queries", test_categoria_queries),
        ("Dashboard Queries", test_dashboard_queries)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n🧪 Executando: {test_name}")
        try:
            success = test_func()
            results.append((test_name, success))
        except Exception as e:
            print(f"   ✗ Falha crítica: {e}")
            results.append((test_name, False))
    
    # Resumo final
    print("\n" + "=" * 50)
    print("📊 RESUMO DOS TESTES")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, success in results:
        status = "✅ PASSOU" if success else "❌ FALHOU"
        print(f"{status} - {test_name}")
        if success:
            passed += 1
    
    print(f"\n🎯 Resultado: {passed}/{total} testes passaram")
    
    if passed == total:
        print("\n🎉 TODAS AS CORREÇÕES FUNCIONARAM CORRETAMENTE!")
        return True
    else:
        print(f"\n⚠️  {total - passed} teste(s) ainda apresentam problemas")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)