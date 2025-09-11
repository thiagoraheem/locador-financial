import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ShadCN UI Components
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// Types for the form - adjust to match yup schema exactly
interface LancamentoFormData {
  Data: Date;
  DataEmissao: Date;
  CodEmpresa?: number | null;
  idConta?: number | null;
  CodFavorecido: number;
  CodCategoria: number;
  Valor: number;
  IndMov: 'E' | 'S';
  NumDocto?: string;
  CodFormaPagto: number;
  FlgFrequencia: 'U' | 'R';
  Observacao?: string;
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

  const form = useForm<LancamentoFormData>({
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

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = form;

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
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('lancamentos.editar') : t('lancamentos.novo')}
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de Movimento */}
                <FormField
                  control={control}
                  name="IndMov"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('lancamentos.tipo')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="E">{t('lancamentos.entrada')}</SelectItem>
                          <SelectItem value="S">{t('lancamentos.saida')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Data */}
                <FormField
                  control={control}
                  name="Data"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('lancamentos.data')}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>{t('lancamentos.selecionar_data')}</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Data de Emissão */}
                <FormField
                  control={control}
                  name="DataEmissao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('lancamentos.data_emissao')}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>{t('lancamentos.selecionar_data')}</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Valor */}
                <FormField
                  control={control}
                  name="Valor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('lancamentos.valor')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.01"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Favorecido */}
                <FormField
                  control={control}
                  name="CodFavorecido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('lancamentos.favorecido')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Categoria */}
                <FormField
                  control={control}
                  name="CodCategoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('lancamentos.categoria')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Forma de Pagamento */}
                <FormField
                  control={control}
                  name="CodFormaPagto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('lancamentos.forma_pagamento')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Frequência */}
                <FormField
                  control={control}
                  name="FlgFrequencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('lancamentos.frequencia')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="U">{t('lancamentos.unico')}</SelectItem>
                          <SelectItem value="R">{t('lancamentos.recorrente')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

            </div>

            {/* Número do Documento */}
            <FormField
              control={control}
              name="NumDocto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lancamentos.numero_documento')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Observações */}
            <FormField
              control={control}
              name="Observacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lancamentos.observacoes')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
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