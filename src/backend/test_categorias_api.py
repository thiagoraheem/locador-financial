import requests

# Fazer login
login_data = {'login': 'admin', 'senha': 'YpP7sPnjw2G/TO5357wt1w=='}
login_response = requests.post('http://localhost:8000/api/v1/auth/login', json=login_data)
print('Login Status:', login_response.status_code)

if login_response.status_code == 200:
    token = login_response.json().get('access_token')
    print('Token obtained:', bool(token))
    
    if token:
        headers = {'Authorization': f'Bearer {token}'}
        
        # Testar API de categorias (incluindo inativas)
        cat_response = requests.get('http://localhost:8000/api/v1/categorias/?ativas_apenas=false', headers=headers)
        print('Categorias Status:', cat_response.status_code)
        
        if cat_response.status_code == 200:
            data = cat_response.json()
            print('Response length:', len(data))
            if data:
                print('First category:', data[0])
                # Verificar se os campos FlgAtivo e subcategorias estão corretos
                for cat in data[:3]:  # Verificar apenas as primeiras 3
                    print(f"Categoria: {cat.get('DesCategoria')}")
                    print(f"  FlgAtivo: {cat.get('FlgAtivo')} (type: {type(cat.get('FlgAtivo'))})")
                    print(f"  subcategorias: {type(cat.get('subcategorias'))} with {len(cat.get('subcategorias', []))} items")
        else:
            print('Error response:', cat_response.text)
else:
    print('Login failed:', login_response.text)