"""Serviço para consultar IP externo"""
import logging
import httpx
from typing import Optional

logger = logging.getLogger(__name__)


async def get_external_ip() -> Optional[str]:
    """Consulta a API ipify.org para obter o IP externo
    
    Returns:
        str: IP externo se bem-sucedido, None caso contrário
    """
    try:
        logger.info("Consultando IP externo...")
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get("https://api.ipify.org?format=json")
            
            # Verifica se a resposta foi bem-sucedida
            if response.status_code != 200:
                logger.error(f"Erro na consulta do IP: Status {response.status_code}")
                return None
            
            # Valida se a resposta é um JSON válido
            try:
                data = response.json()
            except Exception as json_error:
                logger.error(f"Erro ao decodificar JSON: {json_error}")
                return None
            
            # Valida se o campo 'ip' existe na resposta
            if "ip" not in data:
                logger.error("Campo 'ip' não encontrado na resposta da API")
                return None
            
            ip_address = data["ip"]
            
            # Validação básica do formato IP
            if not ip_address or not isinstance(ip_address, str):
                logger.error("IP retornado é inválido")
                return None
            
            logger.info(f"IP externo obtido com sucesso: {ip_address}")
            return ip_address
            
    except httpx.TimeoutException:
        logger.error("Timeout ao consultar API do IP externo")
        return None
    except httpx.ConnectError:
        logger.error("Erro de conexão ao consultar API do IP externo")
        return None
    except httpx.RequestError as req_error:
        logger.error(f"Erro na requisição: {req_error}")
        return None
    except Exception as e:
        logger.error(f"Erro inesperado ao consultar IP externo: {e}")
        return None


async def print_external_ip() -> None:
    """Consulta e imprime o IP externo no console"""
    ip = await get_external_ip()
    
    if ip:
        print(f"🌐 IP Externo: {ip}")
        logger.info(f"Sistema inicializado com IP externo: {ip}")
    else:
        print("⚠️  Não foi possível obter o IP externo")
        logger.warning("Falha ao obter IP externo durante a inicialização")