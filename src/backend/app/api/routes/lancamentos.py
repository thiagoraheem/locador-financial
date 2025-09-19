"""
Rotas para lançamentos financeiros
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.funcionario import TblFuncionarios
from app.schemas.lancamento import (
    LancamentoCreate, 
    LancamentoUpdate, 
    LancamentoResponse, 
    LancamentoFilter,
    LancamentoConfirm,
    LancamentosPaginatedResponse
)
from datetime import date
from app.services.lancamento_service import LancamentoService

router = APIRouter(prefix="/lancamentos", tags=["lançamentos"])

@router.get("/", response_model=LancamentosPaginatedResponse, summary="Listar lançamentos")
async def listar_lancamentos(
    skip: int = Query(0, ge=0, description="Registros a pular"),
    limit: int = Query(100, ge=1, le=1000, description="Limite de registros"),
    filtros: LancamentoFilter = Depends(),
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Lista lançamentos com paginação e filtros opcionais
    """
    service = LancamentoService(db)
    return service.list_lancamentos_paginated(skip=skip, limit=limit, filtros=filtros)

@router.get("/dia", summary="Obter lançamentos do dia")
async def obter_lancamentos_dia(
    data: date = Query(..., description="Data para consulta dos lançamentos"),
    valor_min: Optional[float] = Query(None, description="Valor mínimo"),
    valor_max: Optional[float] = Query(None, description="Valor máximo"),
    cod_favorecido: Optional[int] = Query(None, description="Código do favorecido"),
    cod_categoria: Optional[int] = Query(None, description="Código da categoria"),
    id_conta: Optional[int] = Query(None, description="ID da conta"),
    tipo_lancamento: Optional[str] = Query(None, description="Tipo de lançamento"),
    num_docto: Optional[str] = Query(None, description="Número do documento"),
    cod_forma_pagto: Optional[int] = Query(None, description="Código da forma de pagamento"),
    confirmado: Optional[bool] = Query(None, description="Status de confirmação"),
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Obtém lançamentos de uma data específica com filtros opcionais
    """
    service = LancamentoService(db)
    
    # Criar filtro com os parâmetros recebidos
    filtros = LancamentoFilter(
        data_inicio=data,
        data_fim=data,
        valor_min=valor_min,
        valor_max=valor_max,
        cod_favorecido=cod_favorecido,
        cod_categoria=cod_categoria,
        cod_conta=id_conta,
        num_docto=num_docto,
        cod_forma_pagto=cod_forma_pagto,
        confirmado=confirmado
    )
    
    lancamentos = service.list_lancamentos(filtros=filtros)
    
    # Calcular resumo
    total_entradas = sum(float(l.Valor) for l in lancamentos if l.IndMov == True)
    total_saidas = sum(float(l.Valor) for l in lancamentos if l.IndMov == False)
    saldo_dia = total_entradas - total_saidas
    total_confirmados = sum(1 for l in lancamentos if getattr(l, 'flg_confirmacao', False))
    valores_pendentes = sum(float(l.Valor) for l in lancamentos if not getattr(l, 'flg_confirmacao', False))
    
    # Gráfico de formas de pagamento
    formas_pagamento = {}
    for lancamento in lancamentos:
        forma = getattr(lancamento.forma_pagamento, 'Nome', 'Não informado') if hasattr(lancamento, 'forma_pagamento') else 'Não informado'
        if forma not in formas_pagamento:
            formas_pagamento[forma] = {'valor': 0, 'quantidade': 0}
        formas_pagamento[forma]['valor'] += lancamento.Valor
        formas_pagamento[forma]['quantidade'] += 1
    
    grafico_formas_pagamento = [
        {
            'forma_pagamento': forma,
            'valor': dados['valor'],
            'quantidade': dados['quantidade']
        }
        for forma, dados in formas_pagamento.items()
    ]
    
    # Converter lançamentos para o formato esperado pelo frontend
    lancamentos_response = []
    for l in lancamentos:
        lancamento_dict = {
            'CodLancamento': l.CodLancamento,
            'Data': l.Data.isoformat() if l.Data else None,
            'DataEmissao': getattr(l, 'data_emissao', None).isoformat() if getattr(l, 'data_emissao', None) else None,
            'CodEmpresa': l.CodEmpresa,
            'idConta': l.CodConta,
            'CodFavorecido': l.CodFavorecido,
            'CodCategoria': l.CodCategoria,
            'Valor': float(l.Valor) if l.Valor else 0,
            'IndMov': 'E' if l.IndMov else 'S',
            'NumDocto': l.NumDocto or '',
            'CodFormaPagto': getattr(l, 'cod_forma_pagto', None),
            'FlgFrequencia': getattr(l, 'flg_frequencia', None),
            'Observacao': getattr(l, 'Comentario', '') or '',
            'FlgConfirmacao': getattr(l, 'flg_confirmacao', False) or False,
            'DatConfirmacao': getattr(l, 'dat_confirmacao', None).isoformat() if getattr(l, 'dat_confirmacao', None) else None,
            'ParcelaAtual': getattr(l, 'parcela_atual', None),
            'QtdParcelas': getattr(l, 'qtd_parcelas', None),
            'favorecido_nome': getattr(l.favorecido, 'DesFavorecido', '') if hasattr(l, 'favorecido') and l.favorecido else '',
            'categoria_nome': getattr(l.categoria, 'DesCategoria', '') if hasattr(l, 'categoria') and l.categoria else '',
            'forma_pagamento_nome': '',  # Relacionamento não carregado por padrão
            'empresa_nome': '',  # Relacionamento não carregado por padrão
            'conta_nome': getattr(l.conta, 'Nome', '') if hasattr(l, 'conta') and l.conta else '',
            'NomUsuario': l.NomUsuario or '',
            'DtCreate': getattr(l, 'DatCadastro', None).isoformat() if getattr(l, 'DatCadastro', None) else None,
            'DtAlter': getattr(l, 'DatAlteracao', None).isoformat() if getattr(l, 'DatAlteracao', None) else None,
            'tipo_movimento': 'Entrada' if l.IndMov else 'Saída',
            'status': 'Confirmado' if getattr(l, 'flg_confirmacao', False) else 'Pendente',
            'tipo_lancamento': 'Lançamento Direto',
            'parcela_info': f"{getattr(l, 'parcela_atual', 1)}/{getattr(l, 'qtd_parcelas', 1)}" if getattr(l, 'parcela_atual', None) and getattr(l, 'qtd_parcelas', None) and getattr(l, 'qtd_parcelas', 1) > 1 else 'À vista',
            'a_vista': not getattr(l, 'qtd_parcelas', None) or getattr(l, 'qtd_parcelas', 1) <= 1
        }
        lancamentos_response.append(lancamento_dict)
    
    return {
        'lancamentos': lancamentos_response,
        'resumo': {
            'total_entradas': total_entradas,
            'total_saidas': total_saidas,
            'saldo_dia': saldo_dia,
            'valores_pendentes': valores_pendentes,
            'total_confirmados': total_confirmados,
            'total_lancamentos': len(lancamentos)
        },
        'grafico_formas_pagamento': grafico_formas_pagamento,
        'total': len(lancamentos),
        'data_consulta': data.isoformat()
    }

@router.get("/filtro-opcoes", summary="Obter opções para filtros")
async def obter_filtro_opcoes(
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Obtém as opções disponíveis para os filtros (favorecidos, categorias, etc.)
    """
    from app.models.favorecido import Favorecido
    from app.models.categoria import Categoria
    from app.models.conta import Conta
    from app.models.forma_pagamento import FormaPagamento
    from app.models.empresa import Empresa
    
    # Buscar favorecidos
    favorecidos = db.query(Favorecido).all()
    favorecidos_opcoes = [{'value': f.CodFavorecido, 'label': f.DesFavorecido} for f in favorecidos]
    
    # Buscar categorias
    categorias = db.query(Categoria).filter(Categoria.FlgAtivo == 'S').all()
    categorias_opcoes = [{'value': c.CodCategoria, 'label': c.DesCategoria} for c in categorias]
    
    # Buscar contas
    contas = db.query(Conta).all()  # Assumindo que não há campo FlgAtivo em Conta
    contas_opcoes = [{'value': c.idConta, 'label': getattr(c, 'Nome', f'Conta {c.idConta}')} for c in contas]
    
    # Buscar formas de pagamento
    try:
        formas_pagamento = db.query(FormaPagamento).all()
        formas_pagamento_opcoes = [{'value': fp.CodFormaPagto, 'label': getattr(fp, 'NomFormaPagto', f'Forma {fp.CodFormaPagto}')} for fp in formas_pagamento]
    except:
        formas_pagamento_opcoes = []
    
    # Buscar empresas
    try:
        empresas = db.query(Empresa).all()
        empresas_opcoes = [{'value': e.CodEmpresa, 'label': getattr(e, 'NomEmpresa', f'Empresa {e.CodEmpresa}')} for e in empresas]
    except:
        empresas_opcoes = []
    
    return {
        'favorecidos': favorecidos_opcoes,
        'categorias': categorias_opcoes,
        'contas': contas_opcoes,
        'formas_pagamento': formas_pagamento_opcoes,
        'empresas': empresas_opcoes
    }

@router.get("/{lancamento_id}", response_model=LancamentoResponse, summary="Obter lançamento por ID")
async def obter_lancamento(
    lancamento_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Obtém um lançamento específico pelo ID
    """
    service = LancamentoService(db)
    lancamento = service.get_lancamento_by_id(lancamento_id)
    return LancamentoResponse.from_orm_with_relations(lancamento)

@router.post("/", response_model=LancamentoResponse, status_code=status.HTTP_201_CREATED, summary="Criar lançamento")
async def criar_lancamento(
    lancamento: LancamentoCreate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Cria um novo lançamento
    """
    service = LancamentoService(db)
    novo_lancamento = service.create_lancamento(lancamento, current_user.CodFuncionario)
    return LancamentoResponse.from_orm_with_relations(novo_lancamento)

@router.put("/{lancamento_id}", response_model=LancamentoResponse, summary="Atualizar lançamento")
async def atualizar_lancamento(
    lancamento_id: int,
    lancamento: LancamentoUpdate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Atualiza um lançamento existente
    """
    service = LancamentoService(db)
    lancamento_atualizado = service.update_lancamento(lancamento_id, lancamento, current_user.CodFuncionario)
    return LancamentoResponse.from_orm_with_relations(lancamento_atualizado)

@router.delete("/{lancamento_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Excluir lançamento")
async def excluir_lancamento(
    lancamento_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Exclui um lançamento
    """
    service = LancamentoService(db)
    service.delete_lancamento(lancamento_id)
    return None

@router.patch("/{lancamento_id}/confirmar", response_model=LancamentoResponse, summary="Confirmar lançamento")
async def confirmar_lancamento(
    lancamento_id: int,
    confirmacao: LancamentoConfirm,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Confirma ou desconfirma um lançamento
    """
    service = LancamentoService(db)
    lancamento_confirmado = service.confirm_lancamento(lancamento_id, confirmacao.confirmado, current_user.CodFuncionario)
    return LancamentoResponse.from_orm_with_relations(lancamento_confirmado)