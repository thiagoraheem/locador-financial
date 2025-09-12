import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { AccountsReceivableResponse } from '../../services/contasReceberApi';

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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

// Types for the form - adjust to match yup schema exactly
interface RecebimentoContaReceberFormData {
  CodAccountsReceivable: number;
  idConta?: number | null;
  CodFormaPagto?: number | null;
  DataRecebimento: Date | null;
  ValorRecebido: number;
  Desconto?: number;
  Juros?: number;
  Multa?: number;
  NumeroDocumento?: string;
  Observacao?: string;
}

interface RecebimentoContaReceberFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  contaReceber: AccountsReceivableResponse;
  loading?: boolean;
  error?: string | null;
}

// Validation schema
const recebimentoContaReceberSchema = yup.object({
  CodAccountsReceivable: yup.number().required('validation.required').positive('validation.positive_number'),
  idConta: yup.number().nullable().optional().positive('validation.positive_number'),
  CodFormaPagto: yup.number().nullable().optional().positive('validation.positive_number'),
  DataRecebimento: yup.date().required('validation.required').nullable(),
  ValorRecebido: yup.number().required('validation.required').positive('validation.positive_number'),
  Desconto: yup.number().optional().min(0, 'validation.positive_number'),
  Juros: yup.number().optional().min(0, 'validation.positive_number'),
  Multa: yup.number().optional().min(0, 'validation.positive_number'),
  NumeroDocumento: yup.string().optional().max(50, 'validation.max_length'),
  Observacao: yup.string().optional().max(500, 'validation.max_length'),
});

export const RecebimentoContaReceberForm: React.FC<RecebimentoContaReceberFormProps> = ({
  open,
  onClose,
  onSubmit,
  contaReceber,
  loading = false,
  error = null,
}) => {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<RecebimentoContaReceberFormData>({
    resolver: yupResolver(recebimentoContaReceberSchema),
    defaultValues: {
      CodAccountsReceivable: contaReceber.CodAccountsReceivable,
      idConta: contaReceber.idConta || null,
      CodFormaPagto: null,
      DataRecebimento: new Date(),
      ValorRecebido: contaReceber.Valor - (contaReceber.ValorRecebido || 0),
      Desconto: 0,
      Juros: 0,
      Multa: 0,
      NumeroDocumento: '',
      Observacao: '',
    },
  });

  // Reset form when contaReceber changes
  useEffect(() => {
    if (open && contaReceber) {
      reset({
        CodAccountsReceivable: contaReceber.CodAccountsReceivable,
        idConta: contaReceber.idConta || null,
        CodFormaPagto: null,
        DataRecebimento: new Date(),
        ValorRecebido: contaReceber.Valor - (contaReceber.ValorRecebido || 0),
        Desconto: 0,
        Juros: 0,
        Multa: 0,
        NumeroDocumento: '',
        Observacao: '',
      });
    }
  }, [open, contaReceber, reset]);

  const handleClose = () => {
    onClose();
  };

  const handleFormSubmit = (data: RecebimentoContaReceberFormData) => {
    const formattedData = {
      ...data,
      CodAccountsReceivable: Number(data.CodAccountsReceivable),
      idConta: data.idConta ? Number(data.idConta) : null,
      CodFormaPagto: data.CodFormaPagto ? Number(data.CodFormaPagto) : null,
      DataRecebimento: data.DataRecebimento ? data.DataRecebimento.toISOString().split('T')[0] : null,
      ValorRecebido: Number(data.ValorRecebido),
      Desconto: data.Desconto ? Number(data.Desconto) : 0,
      Juros: data.Juros ? Number(data.Juros) : 0,
      Multa: data.Multa ? Number(data.Multa) : 0,
    };
    
    onSubmit(formattedData);
  };

  // Watch form values for calculations
  const desconto = watch('Desconto', 0);
  const juros = watch('Juros', 0);
  const multa = watch('Multa', 0);
  const valorOriginal = contaReceber.Valor;
  const valorRecebido = watch('ValorRecebido', 0);
  const valorAReceber = valorOriginal - (contaReceber.ValorRecebido || 0);
  const valorTotal = valorOriginal + (juros || 0) + (multa || 0) - (desconto || 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('contas_receber.registrar_recebimento')}</DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Conta information */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">
            {t('contas_receber.informacoes_conta')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <span className="font-medium">{t('contas_receber.cliente')}:</span> {contaReceber.cliente_nome}
            </div>
            <div>
              <span className="font-medium">{t('lancamentos.numero_documento')}:</span> {contaReceber.NumeroDocumento || '-'}
            </div>
            <div>
              <span className="font-medium">{t('contas_receber.valor_original')}:</span> {`R$ ${(typeof valorOriginal === 'number' && !isNaN(valorOriginal) ? valorOriginal : 0).toFixed(2)}`.replace('.', ',')}
            </div>
            <div>
              <span className="font-medium">{t('contas_receber.valor_recebido')}:</span> {`R$ ${(typeof (contaReceber.ValorRecebido || 0) === 'number' && !isNaN(contaReceber.ValorRecebido || 0) ? (contaReceber.ValorRecebido || 0) : 0).toFixed(2)}`.replace('.', ',')}
            </div>
            <div>
              <span className="font-medium">{t('contas_receber.valor_a_receber')}:</span> {`R$ ${(typeof valorAReceber === 'number' && !isNaN(valorAReceber) ? valorAReceber : 0).toFixed(2)}`.replace('.', ',')}
            </div>
          </div>
        </div>
          
        <div>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data de Recebimento */}
              <FormField
                control={control}
                name="DataRecebimento"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('contas_receber.data_recebimento')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
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

              {/* Valor Recebido */}
              <FormField
                control={control}
                name="ValorRecebido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contas_receber.valor_recebido')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                        min="0"
                        placeholder="ID da conta"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Forma de Recebimento */}
              <FormField
                control={control}
                name="CodFormaPagto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contas_receber.forma_recebimento')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Código da forma de recebimento"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Desconto */}
              <FormField
                control={control}
                name="Desconto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contas_receber.desconto')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Juros */}
              <FormField
                control={control}
                name="Juros"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contas_receber.juros')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Multa */}
              <FormField
                control={control}
                name="Multa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contas_receber.multa')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Número do Documento */}
             <FormField
               control={control}
               name="NumeroDocumento"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>{t('lancamentos.numero_documento')}</FormLabel>
                   <FormControl>
                     <Input
                       {...field}
                       value={field.value || ''}
                       placeholder="Número do documento"
                     />
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
                     <Textarea
                       {...field}
                       value={field.value || ''}
                       placeholder="Observações"
                       rows={3}
                     />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />           
          </form>
        </div>
        <DialogFooter>
          <Button onClick={handleClose} disabled={loading} variant="outline">
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