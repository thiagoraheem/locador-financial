#!/usr/bin/env python3
"""
Teste para verificar se a correção do modelo Favorecido resolveu o erro de coluna 'NomFavorecido'
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db
from app.models.favorecido import Favorecido
from app.models.lancamento import Lancamento
from sqlalchemy import func

def test_favorecido_query():
    """Testa a consulta que estava falhando anteriormente"""
    
    db = next(get_db())
    
    try:
        print("=== Testando consulta corrigida do Favorecido ===")
        
        # Teste 1: Consulta simples de favorecidos
        print("\n1. Consultando favorecidos:")
        favorecidos = db.query(Favorecido).limit(5).all()
        print(f"   Total de favorecidos encontrados: {len(favorecidos)}")
        
        for fav in favorecidos:
            print(f"   ID: {fav.CodFavorecido}, Nome: {fav.DesFavorecido}")
        
        # Teste 2: Consulta que estava falhando (top favorecidos por valor)
        print("\n2. Testando consulta de top favorecidos por valor:")
        query = db.query(
            Favorecido.DesFavorecido,
            func.sum(Lancamento.Valor).label('total')
        ).join(
            Lancamento, Lancamento.CodFavorecido == Favorecido.CodFavorecido
        ).filter(
            Lancamento.IndMov == True,
            Lancamento.FlgConfirmacao == True
        ).group_by(
            Favorecido.DesFavorecido
        ).order_by(
            func.sum(Lancamento.Valor).desc()
        ).limit(5)
        
        results = query.all()
        print(f"   Resultados encontrados: {len(results)}")
        
        for result in results:
            print(f"   Favorecido: {result.DesFavorecido}, Total: {result.total}")
        
        print("\n=== Teste concluído com sucesso ===")
        
    except Exception as e:
        print(f"Erro durante o teste: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_favorecido_query()