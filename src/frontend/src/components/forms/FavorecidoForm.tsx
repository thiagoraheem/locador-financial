import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

// Types for the form - adjust to match yup schema exactly
interface FavorecidoFormData {
  NomFavorecido: string;
  TipoFavorecido: 'F' | 'J';
  CPF_CNPJ: string;
  Telefone?: string;
  Email?: string;
  Endereco?: string;
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('favorecidos.editar') : t('favorecidos.novo')}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Edite as informações do favorecido' : 'Preencha as informações do novo favorecido'}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Nome do Favorecido */}
          <div className="space-y-2">
            <Label htmlFor="NomFavorecido">{t('lancamentos.favorecido')}</Label>
            <Controller
              name="NomFavorecido"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Input
                    id="NomFavorecido"
                    {...field}
                    className={error ? 'border-red-500' : ''}
                  />
                  {error && (
                    <p className="text-sm text-red-500">{t(error.message || '')}</p>
                  )}
                </>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tipo de Favorecido */}
            <div className="space-y-2">
              <Label htmlFor="TipoFavorecido">{t('clientes.tipo_pessoa')}</Label>
              <Controller
                name="TipoFavorecido"
                control={control}
                render={({ field }) => (
                  <>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={errors.TipoFavorecido ? 'border-red-500' : ''}>
                        <SelectValue placeholder={t('clientes.tipo_pessoa')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="F">{t('clientes.tipo_pessoa_f')}</SelectItem>
                        <SelectItem value="J">{t('clientes.tipo_pessoa_j')}</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.TipoFavorecido && (
                      <p className="text-sm text-red-500">{t(errors.TipoFavorecido.message || '')}</p>
                    )}
                  </>
                )}
              />
            </div>

            {/* CPF/CNPJ */}
            <div className="space-y-2">
              <Label htmlFor="CPF_CNPJ">{t('clientes.cpf')}/{t('clientes.cnpj')}</Label>
              <Controller
                name="CPF_CNPJ"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <Input
                      id="CPF_CNPJ"
                      {...field}
                      className={error ? 'border-red-500' : ''}
                    />
                    {error && (
                      <p className="text-sm text-red-500">{t(error.message || '')}</p>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="Telefone">{t('clientes.telefone1')}</Label>
              <Controller
                name="Telefone"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <Input
                      id="Telefone"
                      {...field}
                      className={error ? 'border-red-500' : ''}
                    />
                    {error && (
                      <p className="text-sm text-red-500">{t(error.message || '')}</p>
                    )}
                  </>
                )}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="Email">{t('clientes.email1')}</Label>
              <Controller
                name="Email"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <Input
                      id="Email"
                      type="email"
                      {...field}
                      className={error ? 'border-red-500' : ''}
                    />
                    {error && (
                      <p className="text-sm text-red-500">{t(error.message || '')}</p>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <Label htmlFor="Endereco">{t('clientes.endereco')}</Label>
            <Controller
              name="Endereco"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Textarea
                    id="Endereco"
                    {...field}
                    rows={2}
                    className={error ? 'border-red-500' : ''}
                  />
                  {error && (
                    <p className="text-sm text-red-500">{t(error.message || '')}</p>
                  )}
                </>
              )}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="FlgAtivo">{t('categorias.ativo')}</Label>
            <Controller
              name="FlgAtivo"
              control={control}
              render={({ field }) => (
                <>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={errors.FlgAtivo ? 'border-red-500' : ''}>
                      <SelectValue placeholder={t('categorias.ativo')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="S">{t('categorias.ativo')}</SelectItem>
                      <SelectItem value="N">{t('categorias.inativo')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.FlgAtivo && (
                    <p className="text-sm text-red-500">{t(errors.FlgAtivo.message || '')}</p>
                  )}
                </>
              )}
            />
          </div>
        </form>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {t('actions.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit(handleFormSubmit)} 
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? t('messages.saving') : t('actions.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};