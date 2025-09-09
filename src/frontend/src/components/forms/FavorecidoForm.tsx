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
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';

// Types for the form
interface FavorecidoFormData {
  NomFavorecido: string;
  TipoFavorecido: 'F' | 'J';
  CPF_CNPJ: string;
  Telefone: string;
  Email: string;
  Endereco: string;
  FlgAtivo: 'S' | 'N';
}

interface FavorecidoFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  loading?: boolean;
  error?: string | null;
}

// Validation schema
const favorecidoSchema = yup.object({
  NomFavorecido: yup.string().required('validation.required').max(100, 'validation.max_length'),
  TipoFavorecido: yup.string().oneOf(['F', 'J']).required('validation.required'),
  CPF_CNPJ: yup.string().required('validation.required').max(18, 'validation.max_length'),
  Telefone: yup.string().max(20, 'validation.max_length'),
  Email: yup.string().email('validation.email').max(100, 'validation.max_length'),
  Endereco: yup.string().max(100, 'validation.max_length'),
  FlgAtivo: yup.string().oneOf(['S', 'N']).required('validation.required'),
});

export const FavorecidoForm: React.FC<FavorecidoFormProps> = ({
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
  } = useForm<FavorecidoFormData>({
    resolver: yupResolver(favorecidoSchema),
    defaultValues: {
      NomFavorecido: '',
      TipoFavorecido: 'F',
      CPF_CNPJ: '',
      Telefone: '',
      Email: '',
      Endereco: '',
      FlgAtivo: 'S',
    },
  });

  // Reset form when initialData changes or when closing
  useEffect(() => {
    if (open && initialData) {
      reset({
        NomFavorecido: initialData.NomFavorecido || '',
        TipoFavorecido: initialData.TipoFavorecido || 'F',
        CPF_CNPJ: initialData.CPF_CNPJ || '',
        Telefone: initialData.Telefone || '',
        Email: initialData.Email || '',
        Endereco: initialData.Endereco || '',
        FlgAtivo: initialData.FlgAtivo || 'S',
      });
    } else if (open && !initialData) {
      reset({
        NomFavorecido: '',
        TipoFavorecido: 'F',
        CPF_CNPJ: '',
        Telefone: '',
        Email: '',
        Endereco: '',
        FlgAtivo: 'S',
      });
    }
  }, [open, initialData, reset]);

  const handleClose = () => {
    onClose();
  };

  const handleFormSubmit = (data: FavorecidoFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? t('favorecidos.editar') : t('favorecidos.novo')}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Nome do Favorecido */}
            <Grid item xs={12}>
              <Controller
                name="NomFavorecido"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('lancamentos.favorecido')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Tipo de Favorecido */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="TipoFavorecido"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.TipoFavorecido}>
                    <InputLabel>{t('clientes.tipo_pessoa')}</InputLabel>
                    <Select {...field} label={t('clientes.tipo_pessoa')}>
                      <MenuItem value="F">{t('clientes.tipo_pessoa_f')}</MenuItem>
                      <MenuItem value="J">{t('clientes.tipo_pessoa_j')}</MenuItem>
                    </Select>
                    {errors.TipoFavorecido && (
                      <FormHelperText>{t(errors.TipoFavorecido.message || '')}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* CPF/CNPJ */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="CPF_CNPJ"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('clientes.cpf') + '/' + t('clientes.cnpj')}
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
                    label={t('clientes.telefone1')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="Email"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('clientes.email1')}
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
                    label={t('clientes.endereco')}
                    multiline
                    rows={2}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
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
                    <InputLabel>{t('categorias.ativo')}</InputLabel>
                    <Select {...field} label={t('categorias.ativo')}>
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