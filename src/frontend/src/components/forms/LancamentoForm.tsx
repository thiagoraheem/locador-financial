import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
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
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

// Types for the form
interface LancamentoFormData {
  Data: Date | null;
  DataEmissao: Date | null;
  CodEmpresa: number | null;
  idConta: number | null;
  CodFavorecido: number;
  CodCategoria: number;
  Valor: number;
  IndMov: 'E' | 'S';
  NumDocto: string;
  CodFormaPagto: number;
  FlgFrequencia: 'U' | 'R';
  Observacao: string;
}

interface LancamentoFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  loading?: boolean;
  error?: string | null;
}

// Validation schema
const lancamentoSchema = yup.object({
  Data: yup.date().required('validation.required'),
  DataEmissao: yup.date().required('validation.required'),
  CodEmpresa: yup.number().nullable(),
  idConta: yup.number().nullable(),
  CodFavorecido: yup.number().required('validation.required').positive('validation.positive_number'),
  CodCategoria: yup.number().required('validation.required').positive('validation.positive_number'),
  Valor: yup.number().required('validation.required').positive('validation.positive_number'),
  IndMov: yup.string().oneOf(['E', 'S']).required('validation.required'),
  NumDocto: yup.string().max(50, 'validation.max_length'),
  CodFormaPagto: yup.number().required('validation.required').positive('validation.positive_number'),
  FlgFrequencia: yup.string().oneOf(['U', 'R']).required('validation.required'),
  Observacao: yup.string().max(500, 'validation.max_length'),
});

export const LancamentoForm: React.FC<LancamentoFormProps> = ({
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
    setValue,
  } = useForm<LancamentoFormData>({
    resolver: yupResolver(lancamentoSchema),
    defaultValues: {
      Data: new Date(),
      DataEmissao: new Date(),
      CodEmpresa: null,
      idConta: null,
      CodFavorecido: 0,
      CodCategoria: 0,
      Valor: 0,
      IndMov: 'E',
      NumDocto: '',
      CodFormaPagto: 0,
      FlgFrequencia: 'U',
      Observacao: '',
    },
  });

  // Reset form when initialData changes or when closing
  useEffect(() => {
    if (open && initialData) {
      reset({
        Data: initialData.Data ? new Date(initialData.Data) : new Date(),
        DataEmissao: initialData.DataEmissao ? new Date(initialData.DataEmissao) : new Date(),
        CodEmpresa: initialData.CodEmpresa || null,
        idConta: initialData.idConta || null,
        CodFavorecido: initialData.CodFavorecido,
        CodCategoria: initialData.CodCategoria,
        Valor: initialData.Valor,
        IndMov: initialData.IndMov,
        NumDocto: initialData.NumDocto || '',
        CodFormaPagto: initialData.CodFormaPagto,
        FlgFrequencia: initialData.FlgFrequencia,
        Observacao: initialData.Observacao || '',
      });
    } else if (open && !initialData) {
      reset({
        Data: new Date(),
        DataEmissao: new Date(),
        CodEmpresa: null,
        idConta: null,
        CodFavorecido: 0,
        CodCategoria: 0,
        Valor: 0,
        IndMov: 'E',
        NumDocto: '',
        CodFormaPagto: 0,
        FlgFrequencia: 'U',
        Observacao: '',
      });
    }
  }, [open, initialData, reset]);

  const handleClose = () => {
    onClose();
  };

  const handleFormSubmit = (data: LancamentoFormData) => {
    // Format data for submission
    const formattedData = {
      ...data,
      Data: data.Data ? format(data.Data, 'yyyy-MM-dd') : null,
      DataEmissao: data.DataEmissao ? format(data.DataEmissao, 'yyyy-MM-dd') : null,
      Valor: Number(data.Valor),
      CodFavorecido: Number(data.CodFavorecido),
      CodCategoria: Number(data.CodCategoria),
      CodFormaPagto: Number(data.CodFormaPagto),
    };
    
    onSubmit(formattedData);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditing ? t('lancamentos.editar') : t('lancamentos.novo')}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Tipo de Movimento */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="IndMov"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.IndMov}>
                      <InputLabel>{t('lancamentos.tipo')}</InputLabel>
                      <Select {...field} label={t('lancamentos.tipo')}>
                        <MenuItem value="E">{t('lancamentos.entrada')}</MenuItem>
                        <MenuItem value="S">{t('lancamentos.saida')}</MenuItem>
                      </Select>
                      {errors.IndMov && (
                        <FormHelperText>{t(errors.IndMov.message || '')}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Data */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="Data"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      {...field}
                      label={t('lancamentos.data')}
                      format="dd/MM/yyyy"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error ? t(error.message || '') : null,
                        },
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
                      format="dd/MM/yyyy"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error ? t(error.message || '') : null,
                        },
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
                      label={t('lancamentos.valor')}
                      type="number"
                      InputProps={{
                        inputProps: { min: 0, step: 0.01 }
                      }}
                      error={!!error}
                      helperText={error ? t(error.message || '') : null}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              {/* Favorecido */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="CodFavorecido"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('lancamentos.favorecido')}
                      type="number"
                      error={!!error}
                      helperText={error ? t(error.message || '') : null}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                      label={t('lancamentos.forma_pagamento')}
                      type="number"
                      error={!!error}
                      helperText={error ? t(error.message || '') : null}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              {/* Frequência */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="FlgFrequencia"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.FlgFrequencia}>
                      <InputLabel>{t('lancamentos.frequencia')}</InputLabel>
                      <Select {...field} label={t('lancamentos.frequencia')}>
                        <MenuItem value="U">{t('lancamentos.unico')}</MenuItem>
                        <MenuItem value="R">{t('lancamentos.recorrente')}</MenuItem>
                      </Select>
                      {errors.FlgFrequencia && (
                        <FormHelperText>{t(errors.FlgFrequencia.message || '')}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Número do Documento */}
              <Grid item xs={12}>
                <Controller
                  name="NumDocto"
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
          </LocalizationProvider>
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
  );
};