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
interface ClienteFormData {
  DesCliente: string;
  RazaoSocial?: string;
  FlgTipoPessoa: 'F' | 'J';
  CPF?: string;
  RG?: string;
  CNPJ?: string;
  IE?: string;
  IM?: string;
  Endereco?: string;
  Bairro?: string;
  CEP?: string;
  Municipio?: string;
  Estado?: string;
  Telefone1?: string;
  Telefone2?: string;
  Email1?: string;
  Email2?: string;
  FlgLiberado?: boolean;
  FlgVIP?: boolean;
  FlgAtivo: 'S' | 'N';
  Observacoes?: string;
}

interface ClienteFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  loading?: boolean;
  error?: string | null;
}

// Validation schema
const clienteSchema = yup.object({
  DesCliente: yup.string().required('validation.required').max(100, 'validation.max_length'),
  RazaoSocial: yup.string().max(100, 'validation.max_length'),
  FlgTipoPessoa: yup.string().oneOf(['F', 'J']).required('validation.required'),
  CPF: yup.string().max(14, 'validation.max_length'),
  RG: yup.string().max(20, 'validation.max_length'),
  CNPJ: yup.string().max(18, 'validation.max_length'),
  IE: yup.string().max(20, 'validation.max_length'),
  IM: yup.string().max(20, 'validation.max_length'),
  Endereco: yup.string().max(100, 'validation.max_length'),
  Bairro: yup.string().max(50, 'validation.max_length'),
  CEP: yup.string().max(9, 'validation.max_length'),
  Municipio: yup.string().max(50, 'validation.max_length'),
  Estado: yup.string().max(2, 'validation.max_length'),
  Telefone1: yup.string().max(20, 'validation.max_length'),
  Telefone2: yup.string().max(20, 'validation.max_length'),
  Email1: yup.string().email('validation.email').max(100, 'validation.max_length'),
  Email2: yup.string().email('validation.email').max(100, 'validation.max_length'),
  FlgLiberado: yup.boolean(),
  FlgVIP: yup.boolean(),
  FlgAtivo: yup.string().oneOf(['S', 'N']).required('validation.required'),
  Observacoes: yup.string().max(500, 'validation.max_length'),
});

export const ClienteForm: React.FC<ClienteFormProps> = ({
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
  } = useForm<ClienteFormData>({
    resolver: yupResolver(clienteSchema),
    defaultValues: {
      DesCliente: '',
      RazaoSocial: '',
      FlgTipoPessoa: 'F',
      CPF: '',
      RG: '',
      CNPJ: '',
      IE: '',
      IM: '',
      Endereco: '',
      Bairro: '',
      CEP: '',
      Municipio: '',
      Estado: '',
      Telefone1: '',
      Telefone2: '',
      Email1: '',
      Email2: '',
      FlgLiberado: true,
      FlgVIP: false,
      FlgAtivo: 'S',
      Observacoes: '',
    },
  });

  // Reset form when initialData changes or when closing
  useEffect(() => {
    if (open && initialData) {
      reset({
        DesCliente: initialData.DesCliente || '',
        RazaoSocial: initialData.RazaoSocial || '',
        FlgTipoPessoa: initialData.FlgTipoPessoa || 'F',
        CPF: initialData.CPF || '',
        RG: initialData.RG || '',
        CNPJ: initialData.CNPJ || '',
        IE: initialData.IE || '',
        IM: initialData.IM || '',
        Endereco: initialData.Endereco || '',
        Bairro: initialData.Bairro || '',
        CEP: initialData.CEP || '',
        Municipio: initialData.Municipio || '',
        Estado: initialData.Estado || '',
        Telefone1: initialData.Telefone1 || '',
        Telefone2: initialData.Telefone2 || '',
        Email1: initialData.Email1 || '',
        Email2: initialData.Email2 || '',
        FlgLiberado: initialData.FlgLiberado || true,
        FlgVIP: initialData.FlgVIP || false,
        FlgAtivo: initialData.FlgAtivo || 'S',
        Observacoes: initialData.Observacoes || '',
      });
    } else if (open && !initialData) {
      reset({
        DesCliente: '',
        RazaoSocial: '',
        FlgTipoPessoa: 'F',
        CPF: '',
        RG: '',
        CNPJ: '',
        IE: '',
        IM: '',
        Endereco: '',
        Bairro: '',
        CEP: '',
        Municipio: '',
        Estado: '',
        Telefone1: '',
        Telefone2: '',
        Email1: '',
        Email2: '',
        FlgLiberado: true,
        FlgVIP: false,
        FlgAtivo: 'S',
        Observacoes: '',
      });
    }
  }, [open, initialData, reset]);

  const handleClose = () => {
    onClose();
  };

  const handleFormSubmit = (data: ClienteFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditing ? t('clientes.editar') : t('clientes.novo')}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Nome */}
            <Grid item xs={12}>
              <Controller
                name="DesCliente"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('clientes.nome')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Tipo de Pessoa */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="FlgTipoPessoa"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.FlgTipoPessoa}>
                    <InputLabel>{t('clientes.tipo_pessoa')}</InputLabel>
                    <Select {...field} label={t('clientes.tipo_pessoa')}>
                      <MenuItem value="F">{t('clientes.tipo_pessoa_f')}</MenuItem>
                      <MenuItem value="J">{t('clientes.tipo_pessoa_j')}</MenuItem>
                    </Select>
                    {errors.FlgTipoPessoa && (
                      <FormHelperText>{t(errors.FlgTipoPessoa.message || '')}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Razão Social */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="RazaoSocial"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('clientes.razao_social')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* CPF */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="CPF"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('clientes.cpf')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* RG */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="RG"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('clientes.rg')}
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
                    label={t('clientes.cnpj')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Inscrição Estadual */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="IE"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('clientes.ie')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Inscrição Municipal */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="IM"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('clientes.im')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Telefone 1 */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="Telefone1"
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

            {/* Telefone 2 */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="Telefone2"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('clientes.telefone2')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Email 1 */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="Email1"
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

            {/* Email 2 */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="Email2"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('clientes.email2')}
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
                    label={t('clientes.bairro')}
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
                    label={t('clientes.cep')}
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
                    label={t('clientes.municipio')}
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
                    label={t('clientes.estado')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Observações */}
            <Grid item xs={12}>
              <Controller
                name="Observacoes"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('clientes.observacoes')}
                    multiline
                    rows={3}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Flags */}
            <Grid item xs={12} sm={4}>
              <Controller
                name="FlgLiberado"
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
                    label={t('clientes.liberado')}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="FlgVIP"
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
                    label={t('clientes.vip')}
                  />
                )}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} sm={4}>
              <Controller
                name="FlgAtivo"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.FlgAtivo}>
                    <InputLabel>{t('clientes.ativo')}</InputLabel>
                    <Select {...field} label={t('clientes.ativo')}>
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