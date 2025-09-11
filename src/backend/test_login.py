import requests
import json

def test_login():
    url = "http://localhost:8001/api/v1/auth/login"
    data = {
        "login": "admin",
        "senha": "123456"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login endpoint funcionando corretamente!")
        else:
            print("❌ Erro no endpoint de login")
            
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")

if __name__ == "__main__":
    test_login()