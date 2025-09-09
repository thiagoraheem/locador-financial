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
  DatePicker,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { ptBR } from 'date-fns/locale';

// Types for the form
interface ContaReceberFormData {
  CodEmpresa: number;
  CodCliente: number;
  idConta: number | null;
  CodCategoria: number | null;
  DataEmissao: Date | null;
  DataVencimento: Date | null;
  DataRecebimento?: Date | null;
  Valor: number;
  Status: 'A' | 'R' | 'V' | 'C';
  NumeroDocumento: string;
  NumParcela: number;
  TotalParcelas: number;
  DiasAtraso: number;
  FlgProtestado: boolean;
  DataProtesto?: Date | null;
  Observacao: string;
  NotaFiscal: string;
  SerieNF: string;
}

interface ContaReceberFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  loading?: boolean;
  error?: string | null;
}

// Validation schema
const contaReceberSchema = yup.object({
  CodEmpresa: yup.number().required('validation.required').positive('validation.positive_number'),
  CodCliente: yup.number().required('validation.required').positive('validation.positive_number'),
  idConta: yup.number().nullable().positive('validation.positive_number'),
  CodCategoria: yup.number().nullable().positive('validation.positive_number'),
  DataEmissao: yup.date().required('validation.required').nullable(),
  DataVencimento: yup.date().required('validation.required').nullable(),
  DataRecebimento: yup.date().nullable(),
  Valor: yup.number().required('validation.required').positive('validation.positive_number'),
  Status: yup.string().oneOf(['A', 'R', 'V', 'C']).required('validation.required'),
  NumeroDocumento: yup.string().max(50, 'validation.max_length'),
  NumParcela: yup.number().nullable().min(1, 'validation.positive_number'),
  TotalParcelas: yup.number().nullable().min(1, 'validation.positive_number'),
  DiasAtraso: yup.number().nullable().min(0, 'validation.positive_number'),
  FlgProtestado: yup.boolean(),
  DataProtesto: yup.date().nullable(),
  Observacao: yup.string().max(500, 'validation.max_length'),
  NotaFiscal: yup.string().max(20, 'validation.max_length'),
  SerieNF: yup.string().max(3, 'validation.max_length'),
});

export const ContaReceberForm: React.FC<ContaReceberFormProps> = ({
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
  } = useForm<ContaReceberFormData>({
    resolver: yupResolver(contaReceberSchema),
    defaultValues: {
      CodEmpresa: 0,
      CodCliente: 0,
      idConta: null,
      CodCategoria: null,
      DataEmissao: null,
      DataVencimento: null,
      DataRecebimento: null,
      Valor: 0,
      Status: 'A',
      NumeroDocumento: '',
      NumParcela: 1,
      TotalParcelas: 1,
      DiasAtraso: 0,
      FlgProtestado: false,
      DataProtesto: null,
      Observacao: '',
      NotaFiscal: '',
      SerieNF: '',
    },
  });

  // Reset form when initialData changes or when closing
  useEffect(() => {
    if (open && initialData) {
      reset({
        CodEmpresa: initialData.CodEmpresa || 0,
        CodCliente: initialData.CodCliente || 0,
        idConta: initialData.idConta || null,
        CodCategoria: initialData.CodCategoria || null,
        DataEmissao: initialData.DataEmissao ? new Date(initialData.DataEmissao) : null,
        DataVencimento: initialData.DataVencimento ? new Date(initialData.DataVencimento) : null,
        DataRecebimento: initialData.DataRecebimento ? new Date(initialData.DataRecebimento) : null,
        Valor: initialData.Valor || 0,
        Status: initialData.Status || 'A',
        NumeroDocumento: initialData.NumeroDocumento || '',
        NumParcela: initialData.NumParcela || 1,
        TotalParcelas: initialData.TotalParcelas || 1,
        DiasAtraso: initialData.DiasAtraso || 0,
        FlgProtestado: initialData.FlgProtestado || false,
        DataProtesto: initialData.DataProtesto ? new Date(initialData.DataProtesto) : null,
        Observacao: initialData.Observacao || '',
        NotaFiscal: initialData.NotaFiscal || '',
        SerieNF: initialData.SerieNF || '',
      });
    } else if (open && !initialData) {
      reset({
        CodEmpresa: 0,
        CodCliente: 0,
        idConta: null,
        CodCategoria: null,
        DataEmissao: null,
        DataVencimento: null,
        DataRecebimento: null,
        Valor: 0,
        Status: 'A',
        NumeroDocumento: '',
        NumParcela: 1,
        TotalParcelas: 1,
        DiasAtraso: 0,
        FlgProtestado: false,
        DataProtesto: null,
        Observacao: '',
        NotaFiscal: '',
        SerieNF: '',
      });
    }
  }, [open, initialData, reset]);

  const handleClose = () => {
    onClose();
  };

  const handleFormSubmit = (data: ContaReceberFormData) => {
    const formattedData = {
      ...data,
      CodEmpresa: Number(data.CodEmpresa),
      CodCliente: Number(data.CodCliente),
      idConta: data.idConta ? Number(data.idConta) : null,
      CodCategoria: data.CodCategoria ? Number(data.CodCategoria) : null,
      DataEmissao: data.DataEmissao ? data.DataEmissao.toISOString().split('T')[0] : null,
      DataVencimento: data.DataVencimento ? data.DataVencimento.toISOString().split('T')[0] : null,
      DataRecebimento: data.DataRecebimento ? data.DataRecebimento.toISOString().split('T')[0] : null,
      DataProtesto: data.DataProtesto ? data.DataProtesto.toISOString().split('T')[0] : null,
      Valor: Number(data.Valor),
      NumParcela: data.NumParcela ? Number(data.NumParcela) : null,
      TotalParcelas: data.TotalParcelas ? Number(data.TotalParcelas) : null,
      DiasAtraso: data.DiasAtraso ? Number(data.DiasAtraso) : null,
    };
    
    onSubmit(formattedData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? t('contas_receber.editar') : t('contas_receber.nova')}
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

              {/* Cliente */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="CodCliente"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('contas_receber.cliente')}
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
                      label={t('contas_receber.data_vencimento')}
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

              {/* Valor */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="Valor"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('contas_receber.valor')}
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

              {/* Nota Fiscal */}
              <Grid item xs={12} sm={3}>
                <Controller
                  name="NotaFiscal"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('contas_receber.nota_fiscal')}
                      error={!!error}
                      helperText={error ? t(error.message || '') : null}
                    />
                  )}
                />
              </Grid>

              {/* Série NF */}
              <Grid item xs={12} sm={3}>
                <Controller
                  name="SerieNF"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('contas_receber.serie_nf')}
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
                      label={t('contas_receber.parcial')}
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
                      label={t('contas_receber.parcial')}
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

              {/* Dias de Atraso */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="DiasAtraso"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('contas_receber.dias_atraso')}
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

              {/* Protestado */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="FlgProtestado"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...field}
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label={t('contas_receber.protestado')}
                    />
                  )}
                />
              </Grid>

              {/* Data de Protesto */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="DataProtesto"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      {...field}
                      label={t('contas_receber.data_protesto')}
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

              {/* Status */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="Status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.Status}>
                      <InputLabel>{t('contas_receber.status')}</InputLabel>
                      <Select {...field} label={t('contas_receber.status')}>
                        <MenuItem value="A">{t('contas_receber.aberto')}</MenuItem>
                        <MenuItem value="R">{t('contas_receber.recebido')}</MenuItem>
                        <MenuItem value="V">{t('contas_receber.vencido')}</MenuItem>
                        <MenuItem value="C">{t('lancamentos.cancelado')}</MenuItem>
                      </Select>
                      {errors.Status && (
                        <FormHelperText>{t(errors.Status.message || '')}</FormHelperText>
                      )}
                    </FormControl>
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