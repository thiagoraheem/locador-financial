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

// Types for the form - adjust to match yup schema exactly
interface ContaPagarFormData {
  CodEmpresa: number;
  CodFornecedor: number;
  idConta?: number | null;
  CodCategoria?: number | null;
  DataEmissao: Date | null;
  DataVencimento: Date | null;
  Valor: number;
  Status: 'A' | 'P' | 'V' | 'C';
  NumeroDocumento?: string;
  NumParcela?: number | null;
  TotalParcelas?: number | null;
  Observacao?: string;
  CodigoBarras?: string;
  LinhaDigitavel?: string;
}

interface ContaPagarFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  loading?: boolean;
  error?: string | null;
}

// Validation schema
const contaPagarSchema = yup.object({
  CodEmpresa: yup.number().required('validation.required').positive('validation.positive_number'),
  CodFornecedor: yup.number().required('validation.required').positive('validation.positive_number'),
  idConta: yup.number().nullable().positive('validation.positive_number'),
  CodCategoria: yup.number().nullable().positive('validation.positive_number'),
  DataEmissao: yup.date().required('validation.required').nullable(),
  DataVencimento: yup.date().required('validation.required').nullable(),
  Valor: yup.number().required('validation.required').positive('validation.positive_number'),
  Status: yup.string().oneOf(['A', 'P', 'V', 'C']).required('validation.required'),
  NumeroDocumento: yup.string().max(50, 'validation.max_length'),
  NumParcela: yup.number().nullable().min(1, 'validation.positive_number'),
  TotalParcelas: yup.number().nullable().min(1, 'validation.positive_number'),
  Observacao: yup.string().max(500, 'validation.max_length'),
  CodigoBarras: yup.string().max(50, 'validation.max_length'),
  LinhaDigitavel: yup.string().max(100, 'validation.max_length'),
});

export const ContaPagarForm: React.FC<ContaPagarFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading = false,
  error = null,
}) => {
  const { t } = useTranslation();
  const isEditing = !!initialData;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContaPagarFormData>({
    resolver: yupResolver(contaPagarSchema),
    defaultValues: {
      CodEmpresa: 0,
      CodFornecedor: 0,
      idConta: null,
      CodCategoria: null,
      DataEmissao: null,
      DataVencimento: null,
      Valor: 0,
      Status: 'A',
      NumeroDocumento: '',
      NumParcela: 1,
      TotalParcelas: 1,
      Observacao: '',
      CodigoBarras: '',
      LinhaDigitavel: '',
    },
  });

  // Reset form when initialData changes or when closing
  useEffect(() => {
    if (open && initialData) {
      reset({
        CodEmpresa: initialData.CodEmpresa || 0,
        CodFornecedor: initialData.CodFornecedor || 0,
        idConta: initialData.idConta || null,
        CodCategoria: initialData.CodCategoria || null,
        DataEmissao: initialData.DataEmissao ? new Date(initialData.DataEmissao) : null,
        DataVencimento: initialData.DataVencimento ? new Date(initialData.DataVencimento) : null,
        Valor: initialData.Valor || 0,
        Status: initialData.Status || 'A',
        NumeroDocumento: initialData.NumeroDocumento || '',
        NumParcela: initialData.NumParcela || 1,
        TotalParcelas: initialData.TotalParcelas || 1,
        Observacao: initialData.Observacao || '',
        CodigoBarras: initialData.CodigoBarras || '',
        LinhaDigitavel: initialData.LinhaDigitavel || '',
      });
    } else if (open && !initialData) {
      reset({
        CodEmpresa: 0,
        CodFornecedor: 0,
        idConta: null,
        CodCategoria: null,
        DataEmissao: null,
        DataVencimento: null,
        Valor: 0,
        Status: 'A',
        NumeroDocumento: '',
        NumParcela: 1,
        TotalParcelas: 1,
        Observacao: '',
        CodigoBarras: '',
        LinhaDigitavel: '',
      });
    }
  }, [open, initialData, reset]);

  const handleClose = () => {
    onClose();
  };

  const handleFormSubmit = (data: ContaPagarFormData) => {
    const formattedData = {
      ...data,
      CodEmpresa: Number(data.CodEmpresa),
      CodFornecedor: Number(data.CodFornecedor),
      idConta: data.idConta ? Number(data.idConta) : null,
      CodCategoria: data.CodCategoria ? Number(data.CodCategoria) : null,
      DataEmissao: data.DataEmissao ? data.DataEmissao.toISOString().split('T')[0] : null,
      DataVencimento: data.DataVencimento ? data.DataVencimento.toISOString().split('T')[0] : null,
      Valor: Number(data.Valor),
      NumParcela: data.NumParcela ? Number(data.NumParcela) : null,
      TotalParcelas: data.TotalParcelas ? Number(data.TotalParcelas) : null,
    };
    
    onSubmit(formattedData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? t('contas_pagar.editar') : t('contas_pagar.nova')}
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Empresa */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="CodEmpresa"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('contas.empresa')}
                      type="number"
                      error={!!error}
                      helperText={error ? t(error.message || '') : null}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Fornecedor */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="CodFornecedor"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('contas_pagar.fornecedor')}
                      type="number"
                      error={!!error}
                      helperText={error ? t(error.message || '') : null}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      InputProps={{
                        inputProps: { min: 0 }
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

              {/* Categoria */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="CodCategoria"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('lancamentos.categoria')}
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

              {/* Data de Emissão */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="DataEmissao"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      {...field}
                      label={t('lancamentos.data_emissao')}
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

              {/* Data de Vencimento */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="DataVencimento"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      {...field}
                      label={t('contas_pagar.data_vencimento')}
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

              {/* Valor */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="Valor"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('contas_pagar.valor')}
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

              {/* Número da Parcela */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="NumParcela"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('contas_pagar.parcial')}
                      type="number"
                      error={!!error}
                      helperText={error ? t(error.message || '') : null}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                      InputProps={{
                        inputProps: { min: 1 }
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Total de Parcelas */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="TotalParcelas"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('contas_pagar.parcial')}
                      type="number"
                      error={!!error}
                      helperText={error ? t(error.message || '') : null}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                      InputProps={{
                        inputProps: { min: 1 }
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="Status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.Status}>
                      <InputLabel>{t('contas_pagar.status')}</InputLabel>
                      <Select {...field} label={t('contas_pagar.status')}>
                        <MenuItem value="A">{t('contas_pagar.aberto')}</MenuItem>
                        <MenuItem value="P">{t('contas_pagar.pago')}</MenuItem>
                        <MenuItem value="V">{t('contas_pagar.vencido')}</MenuItem>
                        <MenuItem value="C">{t('lancamentos.cancelado')}</MenuItem>
                      </Select>
                      {errors.Status && (
                        <FormHelperText>{t(errors.Status.message || '')}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Código de Barras */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="CodigoBarras"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('contas_pagar.codigo_barras')}
                      error={!!error}
                      helperText={error ? t(error.message || '') : null}
                    />
                  )}
                />
              </Grid>

              {/* Linha Digitável */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="LinhaDigitavel"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('contas_pagar.linha_digitavel')}
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