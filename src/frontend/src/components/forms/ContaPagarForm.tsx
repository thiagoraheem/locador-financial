import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Types for the form - adjust to match yup schema exactly
interface ContaPagarFormData {
  CodEmpresa: number;
  CodFornecedor: number;
  idConta?: number | null;
  CodCategoria?: number | null;
  DataEmissao: Date | null;
  DataVencimento: Date | null;
  Valor: number;
  Status: 'A' | 'P' | 'V' | 'C';
  NumeroDocumento?: string;
  NumParcela?: number | null;
  TotalParcelas?: number | null;
  Observacao?: string;
  CodigoBarras?: string;
  LinhaDigitavel?: string;
}

interface ContaPagarFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  loading?: boolean;
  error?: string | null;
}

// Validation schema
const contaPagarSchema = yup.object({
  CodEmpresa: yup.number().required('validation.required').positive('validation.positive_number'),
  CodFornecedor: yup.number().required('validation.required').positive('validation.positive_number'),
  idConta: yup.number().nullable().positive('validation.positive_number'),
  CodCategoria: yup.number().nullable().positive('validation.positive_number'),
  DataEmissao: yup.date().required('validation.required').nullable(),
  DataVencimento: yup.date().required('validation.required').nullable(),
  Valor: yup.number().required('validation.required').positive('validation.positive_number'),
  Status: yup.string().oneOf(['A', 'P', 'V', 'C']).required('validation.required'),
  NumeroDocumento: yup.string().max(50, 'validation.max_length'),
  NumParcela: yup.number().nullable().min(1, 'validation.positive_number'),
  TotalParcelas: yup.number().nullable().min(1, 'validation.positive_number'),
  Observacao: yup.string().max(500, 'validation.max_length'),
  CodigoBarras: yup.string().max(50, 'validation.max_length'),
  LinhaDigitavel: yup.string().max(100, 'validation.max_length'),
});

export const ContaPagarForm: React.FC<ContaPagarFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading = false,
  error = null,
}) => {
  const { t } = useTranslation();
  const isEditing = !!initialData;

  const form = useForm<ContaPagarFormData>({
    resolver: yupResolver(contaPagarSchema),
    defaultValues: {
      CodEmpresa: 0,
      CodFornecedor: 0,
      idConta: null,
      CodCategoria: null,
      DataEmissao: null,
      DataVencimento: null,
      Valor: 0,
      Status: 'A',
      NumeroDocumento: '',
      NumParcela: 1,
      TotalParcelas: 1,
      Observacao: '',
      CodigoBarras: '',
      LinhaDigitavel: '',
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
        CodEmpresa: initialData.CodEmpresa || 0,
        CodFornecedor: initialData.CodFornecedor || 0,
        idConta: initialData.idConta || null,
        CodCategoria: initialData.CodCategoria || null,
        DataEmissao: initialData.DataEmissao ? new Date(initialData.DataEmissao) : null,
        DataVencimento: initialData.DataVencimento ? new Date(initialData.DataVencimento) : null,
        Valor: initialData.Valor || 0,
        Status: initialData.Status || 'A',
        NumeroDocumento: initialData.NumeroDocumento || '',
        NumParcela: initialData.NumParcela || 1,
        TotalParcelas: initialData.TotalParcelas || 1,
        Observacao: initialData.Observacao || '',
        CodigoBarras: initialData.CodigoBarras || '',
        LinhaDigitavel: initialData.LinhaDigitavel || '',
      });
    } else if (open && !initialData) {
      reset({
        CodEmpresa: 0,
        CodFornecedor: 0,
        idConta: null,
        CodCategoria: null,
        DataEmissao: null,
        DataVencimento: null,
        Valor: 0,
        Status: 'A',
        NumeroDocumento: '',
        NumParcela: 1,
        TotalParcelas: 1,
        Observacao: '',
        CodigoBarras: '',
        LinhaDigitavel: '',
      });
    }
  }, [open, initialData, reset]);

  const handleClose = () => {
    onClose();
  };

  const handleFormSubmit = (data: ContaPagarFormData) => {
    const formattedData = {
      ...data,
      CodEmpresa: Number(data.CodEmpresa),
      CodFornecedor: Number(data.CodFornecedor),
      idConta: data.idConta ? Number(data.idConta) : null,
      CodCategoria: data.CodCategoria ? Number(data.CodCategoria) : null,
      DataEmissao: data.DataEmissao ? data.DataEmissao.toISOString().split('T')[0] : null,
      DataVencimento: data.DataVencimento ? data.DataVencimento.toISOString().split('T')[0] : null,
      Valor: Number(data.Valor),
      NumParcela: data.NumParcela ? Number(data.NumParcela) : null,
      TotalParcelas: data.TotalParcelas ? Number(data.TotalParcelas) : null,
    };
    
    onSubmit(formattedData);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('contas_pagar.editar') : t('contas_pagar.nova')}
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Empresa */}
              <FormField
                control={control}
                name="CodEmpresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contas.empresa')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fornecedor */}
              <FormField
                control={control}
                name="CodFornecedor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contas_pagar.fornecedor')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conta Bancária */}
               <FormField
                 control={control}
                 name="idConta"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>{t('contas.conta')}</FormLabel>
                     <FormControl>
                       <Input
                         type="number"
                         min={0}
                         {...field}
                         value={field.value || ''}
                         onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
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
                         type="number"
                         min={0}
                         {...field}
                         value={field.value || ''}
                         onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                       />
                     </FormControl>
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
                               format(field.value, "PPP", { locale: ptBR })
                             ) : (
                               <span>{t('lancamentos.selecionar_data')}</span>
                             )}
                             <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                           </Button>
                         </FormControl>
                       </PopoverTrigger>
                       <PopoverContent className="w-auto p-0" align="start">
                         <Calendar
                           mode="single"
                           selected={field.value || undefined}
                           onSelect={field.onChange}
                           disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                           initialFocus
                         />
                       </PopoverContent>
                     </Popover>
                     <FormMessage />
                   </FormItem>
                 )}
               />

               {/* Data de Vencimento */}
               <FormField
                 control={control}
                 name="DataVencimento"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>{t('contas_pagar.data_vencimento')}</FormLabel>
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
                               format(field.value, "PPP", { locale: ptBR })
                             ) : (
                               <span>{t('contas_pagar.selecionar_data_vencimento')}</span>
                             )}
                             <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                           </Button>
                         </FormControl>
                       </PopoverTrigger>
                       <PopoverContent className="w-auto p-0" align="start">
                         <Calendar
                           mode="single"
                           selected={field.value || undefined}
                           onSelect={field.onChange}
                           disabled={(date) => date < new Date("1900-01-01")}
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
                     <FormLabel>{t('contas_pagar.valor')}</FormLabel>
                     <FormControl>
                       <Input
                         type="number"
                         min={0}
                         step={0.01}
                         {...field}
                         onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                       />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />

               {/* Número do Documento */}
               <FormField
                 control={control}
                 name="NumeroDocumento"
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

               {/* Número da Parcela */}
               <FormField
                 control={control}
                 name="NumParcela"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>{t('contas_pagar.num_parcela')}</FormLabel>
                     <FormControl>
                       <Input
                         type="number"
                         min={1}
                         {...field}
                         value={field.value || ''}
                         onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                       />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />

               {/* Total de Parcelas */}
               <FormField
                 control={control}
                 name="TotalParcelas"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>{t('contas_pagar.total_parcelas')}</FormLabel>
                     <FormControl>
                       <Input
                         type="number"
                         min={1}
                         {...field}
                         value={field.value || ''}
                         onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                       />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />

              {/* Status */}
               <FormField
                 control={control}
                 name="Status"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>{t('contas_pagar.status')}</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                         <SelectTrigger>
                           <SelectValue placeholder={t('contas_pagar.selecionar_status')} />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         <SelectItem value="A">{t('contas_pagar.aberto')}</SelectItem>
                         <SelectItem value="P">{t('contas_pagar.pago')}</SelectItem>
                         <SelectItem value="V">{t('contas_pagar.vencido')}</SelectItem>
                         <SelectItem value="C">{t('lancamentos.cancelado')}</SelectItem>
                       </SelectContent>
                     </Select>
                     <FormMessage />
                   </FormItem>
                 )}
               />

               {/* Código de Barras */}
               <FormField
                 control={control}
                 name="CodigoBarras"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>{t('contas_pagar.codigo_barras')}</FormLabel>
                     <FormControl>
                       <Input {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />

               {/* Linha Digitável */}
               <FormField
                 control={control}
                 name="LinhaDigitavel"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>{t('contas_pagar.linha_digitavel')}</FormLabel>
                     <FormControl>
                       <Input {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />

               {/* Observações */}
               <div className="col-span-full">
                 <FormField
                   control={control}
                   name="Observacao"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>{t('lancamentos.observacoes')}</FormLabel>
                       <FormControl>
                         <Textarea
                           rows={3}
                           {...field}
                         />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
               </div>
            </div>
          </form>
        </Form>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {t('actions.cancel')}
          </Button>
          <Button 
            type="submit"
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