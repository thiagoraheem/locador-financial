"""
FastAPI application main module for Financial Web Application
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, lancamentos, contas_pagar, contas_receber, categorias, dashboard, empresas, bancos, contas, clientes, favorecidos
from app.core.config import settings
from app.services.ip_service import print_external_ip

# Configuração de logging
logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL))
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.PROJECT_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)


@app.on_event("startup")
async def startup_event():
    """
    Evento executado durante a inicialização da aplicação
    """
    logger.info("Inicializando Sistema Financeiro Locador...")
    
    # Consulta e exibe o IP externo
    await print_external_ip()
    
    logger.info("Sistema inicializado com sucesso!")

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # More permissive for development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Inclusão dos routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(lancamentos.router, prefix=settings.API_V1_STR)
app.include_router(contas_pagar.router, prefix=settings.API_V1_STR)
app.include_router(contas_receber.router, prefix=settings.API_V1_STR)
app.include_router(categorias.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(empresas.router, prefix=settings.API_V1_STR)
app.include_router(bancos.router, prefix=settings.API_V1_STR)
app.include_router(contas.router, prefix=settings.API_V1_STR)
app.include_router(clientes.router, prefix=settings.API_V1_STR)
app.include_router(favorecidos.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": "API Financeira do Sistema Locador",
        "version": settings.PROJECT_VERSION,
        "docs": f"{settings.API_V1_STR}/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "locador-financial-api"}

@app.get("/test-db")
async def test_database():
    """Test database connectivity"""
    try:
        from app.core.database import get_db
        from sqlalchemy import text
        db = next(get_db())
        # Simple query to test connection
        result = db.execute(text("SELECT 1 as test"))
        row = result.fetchone()
        return {"status": "ok", "database": "connected", "test_result": row[0] if row else None}
    except Exception as e:
        return {"status": "error", "database": "disconnected", "error": str(e)}