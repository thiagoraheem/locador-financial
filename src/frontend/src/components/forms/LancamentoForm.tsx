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
import { Label } from '@/components/ui/label';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  codigoBarras?: string;
  recorrencia?: 'none' | 'installments';
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
  codigoBarras: yup.string().max(100, 'validation.max_length'),
  recorrencia: yup.string().oneOf(['none', 'installments']),
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
    resolver: yupResolver(lancamentoSchema) as any,
    defaultValues: {
      Data: new Date(),
      DataEmissao: new Date(),
      CodEmpresa: null,
      idConta: null,
      CodFavorecido: 0,
      CodCategoria: 0,
      Valor: 0,
      IndMov: 'E' as const,
      NumDocto: '',
      CodFormaPagto: 0,
      FlgFrequencia: 'U' as const,
      Observacao: '',
      codigoBarras: '',
      recorrencia: 'none' as const,
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = form;

  const typedControl = control as any;

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
        IndMov: initialData.IndMov as 'E' | 'S',
        NumDocto: initialData.NumDocto || '',
        CodFormaPagto: initialData.CodFormaPagto,
        FlgFrequencia: initialData.FlgFrequencia as 'U' | 'R',
        Observacao: initialData.Observacao || '',
        codigoBarras: initialData.codigoBarras || '',
        recorrencia: (initialData.recorrencia || 'none') as 'none' | 'installments',
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
        IndMov: 'E' as const,
        NumDocto: '',
        CodFormaPagto: 0,
        FlgFrequencia: 'U' as const,
        Observacao: '',
        codigoBarras: '',
        recorrencia: 'none' as const,
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
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Main Data Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Company */}
                  <FormField
                    control={typedControl}
                    name="CodEmpresa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa:</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : null)} value={field.value?.toString() || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Empresa 1</SelectItem>
                            <SelectItem value="2">Empresa 2</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Movement Type */}
                  <FormField
                    control={typedControl}
                    name="IndMov"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo Movimento:</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="E" id="entrada" />
                              <Label htmlFor="entrada">Entrada</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="S" id="saida" />
                              <Label htmlFor="saida">Saída</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Recurrence */}
                  <FormField
                    control={typedControl}
                    name="recorrencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recorrência:</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Nenhuma</SelectItem>
                            <SelectItem value="installments">Parcelado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Data */}
                  <FormField
                    control={typedControl}
                    name="Data"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data:</FormLabel>
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
                                  <span>Selecionar data</span>
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
                    control={typedControl}
                    name="DataEmissao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Emissão:</FormLabel>
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
                                  <span>Selecionar data</span>
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
                    control={typedControl}
                    name="Valor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor:</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Valor Pago */}
                  <div className="space-y-2">
                    <Label htmlFor="valor-pago">Valor Pago:</Label>
                    <Input
                      id="valor-pago"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                    />
                  </div>
                </div>

                {/* Pagamento Confirmado e Data Confirmação */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pagamento Confirmado */}
                  <div className="space-y-2">
                    <Label htmlFor="pagamento-confirmado">Pagamento Confirmado:</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="pagamento-confirmado"
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="pagamento-confirmado" className="text-sm font-normal">
                        Confirmar pagamento
                      </Label>
                    </div>
                  </div>

                  {/* Data Confirmação */}
                  <div className="space-y-2">
                    <Label htmlFor="data-confirmacao">Data Confirmação:</Label>
                    <Input
                      id="data-confirmacao"
                      type="date"
                    />
                  </div>

                  {/* Número do Documento */}
                  <FormField
                    control={typedControl}
                    name="NumDocto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nº Documento:</FormLabel>
                        <FormControl>
                          <Input placeholder="Número do documento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Segunda linha - 3 colunas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Favorecido */}
                  <FormField
                    control={typedControl}
                    name="CodFavorecido"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Favorecido:</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="Código do favorecido" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Categoria */}
                  <FormField
                    control={typedControl}
                    name="CodCategoria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria:</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value) || 0)} value={field.value?.toString() || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecionar categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Receita</SelectItem>
                            <SelectItem value="2">Despesa</SelectItem>
                            <SelectItem value="3">Transferência</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Forma de Pagamento */}
                  <FormField
                    control={typedControl}
                    name="CodFormaPagto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Forma Pagamento:</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value) || 0)} value={field.value?.toString() || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecionar forma" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Dinheiro</SelectItem>
                            <SelectItem value="2">Cartão de Crédito</SelectItem>
                            <SelectItem value="3">Cartão de Débito</SelectItem>
                            <SelectItem value="4">Transferência Bancária</SelectItem>
                            <SelectItem value="5">PIX</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Terceira linha - 3 colunas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Frequência */}
                  <FormField
                    control={typedControl}
                    name="FlgFrequencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequência:</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecionar frequência" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="U">Única</SelectItem>
                            <SelectItem value="R">Recorrente</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Conta */}
                  <FormField
                    control={typedControl}
                    name="idConta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conta:</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="ID da conta" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Código de Barras */}
                  <FormField
                    control={typedControl}
                    name="codigoBarras"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código de Barras:</FormLabel>
                        <FormControl>
                          <Input placeholder="Código de barras" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Observações - linha completa */}
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={typedControl}
                    name="Observacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações:</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Observações adicionais"
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Campos de Auditoria */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Data Lançamento */}
                  <div className="space-y-2">
                    <Label htmlFor="data-lancamento">Data Lançamento:</Label>
                    <Input
                      id="data-lancamento"
                      type="date"
                      defaultValue={format(new Date(), 'yyyy-MM-dd')}
                      disabled
                    />
                  </div>

                  {/* Usuário Lançamento */}
                  <div className="space-y-2">
                    <Label htmlFor="usuario-lancamento">Usuário:</Label>
                    <Input
                      id="usuario-lancamento"
                      defaultValue="Admin"
                      disabled
                    />
                  </div>

                  {/* Data Alteração */}
                  <div className="space-y-2">
                    <Label htmlFor="data-alteracao">Data Alteração:</Label>
                    <Input
                      id="data-alteracao"
                      type="date"
                      disabled
                    />
                  </div>

                  {/* Usuário Alteração */}
                  <div className="space-y-2">
                    <Label htmlFor="usuario-alteracao">Usuário:</Label>
                    <Input
                      id="usuario-alteracao"
                      disabled
                    />
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Seção de Recorrência - Condicional */}
            {watch('FlgFrequencia') === 'R' && (
              <Card>
                <CardHeader>
                  <CardTitle>Recorrência</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Tipo de Recorrência */}
                    <div className="space-y-2">
                      <Label htmlFor="tipo-recorrencia">Tipo:</Label>
                      <Select defaultValue="mensal">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mensal">Mensal</SelectItem>
                          <SelectItem value="semanal">Semanal</SelectItem>
                          <SelectItem value="anual">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Valor da Parcela */}
                    <div className="space-y-2">
                      <Label htmlFor="valor-parcela">Valor da Parcela:</Label>
                      <Input
                        id="valor-parcela"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                      />
                    </div>

                    {/* Quantidade de Parcelas */}
                    <div className="space-y-2">
                      <Label htmlFor="qtd-parcelas">Qtd. Parcelas:</Label>
                      <Input
                        id="qtd-parcelas"
                        type="number"
                        min="1"
                        defaultValue="1"
                      />
                    </div>
                  </div>

                  {/* Tabela de Parcelas */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-3">Parcelas:</h4>
                    <div className="border rounded-md">
                      <div className="grid grid-cols-4 gap-4 p-3 bg-muted/50 font-medium text-sm">
                        <div>Parcela</div>
                        <div>Vencimento</div>
                        <div>Valor</div>
                        <div>Status</div>
                      </div>
                      <div className="divide-y">
                        {/* Exemplo de parcela */}
                        <div className="grid grid-cols-4 gap-4 p-3 text-sm">
                          <div>1/1</div>
                          <div>{format(new Date(), 'dd/MM/yyyy')}</div>
                          <div>R$ 0,00</div>
                          <div>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              Pendente
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </Form>
        
        <DialogFooter className="flex justify-between items-center pt-6">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
            >
              Converter em Contas a Pagar
            </Button>
          </div>
          <div className="flex gap-2">
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
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};