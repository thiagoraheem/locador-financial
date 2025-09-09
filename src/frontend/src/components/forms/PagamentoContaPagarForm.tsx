import React, { useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { ptBR } from 'date-fns/locale';
import { AccountsPayableResponse } from '../../services/contasPagarApi';

// Types for the form - adjust to match yup schema exactly
interface PagamentoContaPagarFormData {
  CodAccountsPayable: number;
  idConta?: number | null;
  CodFormaPagto?: number | null;
  DataPagamento: Date | null;
  ValorPago: number;
  Desconto?: number;
  Juros?: number;
  Multa?: number;
  NumeroDocumento?: string;
  Observacao?: string;
}

interface PagamentoContaPagarFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  contaPagar: AccountsPayableResponse;
  loading?: boolean;
  error?: string | null;
}

// Validation schema
const pagamentoContaPagarSchema = yup.object({
  CodAccountsPayable: yup.number().required('validation.required').positive('validation.positive_number'),
  idConta: yup.number().nullable().optional().positive('validation.positive_number'),
  CodFormaPagto: yup.number().nullable().optional().positive('validation.positive_number'),
  DataPagamento: yup.date().required('validation.required').nullable(),
  ValorPago: yup.number().required('validation.required').positive('validation.positive_number'),
  Desconto: yup.number().optional().min(0, 'validation.positive_number'),
  Juros: yup.number().optional().min(0, 'validation.positive_number'),
  Multa: yup.number().optional().min(0, 'validation.positive_number'),
  NumeroDocumento: yup.string().optional().max(50, 'validation.max_length'),
  Observacao: yup.string().optional().max(500, 'validation.max_length'),
});

export const PagamentoContaPagarForm: React.FC<PagamentoContaPagarFormProps> = ({
  open,
  onClose,
  onSubmit,
  contaPagar,
  loading = false,
  error = null,
}) => {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<PagamentoContaPagarFormData>({
    resolver: yupResolver(pagamentoContaPagarSchema),
    defaultValues: {
      CodAccountsPayable: contaPagar.CodAccountsPayable,
      idConta: contaPagar.idConta || null,
      CodFormaPagto: null,
      DataPagamento: new Date(),
      ValorPago: contaPagar.Valor - (contaPagar.ValorPago || 0),
      Desconto: 0,
      Juros: 0,
      Multa: 0,
      NumeroDocumento: '',
      Observacao: '',
    },
  });

  // Reset form when contaPagar changes
  useEffect(() => {
    if (open && contaPagar) {
      reset({
        CodAccountsPayable: contaPagar.CodAccountsPayable,
        idConta: contaPagar.idConta || null,
        CodFormaPagto: null,
        DataPagamento: new Date(),
        ValorPago: contaPagar.Valor - (contaPagar.ValorPago || 0),
        Desconto: 0,
        Juros: 0,
        Multa: 0,
        NumeroDocumento: '',
        Observacao: '',
      });
    }
  }, [open, contaPagar, reset]);

  const handleClose = () => {
    onClose();
  };

  const handleFormSubmit = (data: PagamentoContaPagarFormData) => {
    const formattedData = {
      ...data,
      CodAccountsPayable: Number(data.CodAccountsPayable),
      idConta: data.idConta ? Number(data.idConta) : null,
      CodFormaPagto: data.CodFormaPagto ? Number(data.CodFormaPagto) : null,
      DataPagamento: data.DataPagamento ? data.DataPagamento.toISOString().split('T')[0] : null,
      ValorPago: Number(data.ValorPago),
      Desconto: data.Desconto ? Number(data.Desconto) : 0,
      Juros: data.Juros ? Number(data.Juros) : 0,
      Multa: data.Multa ? Number(data.Multa) : 0,
    };
    
    onSubmit(formattedData);
  };

  // Watch form values for calculations
  const desconto = watch('Desconto', 0);
  const juros = watch('Juros', 0);
  const multa = watch('Multa', 0);
  const valorOriginal = contaPagar.Valor;
  const valorPago = watch('ValorPago', 0);
  const valorAPagar = valorOriginal - (contaPagar.ValorPago || 0);
  const valorTotal = valorOriginal + (juros || 0) + (multa || 0) - (desconto || 0);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {t('contas_pagar.registrar_pagamento')}
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {/* Conta information */}
          <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              {t('contas_pagar.informacoes_conta')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>{t('contas_pagar.fornecedor')}:</strong> {contaPagar.fornecedor_nome}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>{t('lancamentos.numero_documento')}:</strong> {contaPagar.NumeroDocumento || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>{t('contas_pagar.valor_original')}:</strong> {`R$ ${valorOriginal.toFixed(2)}`.replace('.', ',')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>{t('contas_pagar.valor_pago')}:</strong> {`R$ ${(contaPagar.ValorPago || 0).toFixed(2)}`.replace('.', ',')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>{t('contas_pagar.valor_a_pagar')}:</strong> {`R$ ${valorAPagar.toFixed(2)}`.replace('.', ',')}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
            <Grid container spacing={2}>
              {/* Data de Pagamento */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="DataPagamento"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      {...field}
                      label={t('contas_pagar.data_pagamento')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error ? t(error.message || '') : null,
                        }
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Valor Pago */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="ValorPago"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('contas_pagar.valor_pago')}
                      type="number"
                      error={!!error}
                      helperText={error ? t(error.message || '') : null}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      InputProps={{
                        inputProps: { min: 0, step: 0.01 }
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Conta Bancária */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="idConta"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('contas.conta')}
                      type="number"
                      error={!!error}
                      helperText={error ? t(error.message || '') : null}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Forma de Pagamento */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="CodFormaPagto"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('contas_pagar.forma_pagamento')}
                      type="number"
                      error={!!error}
                      helperText={error ? t(error.message || '') : null}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Desconto */}
              <Grid item xs={12} sm={4}>
                <Controller
                  name="Desconto"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('contas_pagar.desconto')}
                      type="number"
                      error={!!error}
                      helperText={error ? t(error.message || '') : null}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      InputProps={{
                        inputProps: { min: 0, step: 0.01 }
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Juros */}
              <Grid item xs={12} sm={4}>
                <Controller
                  name="Juros"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('contas_pagar.juros')}
                      type="number"
                      error={!!error}
                      helperText={error ? t(error.message || '') : null}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      InputProps={{
                        inputProps: { min: 0, step: 0.01 }
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Multa */}
              <Grid item xs={12} sm={4}>
                <Controller
                  name="Multa"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('contas_pagar.multa')}
                      type="number"
                      error={!!error}
                      helperText={error ? t(error.message || '') : null}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      InputProps={{
                        inputProps: { min: 0, step: 0.01 }
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Número do Documento */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="NumeroDocumento"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('lancamentos.numero_documento')}
                      error={!!error}
                      helperText={error ? t(error.message || '') : null}
                    />
                  )}
                />
              </Grid>

              {/* Observações */}
              <Grid item xs={12}>
                <Controller
                  name="Observacao"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('lancamentos.observacoes')}
                      multiline
                      rows={3}
                      error={!!error}
                      helperText={error ? t(error.message || '') : null}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            {t('actions.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit(handleFormSubmit)} 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? t('messages.saving') : t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};