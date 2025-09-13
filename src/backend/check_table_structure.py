#!/usr/bin/env python3
"""
Script para verificar a estrutura das tabelas e campos problemáticos
"""

from app.core.database import engine
import sqlalchemy

def check_table_exists(table_name):
    """Verifica se uma tabela existe"""
    try:
        with engine.connect() as conn:
            result = conn.execute(sqlalchemy.text(
                f"SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '{table_name}'"
            ))
            exists = result.scalar() > 0
            return exists
    except Exception as e:
        print(f"Erro ao verificar tabela {table_name}: {e}")
        return False

def check_table_columns(table_name):
    """Verifica as colunas de uma tabela"""
    try:
        with engine.connect() as conn:
            result = conn.execute(sqlalchemy.text(
                f"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{table_name}' ORDER BY ORDINAL_POSITION"
            ))
            columns = [row[0] for row in result]
            return columns
    except Exception as e:
        print(f"Erro ao verificar tabela {table_name}: {e}")
        return []

if __name__ == "__main__":
    print("=== VERIFICAÇÃO COMPLETA DE TABELAS E RELACIONAMENTOS ===\n")
    
    # Tabelas referenciadas nos ForeignKeys dos modelos
    foreign_key_tables = [
        'tbl_CostCenters',  # Referenciada em AccountsPayable e AccountsReceivable
        'tbl_ChartOfAccounts',  # Referenciada em AccountsPayable e AccountsReceivable
        'tbl_AccountsReceivableDocumentType',  # Referenciada em AccountsReceivable
        'tbl_FINCategorias',  # Referenciada em Lancamento e Categoria
        'tbl_FINFavorecido',  # Referenciada em vários modelos
        'tbl_Conta',  # Referenciada em vários modelos
        'tbl_FINFormaPagamento',  # Referenciada em vários modelos
        'tbl_Funcionarios',  # Referenciada em mixins
        'tbl_Empresa',  # Referenciada em Conta
        'tbl_Banco',  # Referenciada em Conta
        'tbl_AccountsPayable',  # Tabela principal
        'tbl_AccountsReceivable',  # Tabela principal
        'tbl_FINLancamentos'  # Tabela principal
    ]
    
    print("VERIFICANDO EXISTÊNCIA DE TABELAS REFERENCIADAS:\n")
    
    missing_tables = []
    existing_tables = []
    
    for table in foreign_key_tables:
        exists = check_table_exists(table)
        status = "✓ EXISTE" if exists else "✗ NÃO EXISTE"
        print(f"Tabela {table}: {status}")
        
        if exists:
            existing_tables.append(table)
        else:
            missing_tables.append(table)
    
    if missing_tables:
        print(f"\n⚠️  TABELAS FALTANDO ({len(missing_tables)}):")
        for table in missing_tables:
            print(f"   - {table}")
        print("\n❌ PROBLEMAS IDENTIFICADOS:")
        print("   - ForeignKeys referenciam tabelas inexistentes")
        print("   - Isso causa erros de integridade referencial")
        print("   - Modelos precisam ser corrigidos")
    
    print("\n=== VERIFICAÇÃO DE CAMPOS ESPECÍFICOS ===\n")
    
    # Verificar campos específicos em tabelas existentes
    field_checks = [
        ('tbl_CostCenters', 'IdCostCenter'),
        ('tbl_ChartOfAccounts', 'IdChartOfAccounts'),
        ('tbl_AccountsReceivableDocumentType', 'IdDocumentType'),
        ('tbl_FINCategorias', 'CodCategoria'),
        ('tbl_FINFavorecido', 'CodFavorecido'),
        ('tbl_Conta', 'idConta'),
        ('tbl_FINFormaPagamento', 'CodFormaPagto'),
        ('tbl_Funcionarios', 'CodFuncionario'),
        ('tbl_Empresa', 'CodEmpresa'),
        ('tbl_Banco', 'Codigo')
    ]
    
    for table_name, field_name in field_checks:
        if table_name in existing_tables:
            columns = check_table_columns(table_name)
            if field_name in columns:
                print(f"✓ {table_name}.{field_name} EXISTE")
            else:
                print(f"✗ {table_name}.{field_name} NÃO EXISTE")
                print(f"   Colunas disponíveis: {', '.join(columns[:5])}{'...' if len(columns) > 5 else ''}")
        else:
            print(f"⚠️  {table_name}.{field_name} - TABELA NÃO EXISTE")
    
    print("\n=== RESUMO DOS PROBLEMAS ===\n")
    
    if missing_tables:
        print("❌ AÇÃO NECESSÁRIA:")
        print("   1. Remover ForeignKeys que referenciam tabelas inexistentes")
        print("   2. Ou criar as tabelas faltando no banco de dados")
        print("   3. Verificar se os nomes das tabelas estão corretos")
    else:
        print("✅ Todas as tabelas referenciadas existem no banco de dados")