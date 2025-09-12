import requests

def test_apis():
    # Login
    login_data = {'login': 'admin', 'senha': 'YpP7sPnjw2G/TO5357wt1w=='}
    login_response = requests.post('http://localhost:8000/api/v1/auth/login', json=login_data)
    
    if login_response.status_code == 200:
        token = login_response.json().get('access_token')
        headers = {'Authorization': f'Bearer {token}'}
        
        # Testar diferentes endpoints
        endpoints = [
            '/api/v1/contas/',
            '/api/v1/bancos/',
            '/api/v1/empresas/',
            '/api/v1/clientes/'
        ]
        
        for endpoint in endpoints:
            try:
                response = requests.get(f'http://localhost:8000{endpoint}', headers=headers)
                print(f'{endpoint}: Status {response.status_code}')
                
                if response.status_code == 200:
                    data = response.json()
                    if data:
                        print(f'  Primeiro item: {str(data[0])[:200]}...')
                    else:
                        print('  Lista vazia')
                elif response.status_code != 200:
                    print(f'  Erro: {response.text[:100]}')
                    
            except Exception as e:
                print(f'{endpoint}: Erro - {str(e)}')
                
    else:
        print(f'Login falhou: {login_response.status_code}')

if __name__ == '__main__':
    test_apis()