import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';

// Types for the form - adjust to match yup schema exactly
interface CategoriaFormData {
  NomCategoria: string;
  Descricao?: string | null;
  TipoCategoria: 'R' | 'D' | 'T';
  CodCategoriaPai?: number | null;
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
  Descricao: yup.string().max(500, 'validation.max_length').nullable(),
  TipoCategoria: yup.string().oneOf(['R', 'D', 'T']).required('validation.required'),
  CodCategoriaPai: yup.number().nullable(),
  FlgAtivo: yup.string().oneOf(['S', 'N']).required('validation.required'),
}).required();

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

  const form = useForm<CategoriaFormData>({
    resolver: yupResolver(categoriaSchema),
    defaultValues: {
      NomCategoria: '',
      Descricao: '',
      TipoCategoria: 'R',
      CodCategoriaPai: null,
      FlgAtivo: 'S',
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  // Reset form when initialData changes or when closing
  useEffect(() => {
    if (open && initialData) {
      reset({
        NomCategoria: initialData.NomCategoria || '',
        Descricao: initialData.Descricao || '',
        TipoCategoria: initialData.TipoCategoria || 'R',
        CodCategoriaPai: initialData.CodCategoriaPai !== undefined ? initialData.CodCategoriaPai : null,
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
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('categorias.editar') : t('categorias.nova')}
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Nome da Categoria */}
            <FormField
              control={control}
              name="NomCategoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('categorias.nome')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição */}
            <FormField
              control={control}
              name="Descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('categorias.descricao')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ''} className="min-h-[80px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de Categoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="TipoCategoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('categorias.tipo')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('categorias.tipo')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="R">{t('categorias.receita')}</SelectItem>
                        <SelectItem value="D">{t('categorias.despesa')}</SelectItem>
                        <SelectItem value="T">{t('categorias.transferencia')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Categoria Pai */}
              <FormField
                control={control}
                name="CodCategoriaPai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('categorias.categoria_pai')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <FormField
              control={control}
              name="FlgAtivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('categorias.ativo')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('categorias.ativo')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="S">{t('categorias.ativo')}</SelectItem>
                      <SelectItem value="N">{t('categorias.inativo')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            {t('actions.cancel')}
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            onClick={handleSubmit(handleFormSubmit)}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? t('messages.saving') : t('actions.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};