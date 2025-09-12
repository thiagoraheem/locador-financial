import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';

// Types for the form - adjust to match yup schema exactly
interface ContaReceberFormData {
  CodEmpresa: number;
  CodCliente: number;
  idConta?: number | null;
  CodCategoria?: number | null;
  DataEmissao: Date | null;
  DataVencimento: Date | null;
  DataRecebimento?: Date | null;
  Valor: number;
  Status: 'A' | 'R' | 'V' | 'C';
  NumeroDocumento?: string;
  NumParcela?: number | null;
  TotalParcelas?: number | null;
  DiasAtraso?: number | null;
  FlgProtestado?: boolean;
  DataProtesto?: Date | null;
  Observacao?: string;
  NotaFiscal?: string;
  SerieNF?: string;
}

interface ContaReceberFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  loading?: boolean;
  error?: string | null;
}

// Validation schema
const contaReceberSchema = yup.object({
  CodEmpresa: yup.number().required('validation.required').positive('validation.positive_number'),
  CodCliente: yup.number().required('validation.required').positive('validation.positive_number'),
  idConta: yup.number().nullable().positive('validation.positive_number'),
  CodCategoria: yup.number().nullable().positive('validation.positive_number'),
  DataEmissao: yup.date().required('validation.required').nullable(),
  DataVencimento: yup.date().required('validation.required').nullable(),
  DataRecebimento: yup.date().nullable(),
  Valor: yup.number().required('validation.required').positive('validation.positive_number'),
  Status: yup.string().oneOf(['A', 'R', 'V', 'C']).required('validation.required'),
  NumeroDocumento: yup.string().max(50, 'validation.max_length'),
  NumParcela: yup.number().nullable().min(1, 'validation.positive_number'),
  TotalParcelas: yup.number().nullable().min(1, 'validation.positive_number'),
  DiasAtraso: yup.number().nullable().min(0, 'validation.positive_number'),
  FlgProtestado: yup.boolean(),
  DataProtesto: yup.date().nullable(),
  Observacao: yup.string().max(500, 'validation.max_length'),
  NotaFiscal: yup.string().max(20, 'validation.max_length'),
  SerieNF: yup.string().max(3, 'validation.max_length'),
});

export const ContaReceberForm: React.FC<ContaReceberFormProps> = ({
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
  } = useForm<ContaReceberFormData>({
    resolver: yupResolver(contaReceberSchema),
    defaultValues: {
      CodEmpresa: 0,
      CodCliente: 0,
      idConta: null,
      CodCategoria: null,
      DataEmissao: null,
      DataVencimento: null,
      DataRecebimento: null,
      Valor: 0,
      Status: 'A',
      NumeroDocumento: '',
      NumParcela: 1,
      TotalParcelas: 1,
      DiasAtraso: 0,
      FlgProtestado: false,
      DataProtesto: null,
      Observacao: '',
      NotaFiscal: '',
      SerieNF: '',
    },
  });

  // Reset form when initialData changes or when closing
  useEffect(() => {
    if (open && initialData) {
      reset({
        CodEmpresa: initialData.CodEmpresa || 0,
        CodCliente: initialData.CodCliente || 0,
        idConta: initialData.idConta || null,
        CodCategoria: initialData.CodCategoria || null,
        DataEmissao: initialData.DataEmissao ? new Date(initialData.DataEmissao) : null,
        DataVencimento: initialData.DataVencimento ? new Date(initialData.DataVencimento) : null,
        DataRecebimento: initialData.DataRecebimento ? new Date(initialData.DataRecebimento) : null,
        Valor: initialData.Valor || 0,
        Status: initialData.Status || 'A',
        NumeroDocumento: initialData.NumeroDocumento || '',
        NumParcela: initialData.NumParcela || 1,
        TotalParcelas: initialData.TotalParcelas || 1,
        DiasAtraso: initialData.DiasAtraso || 0,
        FlgProtestado: initialData.FlgProtestado || false,
        DataProtesto: initialData.DataProtesto ? new Date(initialData.DataProtesto) : null,
        Observacao: initialData.Observacao || '',
        NotaFiscal: initialData.NotaFiscal || '',
        SerieNF: initialData.SerieNF || '',
      });
    } else if (open && !initialData) {
      reset({
        CodEmpresa: 0,
        CodCliente: 0,
        idConta: null,
        CodCategoria: null,
        DataEmissao: null,
        DataVencimento: null,
        DataRecebimento: null,
        Valor: 0,
        Status: 'A',
        NumeroDocumento: '',
        NumParcela: 1,
        TotalParcelas: 1,
        DiasAtraso: 0,
        FlgProtestado: false,
        DataProtesto: null,
        Observacao: '',
        NotaFiscal: '',
        SerieNF: '',
      });
    }
  }, [open, initialData, reset]);

  const handleClose = () => {
    onClose();
  };

  const handleFormSubmit = (data: ContaReceberFormData) => {
    const formattedData = {
      ...data,
      CodEmpresa: Number(data.CodEmpresa),
      CodCliente: Number(data.CodCliente),
      idConta: data.idConta ? Number(data.idConta) : null,
      CodCategoria: data.CodCategoria ? Number(data.CodCategoria) : null,
      DataEmissao: data.DataEmissao ? data.DataEmissao.toISOString().split('T')[0] : null,
      DataVencimento: data.DataVencimento ? data.DataVencimento.toISOString().split('T')[0] : null,
      DataRecebimento: data.DataRecebimento ? data.DataRecebimento.toISOString().split('T')[0] : null,
      DataProtesto: data.DataProtesto ? data.DataProtesto.toISOString().split('T')[0] : null,
      Valor: Number(data.Valor),
      NumParcela: data.NumParcela ? Number(data.NumParcela) : null,
      TotalParcelas: data.TotalParcelas ? Number(data.TotalParcelas) : null,
      DiasAtraso: data.DiasAtraso ? Number(data.DiasAtraso) : null,
    };
    
    onSubmit(formattedData);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t('contas_receber.editar') : t('contas_receber.nova')}
            </DialogTitle>
          </DialogHeader>
          
          {error && (
            <Alert className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Empresa and Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="CodEmpresa">{t('contas.empresa')}</Label>
                  <Controller
                    name="CodEmpresa"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Input
                          {...field}
                          id="CodEmpresa"
                          type="number"
                          min="0"
                          className={error ? 'border-red-500' : ''}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                  <Label htmlFor="CodCliente">{t('contas_receber.cliente')}</Label>
                  <Controller
                    name="CodCliente"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Input
                          {...field}
                          id="CodCliente"
                          type="number"
                          min="0"
                          className={error ? 'border-red-500' : ''}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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

              {/* Conta Bancária and Categoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idConta">{t('contas.conta')}</Label>
                  <Controller
                    name="idConta"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Input
                          {...field}
                          id="idConta"
                          type="number"
                          min="0"
                          value={field.value || ''}
                          className={error ? 'border-red-500' : ''}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
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
                  <Label htmlFor="CodCategoria">{t('lancamentos.categoria')}</Label>
                  <Controller
                    name="CodCategoria"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Input
                          {...field}
                          id="CodCategoria"
                          type="number"
                          min="0"
                          value={field.value || ''}
                          className={error ? 'border-red-500' : ''}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
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

              {/* Data de Emissão */}
              <div className="space-y-2">
                <Label htmlFor="DataEmissao">{t('lancamentos.data_emissao')}</Label>
                <Controller
                  name="DataEmissao"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Input
                        {...field}
                        id="DataEmissao"
                        type="date"
                        className={error ? "border-red-500" : ""}
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                      />
                      {error && (
                        <p className="text-sm text-red-500 mt-1">{t(error.message || '')}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Data de Vencimento */}
              <div className="space-y-2">
                <Label htmlFor="DataVencimento">{t('contas_receber.data_vencimento')}</Label>
                <Controller
                  name="DataVencimento"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Input
                        {...field}
                        id="DataVencimento"
                        type="date"
                        className={error ? "border-red-500" : ""}
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                      />
                      {error && (
                        <p className="text-sm text-red-500 mt-1">{t(error.message || '')}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Data de Recebimento */}
              <div className="space-y-2">
                <Label htmlFor="DataRecebimento">{t('contas_receber.data_recebimento')}</Label>
                <Controller
                  name="DataRecebimento"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Input
                        {...field}
                        id="DataRecebimento"
                        type="date"
                        className={error ? "border-red-500" : ""}
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                      />
                      {error && (
                        <p className="text-sm text-red-500 mt-1">{t(error.message || '')}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Valor */}
                <div className="space-y-2">
                  <Label htmlFor="Valor">{t('contas_receber.valor')}</Label>
                  <Controller
                    name="Valor"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Input
                          {...field}
                          id="Valor"
                          type="number"
                          min="0"
                          step="0.01"
                          value={field.value || ''}
                          className={error ? "border-red-500" : ""}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                        {error && (
                          <p className="text-sm text-red-500 mt-1">{t(error.message || '')}</p>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Número do Documento */}
                <div className="space-y-2">
                  <Label htmlFor="NumeroDocumento">{t('lancamentos.numero_documento')}</Label>
                  <Controller
                    name="NumeroDocumento"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Input
                          {...field}
                          id="NumeroDocumento"
                          value={field.value || ''}
                          className={error ? "border-red-500" : ""}
                        />
                        {error && (
                          <p className="text-sm text-red-500 mt-1">{t(error.message || '')}</p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nota Fiscal */}
                <div className="space-y-2">
                  <Label htmlFor="NotaFiscal">{t('contas_receber.nota_fiscal')}</Label>
                  <Controller
                    name="NotaFiscal"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Input
                          {...field}
                          id="NotaFiscal"
                          value={field.value || ''}
                          className={error ? "border-red-500" : ""}
                        />
                        {error && (
                          <p className="text-sm text-red-500 mt-1">{t(error.message || '')}</p>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Série NF */}
                <div className="space-y-2">
                  <Label htmlFor="SerieNF">{t('contas_receber.serie_nf')}</Label>
                  <Controller
                    name="SerieNF"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Input
                          {...field}
                          id="SerieNF"
                          value={field.value || ''}
                          className={error ? "border-red-500" : ""}
                        />
                        {error && (
                          <p className="text-sm text-red-500 mt-1">{t(error.message || '')}</p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Número da Parcela */}
                <div className="space-y-2">
                  <Label htmlFor="NumParcela">{t('contas_receber.parcial')}</Label>
                  <Controller
                    name="NumParcela"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Input
                          {...field}
                          id="NumParcela"
                          type="number"
                          min="1"
                          value={field.value || ''}
                          className={error ? "border-red-500" : ""}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                        />
                        {error && (
                          <p className="text-sm text-red-500 mt-1">{t(error.message || '')}</p>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Total de Parcelas */}
                <div className="space-y-2">
                  <Label htmlFor="TotalParcelas">{t('contas_receber.total_parcelas')}</Label>
                  <Controller
                    name="TotalParcelas"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Input
                          {...field}
                          id="TotalParcelas"
                          type="number"
                          min="1"
                          value={field.value || ''}
                          className={error ? "border-red-500" : ""}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                        />
                        {error && (
                          <p className="text-sm text-red-500 mt-1">{t(error.message || '')}</p>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Dias de Atraso */}
                <div className="space-y-2">
                  <Label htmlFor="DiasAtraso">{t('contas_receber.dias_atraso')}</Label>
                  <Controller
                    name="DiasAtraso"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Input
                          {...field}
                          id="DiasAtraso"
                          type="number"
                          min="0"
                          value={field.value || ''}
                          className={error ? "border-red-500" : ""}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                        {error && (
                          <p className="text-sm text-red-500 mt-1">{t(error.message || '')}</p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Protestado */}
                <div className="space-y-2">
                  <Controller
                    name="FlgProtestado"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="FlgProtestado"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="FlgProtestado">{t('contas_receber.protestado')}</Label>
                      </div>
                    )}
                  />
                </div>

                {/* Data de Protesto */}
                <div className="space-y-2">
                  <Label htmlFor="DataProtesto">{t('contas_receber.data_protesto')}</Label>
                  <Controller
                    name="DataProtesto"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Input
                          {...field}
                          id="DataProtesto"
                          type="date"
                          className={error ? "border-red-500" : ""}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                        />
                        {error && (
                          <p className="text-sm text-red-500 mt-1">{t(error.message || '')}</p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="Status">{t('contas_receber.status')}</Label>
                  <Controller
                    name="Status"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={error ? "border-red-500" : ""}>
                            <SelectValue placeholder={t('contas_receber.status')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">{t('contas_receber.aberto')}</SelectItem>
                            <SelectItem value="R">{t('contas_receber.recebido')}</SelectItem>
                            <SelectItem value="V">{t('contas_receber.vencido')}</SelectItem>
                            <SelectItem value="C">{t('lancamentos.cancelado')}</SelectItem>
                          </SelectContent>
                        </Select>
                        {error && (
                          <p className="text-sm text-red-500 mt-1">{t(error.message || '')}</p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="Observacao">{t('lancamentos.observacoes')}</Label>
                <Controller
                  name="Observacao"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <textarea
                        {...field}
                        id="Observacao"
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder={t('lancamentos.observacoes')}
                      />
                      {error && (
                        <p className="text-sm text-red-500 mt-1">{t(error.message || '')}</p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          </form>
        </DialogContent>
        
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
      </Dialog>
  );
};