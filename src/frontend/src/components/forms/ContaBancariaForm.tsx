import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Loader2 } from 'lucide-react';

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
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// Types for the form - adjust to match yup schema exactly
interface ContaBancariaFormData {
  CodEmpresa: number;
  Banco: number;
  Agencia: string;
  AgenciaDigito?: string;
  Conta: string;
  ContaDigito?: string;
  NomConta: string;
  TipoConta: 'CC' | 'CP' | 'CS';
  Saldo: number;
  FlgContaPadrao?: boolean;
  FlgAtivo: 'S' | 'N';
  TipoPix?: string;
  ValorPix?: string;
  EnableAPI?: boolean;
  ConfiguracaoAPI?: string;
  TokenAPI?: string;
}

interface ContaBancariaFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  loading?: boolean;
  error?: string | null;
}

// Validation schema
const contaBancariaSchema = yup.object({
  CodEmpresa: yup.number().required('validation.required').positive('validation.positive_number'),
  Banco: yup.number().required('validation.required').positive('validation.positive_number'),
  Agencia: yup.string().required('validation.required').max(10, 'validation.max_length'),
  AgenciaDigito: yup.string().max(2, 'validation.max_length'),
  Conta: yup.string().required('validation.required').max(20, 'validation.max_length'),
  ContaDigito: yup.string().max(2, 'validation.max_length'),
  NomConta: yup.string().required('validation.required').max(100, 'validation.max_length'),
  TipoConta: yup.string().oneOf(['CC', 'CP', 'CS']).required('validation.required'),
  Saldo: yup.number().required('validation.required').min(0, 'validation.positive_number'),
  FlgContaPadrao: yup.boolean(),
  FlgAtivo: yup.string().oneOf(['S', 'N']).required('validation.required'),
  TipoPix: yup.string().max(50, 'validation.max_length'),
  ValorPix: yup.string().max(100, 'validation.max_length'),
  EnableAPI: yup.boolean(),
  ConfiguracaoAPI: yup.string().max(500, 'validation.max_length'),
  TokenAPI: yup.string().max(500, 'validation.max_length'),
});

export const ContaBancariaForm: React.FC<ContaBancariaFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading = false,
  error = null,
}) => {
  const { t } = useTranslation();
  const isEditing = !!initialData;

  const form = useForm<ContaBancariaFormData>({
    resolver: yupResolver(contaBancariaSchema),
    defaultValues: {
      CodEmpresa: 0,
      Banco: 0,
      Agencia: '',
      AgenciaDigito: '',
      Conta: '',
      ContaDigito: '',
      NomConta: '',
      TipoConta: 'CC',
      Saldo: 0,
      FlgContaPadrao: false,
      FlgAtivo: 'S',
      TipoPix: '',
      ValorPix: '',
      EnableAPI: false,
      ConfiguracaoAPI: '',
      TokenAPI: '',
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
        Banco: initialData.Banco || 0,
        Agencia: initialData.Agencia || '',
        AgenciaDigito: initialData.AgenciaDigito || '',
        Conta: initialData.Conta || '',
        ContaDigito: initialData.ContaDigito || '',
        NomConta: initialData.NomConta || '',
        TipoConta: initialData.TipoConta || 'CC',
        Saldo: initialData.Saldo || 0,
        FlgContaPadrao: initialData.FlgContaPadrao || false,
        FlgAtivo: initialData.FlgAtivo || 'S',
        TipoPix: initialData.TipoPix || '',
        ValorPix: initialData.ValorPix || '',
        EnableAPI: initialData.EnableAPI || false,
        ConfiguracaoAPI: initialData.ConfiguracaoAPI || '',
        TokenAPI: initialData.TokenAPI || '',
      });
    } else if (open && !initialData) {
      reset({
        CodEmpresa: 0,
        Banco: 0,
        Agencia: '',
        AgenciaDigito: '',
        Conta: '',
        ContaDigito: '',
        NomConta: '',
        TipoConta: 'CC',
        Saldo: 0,
        FlgContaPadrao: false,
        FlgAtivo: 'S',
        TipoPix: '',
        ValorPix: '',
        EnableAPI: false,
        ConfiguracaoAPI: '',
        TokenAPI: '',
      });
    }
  }, [open, initialData, reset]);

  const handleClose = () => {
    onClose();
  };

  const handleFormSubmit = (data: ContaBancariaFormData) => {
    const formattedData = {
      ...data,
      CodEmpresa: Number(data.CodEmpresa),
      Banco: Number(data.Banco),
      Saldo: Number(data.Saldo),
    };
    
    onSubmit(formattedData);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('contas.editar') : t('contas.nova')}
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
                        {...field}
                        type="number"
                        min="0"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Banco */}
              <FormField
                control={control}
                name="Banco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contas.banco')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

            {/* Nome da Conta */}
            <FormField
              control={control}
              name="NomConta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('contas.nome_conta')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Agência */}
              <FormField
                control={control}
                name="Agencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contas.agencia')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dígito da Agência */}
              <FormField
                control={control}
                name="AgenciaDigito"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contas.agencia')} {t('contas.digito')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conta */}
              <FormField
                control={control}
                name="Conta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contas.conta')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dígito da Conta */}
              <FormField
                control={control}
                name="ContaDigito"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contas.conta')} {t('contas.digito')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tipo de Conta */}
              <FormField
                control={control}
                name="TipoConta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contas.tipo_conta')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CC">{t('contas.tipo_conta_cc')}</SelectItem>
                        <SelectItem value="CP">{t('contas.tipo_conta_cp')}</SelectItem>
                        <SelectItem value="CS">{t('contas.tipo_conta_cs')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Saldo */}
              <FormField
                control={control}
                name="Saldo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contas.saldo')}</FormLabel>
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

              {/* Conta Padrão */}
              <FormField
                control={control}
                name="FlgContaPadrao"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t('contas.conta_padrao')}</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={control}
                name="FlgAtivo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contas.ativo')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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

            </div>

            {/* PIX Configuration - Expandable section */}
            <div className="col-span-2">
              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-muted rounded-lg hover:bg-muted/80">
                  <span className="font-medium">{t('contas.pix_config')}</span>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tipo PIX */}
                    <FormField
                      control={control}
                      name="TipoPix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('contas.tipo_pix')}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('contas.selecione')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">{t('contas.selecione')}</SelectItem>
                              <SelectItem value="CPF">{t('contas.cpf')}</SelectItem>
                              <SelectItem value="CNPJ">{t('contas.cnpj')}</SelectItem>
                              <SelectItem value="EMAIL">{t('contas.email')}</SelectItem>
                              <SelectItem value="TELEFONE">{t('contas.telefone')}</SelectItem>
                              <SelectItem value="CHAVE_ALEATORIA">{t('contas.chave_aleatoria')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Valor PIX */}
                    <FormField
                      control={control}
                      name="ValorPix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('contas.valor_pix')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* API Configuration - Expandable section */}
            <div className="col-span-2">
              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-muted rounded-lg hover:bg-muted/80">
                  <span className="font-medium">{t('contas.config_api')}</span>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 p-4">
                  <div className="space-y-4">
                    {/* Enable API */}
                    <FormField
                      control={control}
                      name="EnableAPI"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>{t('contas.enable_api')}</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Configuração API */}
                    <FormField
                      control={control}
                      name="ConfiguracaoAPI"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('contas.config_api')}</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Token API */}
                    <FormField
                      control={control}
                      name="TokenAPI"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Token</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CollapsibleContent>
               </Collapsible>
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