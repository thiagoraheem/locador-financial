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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';

// Types for the form
interface ContaBancariaFormData {
  CodEmpresa: number;
  Banco: number;
  Agencia: string;
  AgenciaDigito: string;
  Conta: string;
  ContaDigito: string;
  NomConta: string;
  TipoConta: 'CC' | 'CP' | 'CS';
  Saldo: number;
  FlgContaPadrao: boolean;
  FlgAtivo: 'S' | 'N';
  TipoPix: string;
  ValorPix: string;
  EnableAPI: boolean;
  ConfiguracaoAPI: string;
  TokenAPI: string;
}

interface ContaBancariaFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  loading?: boolean;
  error?: string | null;
}

// Validation schema
const contaBancariaSchema = yup.object({
  CodEmpresa: yup.number().required('validation.required').positive('validation.positive_number'),
  Banco: yup.number().required('validation.required').positive('validation.positive_number'),
  Agencia: yup.string().required('validation.required').max(10, 'validation.max_length'),
  AgenciaDigito: yup.string().max(2, 'validation.max_length'),
  Conta: yup.string().required('validation.required').max(20, 'validation.max_length'),
  ContaDigito: yup.string().max(2, 'validation.max_length'),
  NomConta: yup.string().required('validation.required').max(100, 'validation.max_length'),
  TipoConta: yup.string().oneOf(['CC', 'CP', 'CS']).required('validation.required'),
  Saldo: yup.number().required('validation.required').min(0, 'validation.positive_number'),
  FlgContaPadrao: yup.boolean(),
  FlgAtivo: yup.string().oneOf(['S', 'N']).required('validation.required'),
  TipoPix: yup.string().max(50, 'validation.max_length'),
  ValorPix: yup.string().max(100, 'validation.max_length'),
  EnableAPI: yup.boolean(),
  ConfiguracaoAPI: yup.string().max(500, 'validation.max_length'),
  TokenAPI: yup.string().max(500, 'validation.max_length'),
});

export const ContaBancariaForm: React.FC<ContaBancariaFormProps> = ({
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
  } = useForm<ContaBancariaFormData>({
    resolver: yupResolver(contaBancariaSchema),
    defaultValues: {
      CodEmpresa: 0,
      Banco: 0,
      Agencia: '',
      AgenciaDigito: '',
      Conta: '',
      ContaDigito: '',
      NomConta: '',
      TipoConta: 'CC',
      Saldo: 0,
      FlgContaPadrao: false,
      FlgAtivo: 'S',
      TipoPix: '',
      ValorPix: '',
      EnableAPI: false,
      ConfiguracaoAPI: '',
      TokenAPI: '',
    },
  });

  // Reset form when initialData changes or when closing
  useEffect(() => {
    if (open && initialData) {
      reset({
        CodEmpresa: initialData.CodEmpresa || 0,
        Banco: initialData.Banco || 0,
        Agencia: initialData.Agencia || '',
        AgenciaDigito: initialData.AgenciaDigito || '',
        Conta: initialData.Conta || '',
        ContaDigito: initialData.ContaDigito || '',
        NomConta: initialData.NomConta || '',
        TipoConta: initialData.TipoConta || 'CC',
        Saldo: initialData.Saldo || 0,
        FlgContaPadrao: initialData.FlgContaPadrao || false,
        FlgAtivo: initialData.FlgAtivo || 'S',
        TipoPix: initialData.TipoPix || '',
        ValorPix: initialData.ValorPix || '',
        EnableAPI: initialData.EnableAPI || false,
        ConfiguracaoAPI: initialData.ConfiguracaoAPI || '',
        TokenAPI: initialData.TokenAPI || '',
      });
    } else if (open && !initialData) {
      reset({
        CodEmpresa: 0,
        Banco: 0,
        Agencia: '',
        AgenciaDigito: '',
        Conta: '',
        ContaDigito: '',
        NomConta: '',
        TipoConta: 'CC',
        Saldo: 0,
        FlgContaPadrao: false,
        FlgAtivo: 'S',
        TipoPix: '',
        ValorPix: '',
        EnableAPI: false,
        ConfiguracaoAPI: '',
        TokenAPI: '',
      });
    }
  }, [open, initialData, reset]);

  const handleClose = () => {
    onClose();
  };

  const handleFormSubmit = (data: ContaBancariaFormData) => {
    const formattedData = {
      ...data,
      CodEmpresa: Number(data.CodEmpresa),
      Banco: Number(data.Banco),
      Saldo: Number(data.Saldo),
    };
    
    onSubmit(formattedData);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditing ? t('contas.editar') : t('contas.nova')}
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

            {/* Banco */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="Banco"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('contas.banco')}
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

            {/* Nome da Conta */}
            <Grid item xs={12}>
              <Controller
                name="NomConta"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('contas.nome_conta')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Agência */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="Agencia"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('contas.agencia')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Dígito da Agência */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="AgenciaDigito"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('contas.agencia') + ' ' + t('contas.digito')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Conta */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="Conta"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('contas.conta')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Dígito da Conta */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="ContaDigito"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('contas.conta') + ' ' + t('contas.digito')}
                    error={!!error}
                    helperText={error ? t(error.message || '') : null}
                  />
                )}
              />
            </Grid>

            {/* Tipo de Conta */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="TipoConta"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.TipoConta}>
                    <InputLabel>{t('contas.tipo_conta')}</InputLabel>
                    <Select {...field} label={t('contas.tipo_conta')}>
                      <MenuItem value="CC">{t('contas.tipo_conta_cc')}</MenuItem>
                      <MenuItem value="CP">{t('contas.tipo_conta_cp')}</MenuItem>
                      <MenuItem value="CS">{t('contas.tipo_conta_cs')}</MenuItem>
                    </Select>
                    {errors.TipoConta && (
                      <FormHelperText>{t(errors.TipoConta.message || '')}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Saldo */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="Saldo"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('contas.saldo')}
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

            {/* Conta Padrão */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="FlgContaPadrao"
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
                    label={t('contas.conta_padrao')}
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
                    <InputLabel>{t('contas.ativo')}</InputLabel>
                    <Select {...field} label={t('contas.ativo')}>
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

            {/* PIX Configuration - Expandable section */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{t('contas.pix')}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="TipoPix"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label={t('contas.tipo_pix')}
                            error={!!error}
                            helperText={error ? t(error.message || '') : null}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="ValorPix"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label={t('contas.valor_pix')}
                            error={!!error}
                            helperText={error ? t(error.message || '') : null}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* API Configuration - Expandable section */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{t('contas.config_api')}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Controller
                        name="EnableAPI"
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
                            label={t('contas.enable_api')}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name="ConfiguracaoAPI"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label={t('contas.config_api')}
                            multiline
                            rows={3}
                            error={!!error}
                            helperText={error ? t(error.message || '') : null}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name="TokenAPI"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="API Token"
                            multiline
                            rows={2}
                            error={!!error}
                            helperText={error ? t(error.message || '') : null}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
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