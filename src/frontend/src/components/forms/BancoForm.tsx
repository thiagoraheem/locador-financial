import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BancoResponse } from '@/services/bancosApi';

// Types for the form
interface BancoFormData {
  Codigo: number;
  Digito: string;
  Nome: string;
  NomeAbreviado: string;
  FlgAtivo: 'S' | 'N';
}

interface BancoFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: BancoResponse | null;
  loading?: boolean;
  error?: string | null;
}

// Validation schema
const bancoSchema = yup.object({
  Codigo: yup.number().required('validation.required').min(1, 'validation.min_value'),
  Digito: yup.string().required('validation.required').max(2, 'validation.max_length'),
  Nome: yup.string().required('validation.required').max(100, 'validation.max_length'),
  NomeAbreviado: yup.string().required('validation.required').max(20, 'validation.max_length'),
  FlgAtivo: yup.string().oneOf(['S', 'N']).required('validation.required'),
});

export const BancoForm: React.FC<BancoFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading = false,
  error = null,
}) => {
  const { t } = useTranslation();
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<BancoFormData>({
    resolver: yupResolver(bancoSchema),
    mode: 'onChange',
    defaultValues: {
      Codigo: 0,
      Digito: '',
      Nome: '',
      NomeAbreviado: '',
      FlgAtivo: 'S',
    },
  });

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open && initialData) {
      reset({
        Codigo: initialData.Codigo || 0,
        Digito: initialData.Digito || '',
        Nome: initialData.Nome || '',
        NomeAbreviado: initialData.NomeAbreviado || '',
        FlgAtivo: initialData.FlgAtivo || 'S',
      });
    } else if (open && !initialData) {
      reset({
        Codigo: 0,
        Digito: '',
        Nome: '',
        NomeAbreviado: '',
        FlgAtivo: 'S',
      });
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = (data: BancoFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? t('bancos.editar') : t('bancos.novo')}
          </DialogTitle>
          <DialogDescription>
            {initialData 
              ? t('bancos.editar_descricao') 
              : t('bancos.novo_descricao')
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Código do Banco */}
            <div className="space-y-2">
              <Label htmlFor="Codigo">{t('bancos.codigo')}</Label>
              <Controller
                name="Codigo"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      className={error ? 'border-red-500' : ''}
                    />
                    {error && (
                      <p className="text-sm text-red-500">{t(error.message || '')}</p>
                    )}
                  </>
                )}
              />
            </div>

            {/* Dígito */}
            <div className="space-y-2">
              <Label htmlFor="Digito">{t('bancos.digito')}</Label>
              <Controller
                name="Digito"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <Input
                      {...field}
                      maxLength={2}
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

          {/* Nome do Banco */}
          <div className="space-y-2">
            <Label htmlFor="Nome">{t('bancos.nome')}</Label>
            <Controller
              name="Nome"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Input
                    {...field}
                    maxLength={100}
                    className={error ? 'border-red-500' : ''}
                  />
                  {error && (
                    <p className="text-sm text-red-500">{t(error.message || '')}</p>
                  )}
                </>
              )}
            />
          </div>

          {/* Nome Abreviado */}
          <div className="space-y-2">
            <Label htmlFor="NomeAbreviado">{t('bancos.nome_abreviado')}</Label>
            <Controller
              name="NomeAbreviado"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Input
                    {...field}
                    maxLength={20}
                    className={error ? 'border-red-500' : ''}
                  />
                  {error && (
                    <p className="text-sm text-red-500">{t(error.message || '')}</p>
                  )}
                </>
              )}
            />
          </div>

          {/* Status Ativo */}
          <div className="flex items-center space-x-2">
            <Controller
              name="FlgAtivo"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value === 'S'}
                  onCheckedChange={(checked: boolean) => field.onChange(checked ? 'S' : 'N')}
                />
              )}
            />
            <Label>{t('bancos.ativo')}</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit" disabled={!isValid || loading}>
              {loading ? t('actions.saving') : t('actions.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};