import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.core.config import settings

def find_auth_tables():
    try:
        # Get database URL from settings
        db_url = settings.DATABASE_URI
        print(f"Connecting to database...")
        
        # Create engine and session
        engine = create_engine(db_url)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        with SessionLocal() as session:
            # Look for tables that might be used for authentication
            print("\nSearching for authentication-related tables...")
            
            # Search for tables with specific patterns
            auth_patterns = [
                "SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%SEG%' AND table_schema = 'dbo'",
                "SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%Usuario%' AND table_schema = 'dbo'",
                "SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%User%' AND table_schema = 'dbo'",
                "SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%Auth%' AND table_schema = 'dbo'",
                "SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%Login%' AND table_schema = 'dbo'"
            ]
            
            found_tables = set()
            
            for pattern in auth_patterns:
                result = session.execute(text(pattern))
                tables = result.fetchall()
                for table in tables:
                    found_tables.add(table[0])
            
            print(f"Found {len(found_tables)} potential authentication tables:")
            for table in sorted(found_tables):
                print(f"- {table}")
            
            # Check each table for structure and data
            for table_name in sorted(found_tables):
                print(f"\n=== {table_name} ===")
                try:
                    # Get column information
                    result = session.execute(text(f"""
                        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
                        FROM INFORMATION_SCHEMA.COLUMNS 
                        WHERE TABLE_NAME = '{table_name}'
                        ORDER BY ORDINAL_POSITION
                    """))
                    
                    columns = result.fetchall()
                    print("Columns:")
                    for col in columns:
                        length = f"({col[3]})" if col[3] else ""
                        nullable = "NULL" if col[2] == 'YES' else "NOT NULL"
                        print(f"  - {col[0]}: {col[1]}{length} {nullable}")
                    
                    # Get record count
                    result = session.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
                    count = result.scalar()
                    print(f"Records: {count}")
                    
                    # Show sample data if reasonable amount
                    if count > 0 and count <= 10:
                        result = session.execute(text(f"SELECT TOP 3 * FROM {table_name}"))
                        records = result.fetchall()
                        print("Sample records:")
                        for i, record in enumerate(records, 1):
                            print(f"  Record {i}:")
                            record_dict = dict(record._mapping)
                            for key, value in record_dict.items():
                                print(f"    {key}: {value}")
                    elif count > 10:
                        print("(Too many records to display sample)")
                        
                except Exception as e:
                    print(f"Error accessing {table_name}: {e}")
            
            # Also check for any table with login/senha columns specifically
            print("\n=== Tables with login/senha columns ===")
            result = session.execute(text("""
                SELECT DISTINCT c.TABLE_NAME, c.COLUMN_NAME, c.DATA_TYPE
                FROM INFORMATION_SCHEMA.COLUMNS c
                WHERE c.TABLE_SCHEMA = 'dbo'
                AND (c.COLUMN_NAME LIKE '%login%' OR c.COLUMN_NAME LIKE '%senha%')
                ORDER BY c.TABLE_NAME, c.COLUMN_NAME
            """))
            
            login_columns = result.fetchall()
            current_table = None
            for col in login_columns:
                if col[0] != current_table:
                    current_table = col[0]
                    print(f"\nTable: {current_table}")
                print(f"  - {col[1]} ({col[2]})")
                    
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_auth_tables()