#!/usr/bin/env python3
"""
Script de teste para validar todos os modelos após correções
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src', 'backend'))

def test_model_imports():
    """Testa se todos os modelos podem ser importados sem erro"""
    print("=== Testando importações dos modelos ===")
    
    try:
        from app.models.categoria import Categoria
        print("✓ Categoria importado com sucesso")
    except Exception as e:
        print(f"✗ Erro ao importar Categoria: {e}")
        return False
    
    try:
        from app.models.cliente import Cliente
        print("✓ Cliente importado com sucesso")
    except Exception as e:
        print(f"✗ Erro ao importar Cliente: {e}")
        return False
    
    try:
        from app.models.favorecido import Favorecido
        print("✓ Favorecido importado com sucesso")
    except Exception as e:
        print(f"✗ Erro ao importar Favorecido: {e}")
        return False
    
    try:
        from app.models.lancamento import Lancamento
        print("✓ Lancamento importado com sucesso")
    except Exception as e:
        print(f"✗ Erro ao importar Lancamento: {e}")
        return False
    
    try:
        from app.models.accounts_payable import AccountsPayable
        print("✓ AccountsPayable importado com sucesso")
    except Exception as e:
        print(f"✗ Erro ao importar AccountsPayable: {e}")
        return False
    
    try:
        from app.models.accounts_receivable import AccountsReceivable
        print("✓ AccountsReceivable importado com sucesso")
    except Exception as e:
        print(f"✗ Erro ao importar AccountsReceivable: {e}")
        return False
    
    try:
        from app.models.banco import Banco
        print("✓ Banco importado com sucesso")
    except Exception as e:
        print(f"✗ Erro ao importar Banco: {e}")
        return False
    
    try:
        from app.models.conta import Conta
        print("✓ Conta importado com sucesso")
    except Exception as e:
        print(f"✗ Erro ao importar Conta: {e}")
        return False
    
    try:
        from app.models.funcionario import TblFuncionarios
        print("✓ TblFuncionarios importado com sucesso")
    except Exception as e:
        print(f"✗ Erro ao importar TblFuncionarios: {e}")
        return False
    
    return True

def test_model_structure():
    """Testa a estrutura básica dos modelos"""
    print("\n=== Testando estrutura dos modelos ===")
    
    try:
        from app.models.categoria import Categoria
        
        # Verifica se os campos principais existem
        assert hasattr(Categoria, 'CodCategoria'), "Campo CodCategoria não encontrado"
        assert hasattr(Categoria, 'DesCategoria'), "Campo DesCategoria não encontrado"
        assert hasattr(Categoria, 'FlgAtivo'), "Campo FlgAtivo não encontrado"
        assert hasattr(Categoria, 'flg_tipo'), "Campo flg_tipo não encontrado"
        
        print("✓ Estrutura do modelo Categoria validada")
        
    except Exception as e:
        print(f"✗ Erro na estrutura do modelo Categoria: {e}")
        return False
    
    try:
        from app.models.cliente import Cliente
        
        # Verifica se os campos principais existem
        assert hasattr(Cliente, 'CodCliente'), "Campo CodCliente não encontrado"
        assert hasattr(Cliente, 'DesCliente'), "Campo DesCliente não encontrado"
        assert hasattr(Cliente, 'FlgTipoPessoa'), "Campo FlgTipoPessoa não encontrado"
        
        print("✓ Estrutura do modelo Cliente validada")
        
    except Exception as e:
        print(f"✗ Erro na estrutura do modelo Cliente: {e}")
        return False
    
    return True

def test_relationships():
    """Testa se os relacionamentos estão configurados corretamente"""
    print("\n=== Testando relacionamentos ===")
    
    try:
        from app.models.categoria import Categoria
        from app.models.lancamento import Lancamento
        
        # Verifica se o relacionamento existe
        assert hasattr(Categoria, 'lancamentos'), "Relacionamento lancamentos não encontrado em Categoria"
        assert hasattr(Lancamento, 'categoria'), "Relacionamento categoria não encontrado em Lancamento"
        
        print("✓ Relacionamento Categoria <-> Lancamento validado")
        
    except Exception as e:
        print(f"✗ Erro no relacionamento Categoria <-> Lancamento: {e}")
        return False
    
    try:
        from app.models.cliente import Cliente
        from app.models.accounts_receivable import AccountsReceivable
        
        # Verifica se o relacionamento existe
        assert hasattr(Cliente, 'contas_receber'), "Relacionamento contas_receber não encontrado em Cliente"
        assert hasattr(AccountsReceivable, 'cliente'), "Relacionamento cliente não encontrado em AccountsReceivable"
        
        print("✓ Relacionamento Cliente <-> AccountsReceivable validado")
        
    except Exception as e:
        print(f"✗ Erro no relacionamento Cliente <-> AccountsReceivable: {e}")
        return False
    
    return True

def main():
    """Função principal de teste"""
    print("Iniciando testes dos modelos...\n")
    
    success = True
    
    # Teste de importações
    if not test_model_imports():
        success = False
    
    # Teste de estrutura
    if not test_model_structure():
        success = False
    
    # Teste de relacionamentos
    if not test_relationships():
        success = False
    
    print("\n=== Resultado dos testes ===")
    if success:
        print("✓ Todos os testes passaram com sucesso!")
        return 0
    else:
        print("✗ Alguns testes falharam. Verifique os erros acima.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)