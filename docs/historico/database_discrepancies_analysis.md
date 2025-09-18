# Análise de Discrepâncias - Modelos Backend vs Banco de Dados Real

## Resumo Executivo
Esta análise identifica as principais discrepâncias entre os modelos SQLAlchemy do backend e a estrutura real do banco de dados SQL Server.

## 1. CATEGORIA (tbl_Categorias)

### Discrepâncias Identificadas:
- **FlgAtivo**: Modelo usa Boolean, mas banco usa `bit` (0/1)
- **Campo ausente**: `flgTipo` (char(1)) existe no banco mas não no modelo
- **Campo ausente**: `flgImprimirRelEquip` (bit) existe no banco
- **Campo ausente**: `flgNecessitaSerial` (bit) existe no banco
- **Campo ausente**: `VlrPercDesconto` (decimal(18,2)) existe no banco
- **Campo ausente**: `DatValidadeDesconto` (date) existe no banco
- **Campo ausente**: `FlgAplicarDescontoAuto` (bit) existe no banco
- **Campo ausente**: `Observacao` (text) existe no banco
- **Relacionamentos**: Faltam FKs para `IdCostCenter`, `IdIncomeCenter`

### Correções Necessárias:
```python
# Adicionar campos ausentes no modelo Categoria
flg_tipo = Column(String(1), name='flgTipo')
flg_imprimir_rel_equip = Column(Boolean, name='flgImprimirRelEquip', default=True)
flg_necessita_serial = Column(Boolean, name='flgNecessitaSerial', default=False)
vlr_perc_desconto = Column(Numeric(18,2), name='VlrPercDesconto')
dat_validade_desconto = Column(Date, name='DatValidadeDesconto')
flg_aplicar_desconto_auto = Column(Boolean, name='FlgAplicarDescontoAuto', default=True)
observacao = Column(Text, name='Observacao')
id_cost_center = Column(Integer, name='IdCostCenter')
id_income_center = Column(Integer, name='IdIncomeCenter')
```

## 2. CLIENTE (tbl_Clientes)

### Discrepâncias Identificadas:
- **Campo ausente**: `FlgLiberado` não existe no banco real
- **Campo real**: `FlgTipoPessoa` (char(1)) existe no banco mas não no modelo
- **Campos ausentes**: Múltiplos campos de contato (Contato2, Contato3, Telefone2, Telefone3, Email2, Email3)
- **Campos ausentes**: `CNH`, `CNHValidade`, `TipoContribuinte`, `TipoRegimeTributario`
- **Campos ausentes**: `VlrDesconto`, `CodVendedor`

### Correções Necessárias:
```python
# Remover campo inexistente
# flg_liberado = Column(Boolean, name='FlgLiberado')  # REMOVER

# Adicionar campos reais
flg_tipo_pessoa = Column(String(1), name='FlgTipoPessoa')
contato2 = Column(String(50), name='Contato2')
contato3 = Column(String(50), name='Contato3')
telefone2 = Column(String(16), name='Telefone2')
telefone3 = Column(String(16), name='Telefone3')
email2 = Column(String(50), name='Email2')
email3 = Column(String(50), name='Email3')
cnh = Column(String(20), name='CNH')
cnh_validade = Column(DateTime, name='CNHValidade')
tipo_contribuinte = Column(String(150), name='TipoContribuinte')
tipo_regime_tributario = Column(String(30), name='TipoRegimeTributario')
vlr_desconto = Column(Numeric(8,2), name='VlrDesconto')
cod_vendedor = Column(Integer, name='CodVendedor')
```

## 3. LANÇAMENTO (tbl_FINLancamentos)

### Discrepâncias Identificadas:
- **Tipo de dados**: `IndMov` é `bit` no banco, Boolean no modelo (OK)
- **Campo ausente**: `DataEmissao` (smalldatetime) existe no banco
- **Campo ausente**: `ValorPago` (money) existe no banco
- **Campo ausente**: `FlgConfirmacao` (bit) existe no banco
- **Campo ausente**: `DatConfirmacao` (date) existe no banco
- **Campo ausente**: `FlgFrequencia` (int) existe no banco
- **Campo ausente**: `QtdParcelas`, `ParcelaAtual` existem no banco
- **Campo ausente**: `CodLancamentoAnterior` existe no banco
- **Campo ausente**: `CodFatura`, `CodMedicao` existem no banco
- **Campo ausente**: `FlgTipoDivisao` (char(1)) existe no banco
- **Campo ausente**: `CodigoBarrasBoleto` (varchar(100)) existe no banco
- **Campo ausente**: `FlgBoletoEmitido` (bit) existe no banco
- **Campo ausente**: `NumRemessa` (int) existe no banco

### Correções Necessárias:
```python
# Adicionar campos ausentes no modelo Lancamento
data_emissao = Column(DateTime, name='DataEmissao')
valor_pago = Column(Numeric(19,4), name='ValorPago')
flg_confirmacao = Column(Boolean, name='FlgConfirmacao', default=False)
dat_confirmacao = Column(Date, name='DatConfirmacao')
flg_frequencia = Column(Integer, name='FlgFrequencia')
qtd_parcelas = Column(Integer, name='QtdParcelas')
parcela_atual = Column(Integer, name='ParcelaAtual')
cod_lancamento_anterior = Column(Integer, name='CodLancamentoAnterior')
cod_fatura = Column(Integer, name='CodFatura')
cod_medicao = Column(Integer, name='CodMedicao')
flg_tipo_divisao = Column(String(1), name='FlgTipoDivisao')
codigo_barras_boleto = Column(String(100), name='CodigoBarrasBoleto')
flg_boleto_emitido = Column(Boolean, name='FlgBoletoEmitido', default=False)
num_remessa = Column(Integer, name='NumRemessa')
```

## 4. FAVORECIDO (tbl_FINFavorecido)

### Discrepâncias Identificadas:
- **Campo ausente**: `CodClienteLocador` (int) existe no banco
- **Tipos corretos**: FlgTipo é char(1) - OK

### Correções Necessárias:
```python
# Adicionar campo ausente
cod_cliente_locador = Column(Integer, name='CodClienteLocador')
```

## 5. BANCO (tbl_Banco)

### Discrepâncias Identificadas:
- **Estrutura correta**: Modelo está alinhado com o banco
- **Campos**: Codigo (int), Digito (varchar(4)), Nome (varchar(100))

## 6. CONTA (tbl_Conta)

### Discrepâncias Identificadas:
- **Campo ausente**: `OperacaoConta` (varchar(15)) existe no banco
- **Campo ausente**: `Convenio` (varchar(10)) existe no banco
- **Campo ausente**: `TipoPix`, `ValorPix` existem no banco
- **Campo ausente**: `FlgContaPadrao` (bit) existe no banco
- **Campo ausente**: `Carteira`, `VariacaoCarteira` existem no banco
- **Campo ausente**: `EnableAPI` (bit) existe no banco
- **Campo ausente**: `ConfiguracaoAPI` (text) existe no banco

### Correções Necessárias:
```python
# Adicionar campos ausentes no modelo Conta
operacao_conta = Column(String(15), name='OperacaoConta')
convenio = Column(String(10), name='Convenio')
tipo_pix = Column(String(10), name='TipoPix')
valor_pix = Column(String(100), name='ValorPix')
flg_conta_padrao = Column(Boolean, name='FlgContaPadrao', default=False)
carteira = Column(String(5), name='Carteira')
variacao_carteira = Column(String(5), name='VariacaoCarteira')
enable_api = Column(Boolean, name='EnableAPI', default=False)
configuracao_api = Column(Text, name='ConfiguracaoAPI')
```

## 7. FUNCIONÁRIO (tbl_Funcionarios)

### Discrepâncias Identificadas:
- **Campo ausente**: `NumCTPS` (varchar(15)) existe no banco
- **Campo ausente**: `DatAdmissao`, `DatDemissao` (smalldatetime) existem no banco
- **Campo ausente**: `FlgComissao` (bit) existe no banco
- **Campo ausente**: `ValComissao`, `VlrDesconto` (numeric) existem no banco
- **Campo ausente**: `Login`, `Senha` (varchar) existem no banco
- **Campo ausente**: `AssinaturaDigitalizada` (image) existe no banco
- **Campo ausente**: `Settings` (varchar) existe no banco
- **Campo ausente**: `Foto` (image) existe no banco
- **Relacionamentos**: `CodSetor`, `CodFavorecido`, `CodFuncao`

### Correções Necessárias:
```python
# Adicionar campos ausentes no modelo Funcionario
num_ctps = Column(String(15), name='NumCTPS')
dat_admissao = Column(DateTime, name='DatAdmissao')
dat_demissao = Column(DateTime, name='DatDemissao')
flg_comissao = Column(Boolean, name='FlgComissao', default=False)
val_comissao = Column(Numeric(8,2), name='ValComissao')
vlr_desconto = Column(Numeric(8,2), name='VlrDesconto', default=100)
login = Column(String(15), name='Login')
senha = Column(String(30), name='Senha')
assinatura_digitalizada = Column(LargeBinary, name='AssinaturaDigitalizada')
settings = Column(Text, name='Settings')
foto = Column(LargeBinary, name='Foto')
cod_setor = Column(Integer, name='CodSetor')
cod_favorecido = Column(Integer, name='CodFavorecido')
cod_funcao = Column(Integer, name='CodFuncao')
```

## PRIORIDADES DE CORREÇÃO

### Alta Prioridade:
1. **Cliente**: Remover `FlgLiberado` inexistente
2. **Categoria**: Adicionar campos de flag e relacionamentos
3. **Lançamento**: Adicionar campos de controle financeiro

### Média Prioridade:
1. **Conta**: Adicionar campos PIX e API
2. **Favorecido**: Adicionar relacionamento com cliente
3. **Funcionário**: Adicionar campos de RH e