import pyodbc

conn = pyodbc.connect('DRIVER={ODBC Driver 17 for SQL Server};SERVER=54.232.194.197,1433;DATABASE=LocadorFinanceiro;UID=financeiro;PWD=BlomaqFinanceiro$;timeout=30')
cursor = conn.cursor()

# Check FlgLiberado column type
cursor.execute("SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'tbl_Clientes' AND COLUMN_NAME = 'FlgLiberado'")
result = cursor.fetchall()
print("FlgLiberado column info:", result)

# Check actual values in FlgLiberado
cursor.execute("SELECT DISTINCT FlgLiberado FROM tbl_Clientes")
values = cursor.fetchall()
print("Distinct FlgLiberado values:", values)

conn.close()