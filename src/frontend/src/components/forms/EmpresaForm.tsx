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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';

// Types for the form - adjust to match yup schema exactly
interface EmpresaFormData {
  NomEmpresa: string;
  RazaoSocial: string;
  CNPJ: string;
  Endereco?: string;
  Bairro?: string;
  CEP?: string;
  Municipio?: string;
  Estado?: string;
  Telefone?: string;
  Email?: string;
  FlgPadrao?: boolean;
  FlgAtivo: 'S' | 'N';
}

interface EmpresaFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  loading?: boolean;
  error?: string | null;
}

// Validation schema
const empresaSchema = yup.object({
  NomEmpresa: yup.string().required('validation.required').max(100, 'validation.max_length'),
  RazaoSocial: yup.string().required('validation.required').max(100, 'validation.max_length'),
  CNPJ: yup.string().required('validation.required').max(18, 'validation.max_length'),
  Endereco: yup.string().max(100, 'validation.max_length'),
  Bairro: yup.string().max(50, 'validation.max_length'),
  CEP: yup.string().max(9, 'validation.max_length'),
  Municipio: yup.string().max(50, 'validation.max_length'),
  Estado: yup.string().max(2, 'validation.max_length'),
  Telefone: yup.string().max(20, 'validation.max_length'),
  Email: yup.string().email('validation.email').max(100, 'validation.max_length'),
  FlgPadrao: yup.boolean(),
  FlgAtivo: yup.string().oneOf(['S', 'N']).required('validation.required'),
});

export const EmpresaForm: React.FC<EmpresaFormProps> = ({
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
  } = useForm<EmpresaFormData>({
    resolver: yupResolver(empresaSchema),
    defaultValues: {
      NomEmpresa: '',
      RazaoSocial: '',
      CNPJ: '',
      Endereco: '',
      Bairro: '',
      CEP: '',
      Municipio: '',
      Estado: '',
      Telefone: '',
      Email: '',
      FlgPadrao: false,
      FlgAtivo: 'S',
    },
  });

  // Reset form when initialData changes or when closing
  useEffect(() => {
    if (open && initialData) {
      reset({
        NomEmpresa: initialData.NomEmpresa || '',
        RazaoSocial: initialData.RazaoSocial || '',
        CNPJ: initialData.CNPJ || '',
        Endereco: initialData.Endereco || '',
        Bairro: initialData.Bairro || '',
        CEP: initialData.CEP || '',
        Municipio: initialData.Municipio || '',
        Estado: initialData.Estado || '',
        Telefone: initialData.Telefone || '',
        Email: initialData.Email || '',
        FlgPadrao: initialData.FlgPadrao || false,
        FlgAtivo: initialData.FlgAtivo || 'S',
      });
    } else if (open && !initialData) {
      reset({
        NomEmpresa: '',
        RazaoSocial: '',
        CNPJ: '',
        Endereco: '',
        Bairro: '',
        CEP: '',
        Municipio: '',
        Estado: '',
        Telefone: '',
        Email: '',
        FlgPadrao: false,
        FlgAtivo: 'S',
      });
    }
  }, [open, initialData, reset]);

  const handleClose = () => {
    onClose();
  };

  const handleFormSubmit = (data: EmpresaFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? t('empresas.editar') : t('empresas.nova')}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Nome Fantasia */}
            <Grid item xs={12}>
              <Controller
                name="NomEmpresa"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('empresas.nome_fantasia')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Razão Social */}
            <Grid item xs={12}>
              <Controller
                name="RazaoSocial"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('empresas.razao_social')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* CNPJ */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="CNPJ"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('empresas.cnpj')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Telefone */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="Telefone"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('empresas.telefone')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12}>
              <Controller
                name="Email"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('empresas.email')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Endereço */}
            <Grid item xs={12}>
              <Controller
                name="Endereco"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('empresas.endereco')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Bairro */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="Bairro"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('empresas.bairro')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* CEP */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="CEP"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('empresas.cep')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Município */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="Municipio"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('empresas.municipio')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Estado */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="Estado"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('empresas.estado')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Empresa Padrão */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="FlgPadrao"
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
                    label={t('empresas.padrao')}
                  />
                )}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="FlgAtivo"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.FlgAtivo}>
                    <InputLabel>{t('empresas.ativo')}</InputLabel>
                    <Select {...field} label={t('empresas.ativo')}>
                      <MenuItem value="S">{t('categorias.ativo')}</MenuItem>
                      <MenuItem value="N">{t('categorias.inativo')}</MenuItem>
                    </Select>
                    {errors.FlgAtivo && (
                      <FormHelperText>{t(errors.FlgAtivo.message || '')}</FormHelperText>
                    )}
                  </FormControl>
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
  );
};