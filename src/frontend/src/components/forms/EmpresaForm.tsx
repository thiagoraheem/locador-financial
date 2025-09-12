import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('empresas.editar') : t('empresas.nova')}
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Nome Fantasia */}
            <div className="space-y-2">
              <Label htmlFor="NomEmpresa">{t('empresas.nome_fantasia')}</Label>
              <Controller
                name="NomEmpresa"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Input
                      {...field}
                      id="NomEmpresa"
                      className={error ? 'border-red-500' : ''}
                    />
                    {error && (
                      <p className="text-sm text-red-500 mt-1">
                        {t(error.message || '')}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Razão Social */}
            <div className="space-y-2">
              <Label htmlFor="RazaoSocial">{t('empresas.razao_social')}</Label>
              <Controller
                name="RazaoSocial"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Input
                      {...field}
                      id="RazaoSocial"
                      className={error ? 'border-red-500' : ''}
                    />
                    {error && (
                      <p className="text-sm text-red-500 mt-1">
                        {t(error.message || '')}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* CNPJ and Telefone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="CNPJ">{t('empresas.cnpj')}</Label>
                <Controller
                  name="CNPJ"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Input
                        {...field}
                        id="CNPJ"
                        className={error ? 'border-red-500' : ''}
                      />
                      {error && (
                        <p className="text-sm text-red-500 mt-1">
                          {t(error.message || '')}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="Telefone">{t('empresas.telefone')}</Label>
                <Controller
                  name="Telefone"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Input
                        {...field}
                        id="Telefone"
                        className={error ? 'border-red-500' : ''}
                      />
                      {error && (
                        <p className="text-sm text-red-500 mt-1">
                          {t(error.message || '')}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="Email">{t('empresas.email')}</Label>
              <Controller
                name="Email"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Input
                      {...field}
                      id="Email"
                      type="email"
                      className={error ? 'border-red-500' : ''}
                    />
                    {error && (
                      <p className="text-sm text-red-500 mt-1">
                        {t(error.message || '')}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Endereço */}
            <div className="space-y-2">
              <Label htmlFor="Endereco">{t('empresas.endereco')}</Label>
              <Controller
                name="Endereco"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Input
                      {...field}
                      id="Endereco"
                      className={error ? 'border-red-500' : ''}
                    />
                    {error && (
                      <p className="text-sm text-red-500 mt-1">
                        {t(error.message || '')}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Address fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="Bairro">{t('empresas.bairro')}</Label>
                <Controller
                  name="Bairro"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Input
                        {...field}
                        id="Bairro"
                        className={error ? 'border-red-500' : ''}
                      />
                      {error && (
                        <p className="text-sm text-red-500 mt-1">
                          {t(error.message || '')}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="CEP">{t('empresas.cep')}</Label>
                <Controller
                  name="CEP"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Input
                        {...field}
                        id="CEP"
                        className={error ? 'border-red-500' : ''}
                      />
                      {error && (
                        <p className="text-sm text-red-500 mt-1">
                          {t(error.message || '')}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="Municipio">{t('empresas.municipio')}</Label>
                <Controller
                  name="Municipio"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Input
                        {...field}
                        id="Municipio"
                        className={error ? 'border-red-500' : ''}
                      />
                      {error && (
                        <p className="text-sm text-red-500 mt-1">
                          {t(error.message || '')}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="Estado">{t('empresas.estado')}</Label>
                <Controller
                  name="Estado"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Input
                        {...field}
                        id="Estado"
                        className={error ? 'border-red-500' : ''}
                      />
                      {error && (
                        <p className="text-sm text-red-500 mt-1">
                          {t(error.message || '')}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Checkbox fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Controller
                  name="FlgPadrao"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Checkbox
                        id="FlgPadrao"
                        checked={field.value || false}
                        onCheckedChange={(checked) => field.onChange(checked)}
                      />
                      <Label htmlFor="FlgPadrao">{t('empresas.empresaPadrao')}</Label>
                    </>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="FlgAtivo">{t('empresas.ativo')}</Label>
                <Controller
                  name="FlgAtivo"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={error ? 'border-red-500' : ''}>
                          <SelectValue placeholder={t('empresas.select_status')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="S">{t('categorias.ativo')}</SelectItem>
                          <SelectItem value="N">{t('categorias.inativo')}</SelectItem>
                        </SelectContent>
                      </Select>
                      {error && (
                        <p className="text-sm text-red-500 mt-1">
                          {t(error.message || '')}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? t('messages.saving') : t('actions.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};