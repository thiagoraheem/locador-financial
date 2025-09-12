import hashlib
import base64

def gera_hash(senha: str) -> str:
    """Gera hash MD5 da senha (compatível com sistema C# atual)"""
    # Encode usando UTF-16 LE (equivalente ao UnicodeEncoding do C#)
    byte_source_text = senha.encode('utf-16le')
    # Gera hash MD5
    byte_hash = hashlib.md5(byte_source_text).digest()
    # Convert para Base64
    return base64.b64encode(byte_hash).decode('ascii')

def test_passwords():
    # Hash encontrado no banco para o admin
    admin_hash = "pvlEY8Yt7vX4gwHu2x2Saw=="
    
    # Senhas comuns para testar
    common_passwords = [
        "admin",
        "123456",
        "password",
        "123",
        "1234",
        "12345",
        "administrador",
        "Admin",
        "ADMIN",
        "admin123",
        "123admin",
        "senha",
        "Senha",
        "SENHA",
        "senha123",
        "123senha",
        "root",
        "toor",
        "master",
        "system",
        "tisimples",
        "locador",
        "financial",
        "blomaq",
        "derzi",
        "bruno",
        "fabrizio",
        "luanna",
        "pvl",
        "PVL",
        "pvlsystem",
        "pvladmin",
        "pvl123",
        "123pvl",
        "pvlEY8Yt7vX4gwHu2x2Saw",
        "",  # senha vazia
        " ",  # espaço
        "a",
        "1",
        "0"
    ]
    
    print(f"Hash do admin no banco: {admin_hash}")
    print("\nTestando senhas comuns...")
    
    for senha in common_passwords:
        hash_gerado = gera_hash(senha)
        if hash_gerado == admin_hash:
            print(f"\n*** SENHA ENCONTRADA: '{senha}' ***")
            print(f"Hash gerado: {hash_gerado}")
            return senha
        else:
            print(f"'{senha}' -> {hash_gerado} (não confere)")
    
    print("\nNenhuma senha comum encontrada.")
    return None

if __name__ == "__main__":
    senha_encontrada = test_passwords()
    if senha_encontrada:
        print(f"\nUse a senha: {senha_encontrada}")
    else:
        print("\nNão foi possível encontrar a senha. Pode ser necessário resetar no banco.")