#!/usr/bin/env python3
"""
Script para engenharia reversa do banco de dados
Lista todas as tabelas e suas estruturas do SQL Server
"""

import pyodbc
from typing import Dict, List, Any
import os
try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(path):
        pass  # Fallback se python-dotenv não estiver instalado

# Carregar variáveis de ambiente
load_dotenv('src/backend/.env')

def connect_to_database():
    """Conecta ao banco de dados SQL Server"""
    try:
        # Configuração da conexão
        server = '54.232.194.197,1433'
        database = 'LocadorFinanceiro'
        username = 'financeiro'
        password = 'BlomaqFinanceiro$'
        
        # String de conexão
        conn_str = (
            f'DRIVER={{ODBC Driver 17 for SQL Server}};'
            f'SERVER={server};'
            f'DATABASE={database};'
            f'UID={username};'
            f'PWD={password};'
            f'TrustServerCertificate=yes;'
            f'timeout=60'
        )
        
        connection = pyodbc.connect(conn_str)
        print(f"✅ Conectado ao banco de dados: {database}")
        return connection
        
    except Exception as e:
        print(f"❌ Erro ao conectar ao banco: {e}")
        return None

def get_all_tables(connection) -> List[str]:
    """Lista todas as tabelas do banco de dados"""
    query = """
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_TYPE = 'BASE TABLE'
    AND TABLE_SCHEMA = 'dbo'
    ORDER BY TABLE_NAME
    """
    
    cursor = connection.cursor()
    cursor.execute(query)
    tables = [row[0] for row in cursor.fetchall()]
    cursor.close()
    
    return tables

def get_table_structure(connection, table_name: str) -> List[Dict[str, Any]]:
    """Obtém a estrutura detalhada de uma tabela"""
    query = """
    SELECT 
        c.COLUMN_NAME,
        c.DATA_TYPE,
        c.CHARACTER_MAXIMUM_LENGTH,
        c.NUMERIC_PRECISION,
        c.NUMERIC_SCALE,
        c.IS_NULLABLE,
        c.COLUMN_DEFAULT,
        CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 'YES' ELSE 'NO' END AS IS_PRIMARY_KEY,
        CASE WHEN fk.COLUMN_NAME IS NOT NULL THEN 'YES' ELSE 'NO' END AS IS_FOREIGN_KEY,
        fk.REFERENCED_TABLE_NAME,
        fk.REFERENCED_COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS c
    LEFT JOIN (
        SELECT ku.TABLE_NAME, ku.COLUMN_NAME
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
        INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku
            ON tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
        WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
    ) pk ON c.TABLE_NAME = pk.TABLE_NAME AND c.COLUMN_NAME = pk.COLUMN_NAME
    LEFT JOIN (
        SELECT 
            ku.TABLE_NAME,
            ku.COLUMN_NAME,
            ku2.TABLE_NAME AS REFERENCED_TABLE_NAME,
            ku2.COLUMN_NAME AS REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
        INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku
            ON rc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
        INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku2
            ON rc.UNIQUE_CONSTRAINT_NAME = ku2.CONSTRAINT_NAME
    ) fk ON c.TABLE_NAME = fk.TABLE_NAME AND c.COLUMN_NAME = fk.COLUMN_NAME
    WHERE c.TABLE_NAME = ?
    ORDER BY c.ORDINAL_POSITION
    """
    
    cursor = connection.cursor()
    cursor.execute(query, table_name)
    
    columns = []
    for row in cursor.fetchall():
        column_info = {
            'column_name': row[0],
            'data_type': row[1],
            'max_length': row[2],
            'precision': row[3],
            'scale': row[4],
            'is_nullable': row[5],
            'default_value': row[6],
            'is_primary_key': row[7],
            'is_foreign_key': row[8],
            'referenced_table': row[9],
            'referenced_column': row[10]
        }
        columns.append(column_info)
    
    cursor.close()
    return columns

def analyze_database():
    """Função principal para análise do banco de dados"""
    print("🔍 Iniciando engenharia reversa do banco de dados...")
    
    # Conectar ao banco
    conn = connect_to_database()
    if not conn:
        return
    
    try:
        # Listar todas as tabelas
        print("\n📋 Listando todas as tabelas...")
        tables = get_all_tables(conn)
        print(f"Encontradas {len(tables)} tabelas:")
        
        for i, table in enumerate(tables, 1):
            print(f"{i:2d}. {table}")
        
        # Analisar estrutura de cada tabela
        print("\n🔍 Analisando estrutura das tabelas...")
        
        all_structures = {}
        
        for table in tables:
            print(f"\n📊 Analisando tabela: {table}")
            structure = get_table_structure(conn, table)
            all_structures[table] = structure
            
            print(f"   Colunas encontradas: {len(structure)}")
            
            # Mostrar algumas informações importantes
            pk_columns = [col['column_name'] for col in structure if col['is_primary_key'] == 'YES']
            fk_columns = [col['column_name'] for col in structure if col['is_foreign_key'] == 'YES']
            
            if pk_columns:
                print(f"   Chaves primárias: {', '.join(pk_columns)}")
            if fk_columns:
                print(f"   Chaves estrangeiras: {', '.join(fk_columns)}")
        
        # Salvar resultados em arquivo
        print("\n💾 Salvando resultados...")
        save_analysis_results(all_structures)
        
        print("\n✅ Análise concluída com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro durante a análise: {e}")
    
    finally:
        conn.close()
        print("🔌 Conexão com banco de dados fechada.")

def save_analysis_results(structures: Dict[str, List[Dict[str, Any]]]):
    """Salva os resultados da análise em arquivos"""
    
    # Criar diretório de resultados
    results_dir = "database_analysis_results"
    os.makedirs(results_dir, exist_ok=True)
    
    # Salvar estrutura completa em texto
    with open(f"{results_dir}/database_structure.txt", "w", encoding="utf-8") as f:
        f.write("ESTRUTURA COMPLETA DO BANCO DE DADOS\n")
        f.write("=" * 50 + "\n\n")
        
        for table_name, columns in structures.items():
            f.write(f"TABELA: {table_name}\n")
            f.write("-" * 30 + "\n")
            
            for col in columns:
                f.write(f"  {col['column_name']}:\n")
                f.write(f"    Tipo: {col['data_type']}")
                
                if col['max_length']:
                    f.write(f"({col['max_length']})")
                elif col['precision'] and col['scale']:
                    f.write(f"({col['precision']},{col['scale']})")
                
                f.write(f"\n    Nulo: {col['is_nullable']}")
                f.write(f"\n    PK: {col['is_primary_key']}")
                f.write(f"\n    FK: {col['is_foreign_key']}")
                
                if col['default_value']:
                    f.write(f"\n    Padrão: {col['default_value']}")
                
                if col['referenced_table']:
                    f.write(f"\n    Referencia: {col['referenced_table']}.{col['referenced_column']}")
                
                f.write("\n\n")
            
            f.write("\n")
    
    # Salvar resumo das tabelas
    with open(f"{results_dir}/tables_summary.txt", "w", encoding="utf-8") as f:
        f.write("RESUMO DAS TABELAS\n")
        f.write("=" * 20 + "\n\n")
        
        for table_name, columns in structures.items():
            f.write(f"{table_name}: {len(columns)} colunas\n")
    
    print(f"📁 Resultados salvos em: {results_dir}/")

if __name__ == "__main__":
    analyze_database()