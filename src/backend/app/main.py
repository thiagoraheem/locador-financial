"""
FastAPI application main module for Financial Web Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, lancamentos, contas_pagar, contas_receber, categorias, dashboard
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.PROJECT_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão dos routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(lancamentos.router, prefix=settings.API_V1_STR)
app.include_router(contas_pagar.router, prefix=settings.API_V1_STR)
app.include_router(contas_receber.router, prefix=settings.API_V1_STR)
app.include_router(categorias.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)

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