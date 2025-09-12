import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { AccountsPayableResponse } from '../../services/contasPagarApi';

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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

// Types for the form - adjust to match yup schema exactly
interface PagamentoContaPagarFormData {
  CodAccountsPayable: number;
  idConta?: number | null;
  CodFormaPagto?: number | null;
  DataPagamento: Date | null;
  ValorPago: number;
  Desconto?: number;
  Juros?: number;
  Multa?: number;
  NumeroDocumento?: string;
  Observacao?: string;
}

interface PagamentoContaPagarFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  contaPagar: AccountsPayableResponse;
  loading?: boolean;
  error?: string | null;
}

// Validation schema
const pagamentoContaPagarSchema = yup.object({
  CodAccountsPayable: yup.number().required('validation.required').positive('validation.positive_number'),
  idConta: yup.number().nullable().optional().positive('validation.positive_number'),
  CodFormaPagto: yup.number().nullable().optional().positive('validation.positive_number'),
  DataPagamento: yup.date().required('validation.required').nullable(),
  ValorPago: yup.number().required('validation.required').positive('validation.positive_number'),
  Desconto: yup.number().optional().min(0, 'validation.positive_number'),
  Juros: yup.number().optional().min(0, 'validation.positive_number'),
  Multa: yup.number().optional().min(0, 'validation.positive_number'),
  NumeroDocumento: yup.string().optional().max(50, 'validation.max_length'),
  Observacao: yup.string().optional().max(500, 'validation.max_length'),
});

export const PagamentoContaPagarForm: React.FC<PagamentoContaPagarFormProps> = ({
  open,
  onClose,
  onSubmit,
  contaPagar,
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
  } = useForm<PagamentoContaPagarFormData>({
    resolver: yupResolver(pagamentoContaPagarSchema),
    defaultValues: {
      CodAccountsPayable: contaPagar.CodAccountsPayable,
      idConta: contaPagar.idConta || null,
      CodFormaPagto: null,
      DataPagamento: new Date(),
      ValorPago: contaPagar.Valor - (contaPagar.ValorPago || 0),
      Desconto: 0,
      Juros: 0,
      Multa: 0,
      NumeroDocumento: '',
      Observacao: '',
    },
  });

  // Reset form when contaPagar changes
  useEffect(() => {
    if (open && contaPagar) {
      reset({
        CodAccountsPayable: contaPagar.CodAccountsPayable,
        idConta: contaPagar.idConta || null,
        CodFormaPagto: null,
        DataPagamento: new Date(),
        ValorPago: contaPagar.Valor - (contaPagar.ValorPago || 0),
        Desconto: 0,
        Juros: 0,
        Multa: 0,
        NumeroDocumento: '',
        Observacao: '',
      });
    }
  }, [open, contaPagar, reset]);

  const handleClose = () => {
    onClose();
  };

  const handleFormSubmit = (data: PagamentoContaPagarFormData) => {
    const formattedData = {
      ...data,
      CodAccountsPayable: Number(data.CodAccountsPayable),
      idConta: data.idConta ? Number(data.idConta) : null,
      CodFormaPagto: data.CodFormaPagto ? Number(data.CodFormaPagto) : null,
      DataPagamento: data.DataPagamento ? data.DataPagamento.toISOString().split('T')[0] : null,
      ValorPago: Number(data.ValorPago),
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
  const valorOriginal = contaPagar.Valor;
  const valorPago = watch('ValorPago', 0);
  const valorAPagar = valorOriginal - (contaPagar.ValorPago || 0);
  const valorTotal = valorOriginal + (juros || 0) + (multa || 0) - (desconto || 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('contas_pagar.registrar_pagamento')}</DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Conta information */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">
            {t('contas_pagar.informacoes_conta')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <span className="font-medium">{t('contas_pagar.fornecedor')}:</span> {contaPagar.fornecedor_nome}
            </div>
            <div>
              <span className="font-medium">{t('lancamentos.numero_documento')}:</span> {contaPagar.NumeroDocumento || '-'}
            </div>
            <div>
              <span className="font-medium">{t('contas_pagar.valor_original')}:</span> {`R$ ${(typeof valorOriginal === 'number' && !isNaN(valorOriginal) ? valorOriginal : 0).toFixed(2)}`.replace('.', ',')}
            </div>
            <div>
              <span className="font-medium">{t('contas_pagar.valor_pago')}:</span> {`R$ ${(typeof (contaPagar.ValorPago || 0) === 'number' && !isNaN(contaPagar.ValorPago || 0) ? (contaPagar.ValorPago || 0) : 0).toFixed(2)}`.replace('.', ',')}
            </div>
            <div>
              <span className="font-medium">{t('contas_pagar.valor_a_pagar')}:</span> {`R$ ${(typeof valorAPagar === 'number' && !isNaN(valorAPagar) ? valorAPagar : 0).toFixed(2)}`.replace('.', ',')}
            </div>
          </div>
        </div>
          
        <div>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data Pagamento */}
              <FormField
                control={control}
                name="DataPagamento"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('contas_pagar.data_pagamento')} *</FormLabel>
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

              {/* Valor Pago */}
              <FormField
                control={control}
                name="ValorPago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contas_pagar.valor_pago')} *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        {...field}
                        value={field.value || ''}
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

              {/* Forma de Pagamento */}
              <FormField
                control={control}
                name="CodFormaPagto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contas_pagar.forma_pagamento')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Código da forma de pagamento"
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
                    <FormLabel>{t('contas_pagar.desconto')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
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
                    <FormLabel>{t('contas_pagar.juros')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
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
                    <FormLabel>{t('contas_pagar.multa')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Número do Documento */}
              <FormField
                control={control}
                name="NumeroDocumento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lancamentos.numero_documento')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Número do documento"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Observações */}
            <FormField
              control={control}
              name="Observacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lancamentos.observacoes')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre o pagamento"
                      className="min-h-[80px]"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </div>
        
        <DialogFooter>
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