# API Documentation

## Overview

This document provides detailed information about the Financial Web Application API endpoints. The API is built with FastAPI and follows REST principles.

## Authentication

All API endpoints (except authentication endpoints) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Login
```
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "login": "string",
  "senha": "string"
}
```

**Response:**
```json
{
  "access_token": "string",
  "token_type": "string",
  "expires_in": "integer",
  "user_info": {
    "cod_funcionario": "integer",
    "nome": "string",
    "login": "string",
    "email": "string",
    "cod_setor": "integer",
    "cod_funcao": "integer",
    "is_active": "boolean"
  }
}
```

### Logout
```
POST /api/v1/auth/logout
```

**Response:**
```json
{
  "message": "Successfully logged out"
}
```

### Get Current User
```
GET /api/v1/auth/me
```

**Response:**
```json
{
  "cod_funcionario": "integer",
  "nome": "string",
  "login": "string",
  "email": "string",
  "cod_setor": "integer",
  "cod_funcao": "integer",
  "is_active": "boolean"
}
```

## Accounts Payable (Contas a Pagar)

### List Accounts Payable
```
GET /api/v1/contas-pagar
```

**Query Parameters:**
- `skip` (integer, optional): Number of records to skip (default: 0)
- `limit` (integer, optional): Maximum number of records to return (default: 100)
- `cod_fornecedor` (integer, optional): Filter by supplier code
- `cod_empresa` (integer, optional): Filter by company code
- `status` (string, optional): Filter by status (A=Open, P=Paid, V=Overdue, C=Cancelled)
- `data_vencimento_inicio` (string, optional): Filter by due date start (format: YYYY-MM-DD)
- `data_vencimento_fim` (string, optional): Filter by due date end (format: YYYY-MM-DD)
- `valor_min` (number, optional): Filter by minimum value
- `valor_max` (number, optional): Filter by maximum value

**Response:**
```json
[
  {
    "CodAccountsPayable": "integer",
    "CodEmpresa": "integer",
    "CodFornecedor": "integer",
    "fornecedor_nome": "string",
    "idConta": "integer",
    "CodCategoria": "integer",
    "DataEmissao": "string",
    "DataVencimento": "string",
    "DataPagamento": "string",
    "Valor": "number",
    "ValorPago": "number",
    "Desconto": "number",
    "Juros": "number",
    "Multa": "number",
    "Status": "string",
    "NumeroDocumento": "string",
    "NumParcela": "integer",
    "TotalParcelas": "integer",
    "Observacao": "string",
    "CodigoBarras": "string",
    "LinhaDigitavel": "string",
    "NomUsuario": "string",
    "DtCreate": "string",
    "DtAlter": "string"
  }
]
```

### Get Account Payable
```
GET /api/v1/contas-pagar/{id}
```

**Response:**
```json
{
  "CodAccountsPayable": "integer",
  "CodEmpresa": "integer",
  "CodFornecedor": "integer",
  "fornecedor_nome": "string",
  "idConta": "integer",
  "CodCategoria": "integer",
  "DataEmissao": "string",
  "DataVencimento": "string",
  "DataPagamento": "string",
  "Valor": "number",
  "ValorPago": "number",
  "Desconto": "number",
  "Juros": "number",
  "Multa": "number",
  "Status": "string",
  "NumeroDocumento": "string",
  "NumParcela": "integer",
  "TotalParcelas": "integer",
  "Observacao": "string",
  "CodigoBarras": "string",
  "LinhaDigitavel": "string",
  "NomUsuario": "string",
  "DtCreate": "string",
  "DtAlter": "string"
}
```

### Create Account Payable
```
POST /api/v1/contas-pagar
```

**Request Body:**
```json
{
  "CodEmpresa": "integer",
  "CodFornecedor": "integer",
  "idConta": "integer",
  "CodCategoria": "integer",
  "DataEmissao": "string",
  "DataVencimento": "string",
  "Valor": "number",
  "Status": "string",
  "NumeroDocumento": "string",
  "NumParcela": "integer",
  "TotalParcelas": "integer",
  "Observacao": "string",
  "CodigoBarras": "string",
  "LinhaDigitavel": "string"
}
```

**Response:**
```json
{
  "CodAccountsPayable": "integer",
  "CodEmpresa": "integer",
  "CodFornecedor": "integer",
  "fornecedor_nome": "string",
  "idConta": "integer",
  "CodCategoria": "integer",
  "DataEmissao": "string",
  "DataVencimento": "string",
  "DataPagamento": "string",
  "Valor": "number",
  "ValorPago": "number",
  "Desconto": "number",
  "Juros": "number",
  "Multa": "number",
  "Status": "string",
  "NumeroDocumento": "string",
  "NumParcela": "integer",
  "TotalParcelas": "integer",
  "Observacao": "string",
  "CodigoBarras": "string",
  "LinhaDigitavel": "string",
  "NomUsuario": "string",
  "DtCreate": "string",
  "DtAlter": "string"
}
```

### Update Account Payable
```
PUT /api/v1/contas-pagar/{id}
```

**Request Body:**
```json
{
  "CodEmpresa": "integer",
  "CodFornecedor": "integer",
  "idConta": "integer",
  "CodCategoria": "integer",
  "DataEmissao": "string",
  "DataVencimento": "string",
  "Valor": "number",
  "Status": "string",
  "NumeroDocumento": "string",
  "NumParcela": "integer",
  "TotalParcelas": "integer",
  "Observacao": "string",
  "CodigoBarras": "string",
  "LinhaDigitavel": "string"
}
```

**Response:**
```json
{
  "CodAccountsPayable": "integer",
  "CodEmpresa": "integer",
  "CodFornecedor": "integer",
  "fornecedor_nome": "string",
  "idConta": "integer",
  "CodCategoria": "integer",
  "DataEmissao": "string",
  "DataVencimento": "string",
  "DataPagamento": "string",
  "Valor": "number",
  "ValorPago": "number",
  "Desconto": "number",
  "Juros": "number",
  "Multa": "number",
  "Status": "string",
  "NumeroDocumento": "string",
  "NumParcela": "integer",
  "TotalParcelas": "integer",
  "Observacao": "string",
  "CodigoBarras": "string",
  "LinhaDigitavel": "string",
  "NomUsuario": "string",
  "DtCreate": "string",
  "DtAlter": "string"
}
```

### Delete Account Payable
```
DELETE /api/v1/contas-pagar/{id}
```

**Response:**
```json
{
  "message": "Account payable deleted successfully"
}
```

### Register Payment
```
POST /api/v1/contas-pagar/{id}/pagar
```

**Request Body:**
```json
{
  "idConta": "integer",
  "CodFormaPagto": "integer",
  "DataPagamento": "string",
  "ValorPago": "number",
  "Desconto": "number",
  "Juros": "number",
  "Multa": "number",
  "NumeroDocumento": "string",
  "Observacao": "string"
}
```

**Response:**
```json
{
  "CodAccountsPayable": "integer",
  "CodEmpresa": "integer",
  "CodFornecedor": "integer",
  "fornecedor_nome": "string",
  "idConta": "integer",
  "CodCategoria": "integer",
  "DataEmissao": "string",
  "DataVencimento": "string",
  "DataPagamento": "string",
  "Valor": "number",
  "ValorPago": "number",
  "Desconto": "number",
  "Juros": "number",
  "Multa": "number",
  "Status": "string",
  "NumeroDocumento": "string",
  "NumParcela": "integer",
  "TotalParcelas": "integer",
  "Observacao": "string",
  "CodigoBarras": "string",
  "LinhaDigitavel": "string",
  "NomUsuario": "string",
  "DtCreate": "string",
  "DtAlter": "string"
}
```

## Accounts Receivable (Contas a Receber)

### List Accounts Receivable
```
GET /api/v1/contas-receber
```

**Query Parameters:**
- `skip` (integer, optional): Number of records to skip (default: 0)
- `limit` (integer, optional): Maximum number of records to return (default: 100)
- `cod_cliente` (integer, optional): Filter by client code
- `cod_empresa` (integer, optional): Filter by company code
- `status` (string, optional): Filter by status (A=Open, R=Received, V=Overdue, C=Cancelled)
- `data_vencimento_inicio` (string, optional): Filter by due date start (format: YYYY-MM-DD)
- `data_vencimento_fim` (string, optional): Filter by due date end (format: YYYY-MM-DD)
- `valor_min` (number, optional): Filter by minimum value
- `valor_max` (number, optional): Filter by maximum value

**Response:**
```json
[
  {
    "CodAccountsReceivable": "integer",
    "CodEmpresa": "integer",
    "CodCliente": "integer",
    "cliente_nome": "string",
    "idConta": "integer",
    "CodCategoria": "integer",
    "DataEmissao": "string",
    "DataVencimento": "string",
    "DataRecebimento": "string",
    "Valor": "number",
    "ValorRecebido": "number",
    "Desconto": "number",
    "Juros": "number",
    "Multa": "number",
    "Status": "string",
    "NumeroDocumento": "string",
    "NumParcela": "integer",
    "TotalParcelas": "integer",
    "DiasAtraso": "integer",
    "FlgProtestado": "boolean",
    "DataProtesto": "string",
    "Observacao": "string",
    "NotaFiscal": "string",
    "SerieNF": "string",
    "NomUsuario": "string",
    "DtCreate": "string",
    "DtAlter": "string"
  }
]
```

### Get Account Receivable
```
GET /api/v1/contas-receber/{id}
```

**Response:**
```json
{
  "CodAccountsReceivable": "integer",
  "CodEmpresa": "integer",
  "CodCliente": "integer",
  "cliente_nome": "string",
  "idConta": "integer",
  "CodCategoria": "integer",
  "DataEmissao": "string",
  "DataVencimento": "string",
  "DataRecebimento": "string",
  "Valor": "number",
  "ValorRecebido": "number",
  "Desconto": "number",
  "Juros": "number",
  "Multa": "number",
  "Status": "string",
  "NumeroDocumento": "string",
  "NumParcela": "integer",
  "TotalParcelas": "integer",
  "DiasAtraso": "integer",
  "FlgProtestado": "boolean",
  "DataProtesto": "string",
  "Observacao": "string",
  "NotaFiscal": "string",
  "SerieNF": "string",
  "NomUsuario": "string",
  "DtCreate": "string",
  "DtAlter": "string"
}
```

### Create Account Receivable
```
POST /api/v1/contas-receber
```

**Request Body:**
```json
{
  "CodEmpresa": "integer",
  "CodCliente": "integer",
  "idConta": "integer",
  "CodCategoria": "integer",
  "DataEmissao": "string",
  "DataVencimento": "string",
  "Valor": "number",
  "Status": "string",
  "NumeroDocumento": "string",
  "NumParcela": "integer",
  "TotalParcelas": "integer",
  "DiasAtraso": "integer",
  "FlgProtestado": "boolean",
  "DataProtesto": "string",
  "Observacao": "string",
  "NotaFiscal": "string",
  "SerieNF": "string"
}
```

**Response:**
```json
{
  "CodAccountsReceivable": "integer",
  "CodEmpresa": "integer",
  "CodCliente": "integer",
  "cliente_nome": "string",
  "idConta": "integer",
  "CodCategoria": "integer",
  "DataEmissao": "string",
  "DataVencimento": "string",
  "DataRecebimento": "string",
  "Valor": "number",
  "ValorRecebido": "number",
  "Desconto": "number",
  "Juros": "number",
  "Multa": "number",
  "Status": "string",
  "NumeroDocumento": "string",
  "NumParcela": "integer",
  "TotalParcelas": "integer",
  "DiasAtraso": "integer",
  "FlgProtestado": "boolean",
  "DataProtesto": "string",
  "Observacao": "string",
  "NotaFiscal": "string",
  "SerieNF": "string",
  "NomUsuario": "string",
  "DtCreate": "string",
  "DtAlter": "string"
}
```

### Update Account Receivable
```
PUT /api/v1/contas-receber/{id}
```

**Request Body:**
```json
{
  "CodEmpresa": "integer",
  "CodCliente": "integer",
  "idConta": "integer",
  "CodCategoria": "integer",
  "DataEmissao": "string",
  "DataVencimento": "string",
  "Valor": "number",
  "Status": "string",
  "NumeroDocumento": "string",
  "NumParcela": "integer",
  "TotalParcelas": "integer",
  "DiasAtraso": "integer",
  "FlgProtestado": "boolean",
  "DataProtesto": "string",
  "Observacao": "string",
  "NotaFiscal": "string",
  "SerieNF": "string"
}
```

**Response:**
```json
{
  "CodAccountsReceivable": "integer",
  "CodEmpresa": "integer",
  "CodCliente": "integer",
  "cliente_nome": "string",
  "idConta": "integer",
  "CodCategoria": "integer",
  "DataEmissao": "string",
  "DataVencimento": "string",
  "DataRecebimento": "string",
  "Valor": "number",
  "ValorRecebido": "number",
  "Desconto": "number",
  "Juros": "number",
  "Multa": "number",
  "Status": "string",
  "NumeroDocumento": "string",
  "NumParcela": "integer",
  "TotalParcelas": "integer",
  "DiasAtraso": "integer",
  "FlgProtestado": "boolean",
  "DataProtesto": "string",
  "Observacao": "string",
  "NotaFiscal": "string",
  "SerieNF": "string",
  "NomUsuario": "string",
  "DtCreate": "string",
  "DtAlter": "string"
}
```

### Delete Account Receivable
```
DELETE /api/v1/contas-receber/{id}
```

**Response:**
```json
{
  "message": "Account receivable deleted successfully"
}
```

### Register Receipt
```
POST /api/v1/contas-receber/{id}/receber
```

**Request Body:**
```json
{
  "idConta": "integer",
  "CodFormaPagto": "integer",
  "DataRecebimento": "string",
  "ValorRecebido": "number",
  "Desconto": "number",
  "Juros": "number",
  "Multa": "number",
  "NumeroDocumento": "string",
  "Observacao": "string"
}
```

**Response:**
```json
{
  "CodAccountsReceivable": "integer",
  "CodEmpresa": "integer",
  "CodCliente": "integer",
  "cliente_nome": "string",
  "idConta": "integer",
  "CodCategoria": "integer",
  "DataEmissao": "string",
  "DataVencimento": "string",
  "DataRecebimento": "string",
  "Valor": "number",
  "ValorRecebido": "number",
  "Desconto": "number",
  "Juros": "number",
  "Multa": "number",
  "Status": "string",
  "NumeroDocumento": "string",
  "NumParcela": "integer",
  "TotalParcelas": "integer",
  "DiasAtraso": "integer",
  "FlgProtestado": "boolean",
  "DataProtesto": "string",
  "Observacao": "string",
  "NotaFiscal": "string",
  "SerieNF": "string",
  "NomUsuario": "string",
  "DtCreate": "string",
  "DtAlter": "string"
}
```

## Dashboard

### Financial Summary
```
GET /api/v1/dashboard/resumo
```

**Query Parameters:**
- `empresa_id` (integer, optional): Filter by company

**Response:**
```json
{
  "total_receitas": "number",
  "total_despesas": "number",
  "saldo": "number",
  "contas_a_pagar": "integer",
  "contas_a_receber": "integer"
}
```

### Cash Flow
```
GET /api/v1/dashboard/fluxo-caixa
```

**Query Parameters:**
- `months` (integer, optional): Number of months to display (default: 12)
- `empresa_id` (integer, optional): Filter by company

**Response:**
```json
{
  "periodo": "string",
  "entradas": [
    {
      "mes_ano": "string",
      "valor": "number"
    }
  ],
  "saidas": [
    {
      "mes_ano": "string",
      "valor": "number"
    }
  ],
  "saldo_mensal": [
    {
      "mes_ano": "string",
      "saldo": "number"
    }
  ]
}
```

### Category Summary
```
GET /api/v1/dashboard/categorias
```

**Query Parameters:**
- `tipo` (string, required): Type (E=Revenues, S=Expenses)
- `empresa_id` (integer, optional): Filter by company

**Response:**
```json
[
  {
    "categoria": "string",
    "valor": "number"
  }
]
```

### Overdue Summary
```
GET /api/v1/dashboard/vencimentos
```

**Query Parameters:**
- `empresa_id` (integer, optional): Filter by company

**Response:**
```json
{
  "contas_pagar_vencidas": "integer",
  "contas_receber_vencidas": "integer",
  "contas_receber_inadimplentes": "integer"
}
```

### Top Payees/Clients
```
GET /api/v1/dashboard/favorecidos
```

**Query Parameters:**
- `tipo` (string, required): Type (E=Revenues, S=Expenses)
- `limit` (integer, optional): Number of records (default: 10)
- `empresa_id` (integer, optional): Filter by company

**Response:**
```json
[
  {
    "nome": "string",
    "valor": "number"
  }
]
```