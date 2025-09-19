"""
Rotas para contas a pagar
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.funcionario import TblFuncionarios
from app.schemas.conta_pagar import (
    AccountsPayableCreate, 
    AccountsPayableUpdate, 
    AccountsPayableResponse,
    AccountsPayablePaymentCreate,
    AccountsPayablePaymentUpdate,
    AccountsPayablePaymentResponse
)
from app.services.conta_pagar_service import ContaPagarService

router = APIRouter(prefix="/contas-pagar", tags=["contas a pagar"])

def map_accounts_payable_to_response(conta) -> AccountsPayableResponse:
    """Mapeia o modelo AccountsPayable para o schema AccountsPayableResponse"""
    response_data = {
        "CodEmpresa": conta.id_company,
        "CodFornecedor": conta.id_customer,
        "idConta": conta.id_bank_account,
        "CodCategoria": conta.id_chart_of_accounts,
        "DataEmissao": conta.issuance_date,
        "DataVencimento": conta.due_date,
        "DataPagamento": conta.payment_date,
        "Valor": conta.amount,
        "ValorPago": conta.paid_amount or 0,
        "Desconto": conta.discount_amount or 0,
        "Juros": conta.interest_amount or 0,
        "Multa": conta.fine_amount or 0,
        "Status": "P" if conta.payment_date else "A",  # Status baseado na data de pagamento
        "NumeroDocumento": conta.document_number,
        "NumParcela": conta.installment if conta.installment and conta.installment > 0 else 1,
        "TotalParcelas": conta.total_installments if conta.total_installments and conta.total_installments > 0 else 1,
        "Observacao": conta.description,
        "CodigoBarras": None,  # Campo não existe no modelo atual
        "LinhaDigitavel": None,  # Campo não existe no modelo atual
        "CodAccountsPayable": conta.id,
        "NomUsuario": "Sistema",  # Ajustar conforme necessário
        "DtCreate": conta.date_create,  # Usar campo real de auditoria
        "DtAlter": conta.date_update,
        "fornecedor_nome": getattr(conta, 'fornecedor_nome', None)  # Será preenchido pelo join com Favorecido
    }
    return AccountsPayableResponse(**response_data)

@router.get("/", response_model=List[AccountsPayableResponse], summary="Listar contas a pagar")
async def listar_contas_pagar(
    skip: int = Query(0, ge=0, description="Registros a pular"),
    limit: int = Query(100, ge=1, le=1000, description="Limite de registros"),
    status: Optional[str] = Query(None, description="Filtrar por status: A, P, V, C"),
    empresa_id: Optional[int] = Query(None, description="Filtrar por empresa"),
    fornecedor_id: Optional[int] = Query(None, description="Filtrar por fornecedor"),
    data_vencimento_inicio: Optional[datetime] = Query(None, description="Filtrar por data de vencimento (início)"),
    data_vencimento_fim: Optional[datetime] = Query(None, description="Filtrar por data de vencimento (fim)"),
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Lista todas as contas a pagar com filtros opcionais
    """
    service = ContaPagarService(db)
    contas = service.list_contas_pagar(
        skip=skip,
        limit=limit,
        status=status,
        empresa_id=empresa_id,
        fornecedor_id=fornecedor_id,
        data_vencimento_inicio=data_vencimento_inicio,
        data_vencimento_fim=data_vencimento_fim
    )
    return [map_accounts_payable_to_response(conta) for conta in contas]

@router.get("/{conta_pagar_id}", response_model=AccountsPayableResponse, summary="Obter conta a pagar por ID")
async def obter_conta_pagar(
    conta_pagar_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Obtém uma conta a pagar específica pelo ID
    """
    service = ContaPagarService(db)
    conta = service.get_conta_pagar_by_id(conta_pagar_id)
    return map_accounts_payable_to_response(conta)

@router.post("/", response_model=AccountsPayableResponse, summary="Criar conta a pagar", status_code=status.HTTP_201_CREATED)
async def criar_conta_pagar(
    conta: AccountsPayableCreate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Cria uma nova conta a pagar
    """
    service = ContaPagarService(db)
    nova_conta = service.create_conta_pagar(conta, current_user)
    return map_accounts_payable_to_response(nova_conta)

@router.put("/{conta_pagar_id}", response_model=AccountsPayableResponse, summary="Atualizar conta a pagar")
async def atualizar_conta_pagar(
    conta_pagar_id: int,
    conta: AccountsPayableUpdate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Atualiza uma conta a pagar existente
    """
    service = ContaPagarService(db)
    conta_atualizada = service.update_conta_pagar(conta_pagar_id, conta, current_user)
    return map_accounts_payable_to_response(conta_atualizada)

@router.delete("/{conta_pagar_id}", summary="Cancelar conta a pagar")
async def cancelar_conta_pagar(
    conta_pagar_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Cancela uma conta a pagar (exclusão lógica)
    """
    service = ContaPagarService(db)
    service.delete_conta_pagar(conta_pagar_id, current_user)
    return {"message": f"Conta a pagar {conta_pagar_id} cancelada com sucesso"}

@router.post("/{conta_pagar_id}/pagar", response_model=AccountsPayableResponse, summary="Registrar pagamento")
async def pagar_conta_pagar(
    conta_pagar_id: int,
    pagamento: AccountsPayablePaymentCreate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Registra um pagamento para uma conta a pagar
    """
    service = ContaPagarService(db)
    conta_atualizada = service.pay_conta_pagar(conta_pagar_id, pagamento, current_user)
    return map_accounts_payable_to_response(conta_atualizada)

@router.put("/pagamentos/{payment_id}", response_model=AccountsPayablePaymentResponse, summary="Atualizar pagamento")
async def atualizar_pagamento(
    payment_id: int,
    pagamento: AccountsPayablePaymentUpdate,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Atualiza um pagamento de conta a pagar
    """
    service = ContaPagarService(db)
    pagamento_atualizado = service.update_payment(payment_id, pagamento, current_user)
    return AccountsPayablePaymentResponse.model_validate(pagamento_atualizado)

@router.delete("/pagamentos/{payment_id}", summary="Excluir pagamento")
async def excluir_pagamento(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: TblFuncionarios = Depends(get_current_user)
):
    """
    Exclui um pagamento de conta a pagar
    """
    service = ContaPagarService(db)
    service.delete_payment(payment_id, current_user)
    return {"message": f"Pagamento {payment_id} excluído com sucesso"}