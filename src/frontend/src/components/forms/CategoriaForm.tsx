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
interface CategoriaFormData {
  NomCategoria: string;
  Descricao: string;
  TipoCategoria: 'R' | 'D' | 'T';
  CodCategoriaPai: number | null;
  FlgAtivo: 'S' | 'N';
}

interface CategoriaFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  loading?: boolean;
  error?: string | null;
}

// Validation schema
const categoriaSchema = yup.object({
  NomCategoria: yup.string().required('validation.required').max(100, 'validation.max_length'),
  Descricao: yup.string().max(500, 'validation.max_length'),
  TipoCategoria: yup.string().oneOf(['R', 'D', 'T']).required('validation.required'),
  CodCategoriaPai: yup.number().nullable(),
  FlgAtivo: yup.string().oneOf(['S', 'N']).required('validation.required'),
});

export const CategoriaForm: React.FC<CategoriaFormProps> = ({
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
  } = useForm<CategoriaFormData>({
    resolver: yupResolver(categoriaSchema),
    defaultValues: {
      NomCategoria: '',
      Descricao: '',
      TipoCategoria: 'R',
      CodCategoriaPai: null,
      FlgAtivo: 'S',
    },
  });

  // Reset form when initialData changes or when closing
  useEffect(() => {
    if (open && initialData) {
      reset({
        NomCategoria: initialData.NomCategoria || '',
        Descricao: initialData.Descricao || '',
        TipoCategoria: initialData.TipoCategoria || 'R',
        CodCategoriaPai: initialData.CodCategoriaPai || null,
        FlgAtivo: initialData.FlgAtivo || 'S',
      });
    } else if (open && !initialData) {
      reset({
        NomCategoria: '',
        Descricao: '',
        TipoCategoria: 'R',
        CodCategoriaPai: null,
        FlgAtivo: 'S',
      });
    }
  }, [open, initialData, reset]);

  const handleClose = () => {
    onClose();
  };

  const handleFormSubmit = (data: CategoriaFormData) => {
    const formattedData = {
      ...data,
      CodCategoriaPai: data.CodCategoriaPai ? Number(data.CodCategoriaPai) : null,
    };
    
    onSubmit(formattedData);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? t('categorias.editar') : t('categorias.nova')}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Nome da Categoria */}
            <Grid item xs={12}>
              <Controller
                name="NomCategoria"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('categorias.nome')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Descrição */}
            <Grid item xs={12}>
              <Controller
                name="Descricao"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('categorias.descricao')}
                    multiline
                    rows={3}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Tipo de Categoria */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="TipoCategoria"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.TipoCategoria}>
                    <InputLabel>{t('categorias.tipo')}</InputLabel>
                    <Select {...field} label={t('categorias.tipo')}>
                      <MenuItem value="R">{t('categorias.receita')}</MenuItem>
                      <MenuItem value="D">{t('categorias.despesa')}</MenuItem>
                      <MenuItem value="T">{t('categorias.transferencia')}</MenuItem>
                    </Select>
                    {errors.TipoCategoria && (
                      <FormHelperText>{t(errors.TipoCategoria.message || '')}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Categoria Pai */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="CodCategoriaPai"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('categorias.categoria_pai')}
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