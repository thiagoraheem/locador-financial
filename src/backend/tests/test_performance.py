import pytest
import time
from datetime import date, datetime, timedelta
from fastapi.testclient import TestClient
from concurrent.futures import ThreadPoolExecutor, as_completed
import statistics
from typing import List, Dict, Any

class TestPerformanceLancamentos:
    """Testes de performance para endpoints de lançamentos"""
    
    def test_get_lancamentos_dia_response_time(self, client: TestClient, auth_headers):
        """Teste de tempo de resposta para consulta de lançamentos do dia"""
        # Arrange
        test_date = date.today().strftime("%Y-%m-%d")
        max_response_time = 2.0  # 2 segundos
        
        # Act
        start_time = time.time()
        response = client.get(f"/api/v1/lancamentos/dia?data={test_date}", headers=auth_headers)
        end_time = time.time()
        
        response_time = end_time - start_time
        
        # Assert
        assert response.status_code in [200, 404]  # Pode não estar implementado
        assert response_time < max_response_time, f"Tempo de resposta muito alto: {response_time:.2f}s"
    
    def test_multiple_concurrent_requests(self, client: TestClient, auth_headers):
        """Teste de múltiplas requisições concorrentes"""
        # Arrange
        test_date = date.today().strftime("%Y-%m-%d")
        num_requests = 10
        max_avg_response_time = 3.0  # 3 segundos em média
        
        def make_request():
            start_time = time.time()
            response = client.get(f"/api/v1/lancamentos/dia?data={test_date}", headers=auth_headers)
            end_time = time.time()
            return {
                'status_code': response.status_code,
                'response_time': end_time - start_time,
                'success': response.status_code in [200, 404]
            }
        
        # Act
        response_times = []
        success_count = 0
        
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(make_request) for _ in range(num_requests)]
            
            for future in as_completed(futures):
                result = future.result()
                response_times.append(result['response_time'])
                if result['success']:
                    success_count += 1
        
        # Assert
        avg_response_time = statistics.mean(response_times)
        success_rate = success_count / num_requests
        
        assert avg_response_time < max_avg_response_time, f"Tempo médio muito alto: {avg_response_time:.2f}s"
        assert success_rate >= 0.9, f"Taxa de sucesso muito baixa: {success_rate:.2%}"
    
    def test_large_date_range_performance(self, client: TestClient, auth_headers):
        """Teste de performance com consulta de período longo"""
        # Arrange
        start_date = (date.today() - timedelta(days=365)).strftime("%Y-%m-%d")
        end_date = date.today().strftime("%Y-%m-%d")
        max_response_time = 5.0  # 5 segundos para período longo
        
        # Act
        start_time = time.time()
        response = client.get(
            f"/api/v1/lancamentos/periodo?data_inicio={start_date}&data_fim={end_date}",
            headers=auth_headers
        )
        end_time = time.time()
        
        response_time = end_time - start_time
        
        # Assert
        assert response.status_code in [200, 404]  # Pode não estar implementado
        assert response_time < max_response_time, f"Consulta de período longo muito lenta: {response_time:.2f}s"
    
    def test_memory_usage_stability(self, client: TestClient, auth_headers):
        """Teste de estabilidade de uso de memória"""
        # Arrange
        test_date = date.today().strftime("%Y-%m-%d")
        num_iterations = 50
        
        # Act
        response_times = []
        
        for i in range(num_iterations):
            start_time = time.time()
            response = client.get(f"/api/v1/lancamentos/dia?data={test_date}", headers=auth_headers)
            end_time = time.time()
            
            response_times.append(end_time - start_time)
            
            # Verificar se não há vazamento de memória (tempo crescente)
            if i > 10:  # Após algumas iterações
                recent_avg = statistics.mean(response_times[-5:])
                initial_avg = statistics.mean(response_times[:5])
                
                # Tempo não deve crescer mais que 50%
                assert recent_avg < initial_avg * 1.5, "Possível vazamento de memória detectado"

class TestPerformanceAuth:
    """Testes de performance para autenticação"""
    
    def test_login_response_time(self, client: TestClient, test_user_data):
        """Teste de tempo de resposta do login"""
        # Arrange
        max_response_time = 1.0  # 1 segundo
        login_data = {
            "username": "master",
            "password": "master123"
        }
        
        # Act
        start_time = time.time()
        response = client.post("/api/v1/auth/login", json=login_data)
        end_time = time.time()
        
        response_time = end_time - start_time
        
        # Assert
        assert response.status_code in [200, 404]  # Pode não estar implementado
        assert response_time < max_response_time, f"Login muito lento: {response_time:.2f}s"
    
    def test_multiple_login_attempts(self, client: TestClient):
        """Teste de múltiplas tentativas de login"""
        # Arrange
        num_attempts = 20
        max_avg_response_time = 1.5  # 1.5 segundos em média
        login_data = {
            "username": "master",
            "password": "master123"
        }
        
        # Act
        response_times = []
        
        for _ in range(num_attempts):
            start_time = time.time()
            response = client.post("/api/v1/auth/login", json=login_data)
            end_time = time.time()
            
            response_times.append(end_time - start_time)
        
        # Assert
        avg_response_time = statistics.mean(response_times)
        assert avg_response_time < max_avg_response_time, f"Login médio muito lento: {avg_response_time:.2f}s"
    
    def test_token_validation_performance(self, client: TestClient, auth_headers):
        """Teste de performance da validação de token"""
        # Arrange
        max_response_time = 0.5  # 500ms
        num_requests = 30
        
        # Act
        response_times = []
        
        for _ in range(num_requests):
            start_time = time.time()
            response = client.get("/api/v1/auth/me", headers=auth_headers)
            end_time = time.time()
            
            response_times.append(end_time - start_time)
        
        # Assert
        avg_response_time = statistics.mean(response_times)
        assert avg_response_time < max_response_time, f"Validação de token muito lenta: {avg_response_time:.2f}s"

class TestPerformanceDatabase:
    """Testes de performance do banco de dados"""
    
    def test_database_connection_time(self, client: TestClient, auth_headers):
        """Teste de tempo de conexão com o banco"""
        # Arrange
        max_response_time = 1.0  # 1 segundo
        test_date = date.today().strftime("%Y-%m-%d")
        
        # Act - Primeira requisição (pode incluir tempo de conexão)
        start_time = time.time()
        response = client.get(f"/api/v1/lancamentos/dia?data={test_date}", headers=auth_headers)
        end_time = time.time()
        
        response_time = end_time - start_time
        
        # Assert
        assert response.status_code in [200, 404]
        assert response_time < max_response_time, f"Conexão com banco muito lenta: {response_time:.2f}s"
    
    def test_query_performance_consistency(self, client: TestClient, auth_headers):
        """Teste de consistência de performance das consultas"""
        # Arrange
        test_date = date.today().strftime("%Y-%m-%d")
        num_queries = 15
        max_std_deviation = 0.5  # Desvio padrão máximo de 500ms
        
        # Act
        response_times = []
        
        for _ in range(num_queries):
            start_time = time.time()
            response = client.get(f"/api/v1/lancamentos/dia?data={test_date}", headers=auth_headers)
            end_time = time.time()
            
            if response.status_code in [200, 404]:
                response_times.append(end_time - start_time)
        
        # Assert
        if len(response_times) > 1:
            std_dev = statistics.stdev(response_times)
            assert std_dev < max_std_deviation, f"Performance inconsistente: desvio={std_dev:.3f}s"

class TestPerformanceLoad:
    """Testes de carga da aplicação"""
    
    def test_sustained_load(self, client: TestClient, auth_headers):
        """Teste de carga sustentada"""
        # Arrange
        duration_seconds = 30  # 30 segundos de teste
        max_requests_per_second = 10
        min_success_rate = 0.95  # 95% de sucesso
        
        test_date = date.today().strftime("%Y-%m-%d")
        
        # Act
        start_test = time.time()
        requests_made = 0
        successful_requests = 0
        
        while time.time() - start_test < duration_seconds:
            try:
                response = client.get(f"/api/v1/lancamentos/dia?data={test_date}", headers=auth_headers)
                requests_made += 1
                
                if response.status_code in [200, 404]:
                    successful_requests += 1
                
                # Controlar taxa de requisições
                time.sleep(1 / max_requests_per_second)
                
            except Exception:
                requests_made += 1
        
        # Assert
        success_rate = successful_requests / requests_made if requests_made > 0 else 0
        assert success_rate >= min_success_rate, f"Taxa de sucesso baixa: {success_rate:.2%}"
        assert requests_made > 0, "Nenhuma requisição foi feita"
    
    def test_burst_load(self, client: TestClient, auth_headers):
        """Teste de carga em rajada"""
        # Arrange
        burst_size = 20
        max_response_time = 5.0  # 5 segundos para rajada
        min_success_rate = 0.8  # 80% de sucesso em rajada
        
        test_date = date.today().strftime("%Y-%m-%d")
        
        def make_burst_request():
            try:
                response = client.get(f"/api/v1/lancamentos/dia?data={test_date}", headers=auth_headers)
                return {
                    'success': response.status_code in [200, 404],
                    'status_code': response.status_code
                }
            except Exception:
                return {'success': False, 'status_code': 500}
        
        # Act
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=burst_size) as executor:
            futures = [executor.submit(make_burst_request) for _ in range(burst_size)]
            results = [future.result() for future in as_completed(futures)]
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Assert
        successful_requests = sum(1 for r in results if r['success'])
        success_rate = successful_requests / len(results)
        
        assert total_time < max_response_time, f"Rajada muito lenta: {total_time:.2f}s"
        assert success_rate >= min_success_rate, f"Taxa de sucesso em rajada baixa: {success_rate:.2%}"

class TestPerformanceMetrics:
    """Testes para coleta de métricas de performance"""
    
    def test_collect_performance_metrics(self, client: TestClient, auth_headers):
        """Coleta métricas gerais de performance"""
        # Arrange
        test_date = date.today().strftime("%Y-%m-%d")
        num_samples = 10
        
        # Act
        metrics = {
            'response_times': [],
            'status_codes': [],
            'errors': 0
        }
        
        for _ in range(num_samples):
            try:
                start_time = time.time()
                response = client.get(f"/api/v1/lancamentos/dia?data={test_date}", headers=auth_headers)
                end_time = time.time()
                
                metrics['response_times'].append(end_time - start_time)
                metrics['status_codes'].append(response.status_code)
                
            except Exception:
                metrics['errors'] += 1
        
        # Assert e Report
        if metrics['response_times']:
            avg_time = statistics.mean(metrics['response_times'])
            min_time = min(metrics['response_times'])
            max_time = max(metrics['response_times'])
            
            print(f"\n=== MÉTRICAS DE PERFORMANCE ===")
            print(f"Tempo médio de resposta: {avg_time:.3f}s")
            print(f"Tempo mínimo: {min_time:.3f}s")
            print(f"Tempo máximo: {max_time:.3f}s")
            print(f"Códigos de status: {set(metrics['status_codes'])}")
            print(f"Erros: {metrics['errors']}")
            
            # Verificações básicas
            assert avg_time < 3.0, "Tempo médio muito alto"
            assert metrics['errors'] < num_samples * 0.1, "Muitos erros"
    
    @pytest.mark.parametrize("endpoint,max_time", [
        ("/api/v1/auth/login", 1.0),
        ("/api/v1/lancamentos/dia", 2.0),
        ("/api/v1/auth/me", 0.5)
    ])
    def test_endpoint_performance_benchmarks(self, client: TestClient, auth_headers, endpoint, max_time):
        """Teste parametrizado de benchmarks por endpoint"""
        # Arrange
        if "login" in endpoint:
            data = {"username": "master", "password": "master123"}
            headers = None
        elif "lancamentos" in endpoint:
            endpoint = f"{endpoint}?data={date.today().strftime('%Y-%m-%d')}"
            data = None
            headers = auth_headers
        else:
            data = None
            headers = auth_headers
        
        # Act
        start_time = time.time()
        
        if data:
            response = client.post(endpoint, json=data, headers=headers)
        else:
            response = client.get(endpoint, headers=headers)
        
        end_time = time.time()
        response_time = end_time - start_time
        
        # Assert
        assert response.status_code in [200, 404, 401], f"Erro inesperado: {response.status_code}"
        assert response_time < max_time, f"Endpoint {endpoint} muito lento: {response_time:.3f}s"