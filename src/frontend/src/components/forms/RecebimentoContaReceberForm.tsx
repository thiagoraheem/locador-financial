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
import { AccountsReceivableResponse } from '../../services/contasReceberApi';

// Types for the form - adjust to match yup schema exactly
interface RecebimentoContaReceberFormData {
  CodAccountsReceivable: number;
  idConta?: number | null;
  CodFormaPagto?: number | null;
  DataRecebimento: Date | null;
  ValorRecebido: number;
  Desconto?: number;
  Juros?: number;
  Multa?: number;
  NumeroDocumento?: string;
  Observacao?: string;
}

interface RecebimentoContaReceberFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  contaReceber: AccountsReceivableResponse;
  loading?: boolean;
  error?: string | null;
}

// Validation schema
const recebimentoContaReceberSchema = yup.object({
  CodAccountsReceivable: yup.number().required('validation.required').positive('validation.positive_number'),
  idConta: yup.number().nullable().positive('validation.positive_number'),
  CodFormaPagto: yup.number().nullable().positive('validation.positive_number'),
  DataRecebimento: yup.date().required('validation.required').nullable(),
  ValorRecebido: yup.number().required('validation.required').positive('validation.positive_number'),
  Desconto: yup.number().nullable().min(0, 'validation.positive_number'),
  Juros: yup.number().nullable().min(0, 'validation.positive_number'),
  Multa: yup.number().nullable().min(0, 'validation.positive_number'),
  NumeroDocumento: yup.string().max(50, 'validation.max_length'),
  Observacao: yup.string().max(500, 'validation.max_length'),
});

export const RecebimentoContaReceberForm: React.FC<RecebimentoContaReceberFormProps> = ({
  open,
  onClose,
  onSubmit,
  contaReceber,
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
  } = useForm<RecebimentoContaReceberFormData>({
    resolver: yupResolver(recebimentoContaReceberSchema),
    defaultValues: {
      CodAccountsReceivable: contaReceber.CodAccountsReceivable,
      idConta: contaReceber.idConta || null,
      CodFormaPagto: null,
      DataRecebimento: new Date(),
      ValorRecebido: contaReceber.Valor - (contaReceber.ValorRecebido || 0),
      Desconto: 0,
      Juros: 0,
      Multa: 0,
      NumeroDocumento: '',
      Observacao: '',
    },
  });

  // Reset form when contaReceber changes
  useEffect(() => {
    if (open && contaReceber) {
      reset({
        CodAccountsReceivable: contaReceber.CodAccountsReceivable,
        idConta: contaReceber.idConta || null,
        CodFormaPagto: null,
        DataRecebimento: new Date(),
        ValorRecebido: contaReceber.Valor - (contaReceber.ValorRecebido || 0),
        Desconto: 0,
        Juros: 0,
        Multa: 0,
        NumeroDocumento: '',
        Observacao: '',
      });
    }
  }, [open, contaReceber, reset]);

  const handleClose = () => {
    onClose();
  };

  const handleFormSubmit = (data: RecebimentoContaReceberFormData) => {
    const formattedData = {
      ...data,
      CodAccountsReceivable: Number(data.CodAccountsReceivable),
      idConta: data.idConta ? Number(data.idConta) : null,
      CodFormaPagto: data.CodFormaPagto ? Number(data.CodFormaPagto) : null,
      DataRecebimento: data.DataRecebimento ? data.DataRecebimento.toISOString().split('T')[0] : null,
      ValorRecebido: Number(data.ValorRecebido),
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
  const valorOriginal = contaReceber.Valor;
  const valorRecebido = watch('ValorRecebido', 0);
  const valorAReceber = valorOriginal - (contaReceber.ValorRecebido || 0);
  const valorTotal = valorOriginal + (juros || 0) + (multa || 0) - (desconto || 0);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {t('contas_receber.registrar_recebimento')}
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
              {t('contas_receber.informacoes_conta')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>{t('contas_receber.cliente')}:</strong> {contaReceber.cliente_nome}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>{t('lancamentos.numero_documento')}:</strong> {contaReceber.NumeroDocumento || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>{t('contas_receber.valor_original')}:</strong> {`R$ ${valorOriginal.toFixed(2)}`.replace('.', ',')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>{t('contas_receber.valor_recebido')}:</strong> {`R$ ${(contaReceber.ValorRecebido || 0).toFixed(2)}`.replace('.', ',')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>{t('contas_receber.valor_a_receber')}:</strong> {`R$ ${valorAReceber.toFixed(2)}`.replace('.', ',')}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
            <Grid container spacing={2}>
              {/* Data de Recebimento */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="DataRecebimento"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      {...field}
                      label={t('contas_receber.data_recebimento')}
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

              {/* Valor Recebido */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="ValorRecebido"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('contas_receber.valor_recebido')}
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

              {/* Forma de Recebimento */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="CodFormaPagto"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('contas_receber.forma_recebimento')}
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
                      label={t('contas_receber.desconto')}
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
                      label={t('contas_receber.juros')}
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
                      label={t('contas_receber.multa')}
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