import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

import {
  Button,
  Input,
  Label,
  Textarea,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Alert,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui';

// Types for the form - adjust to match yup schema exactly
interface ClienteFormData {
  DesCliente: string;
  RazaoSocial?: string;
  FlgTipoPessoa: 'F' | 'J';
  CPF?: string;
  RG?: string;
  CNPJ?: string;
  IE?: string;
  IM?: string;
  Endereco?: string;
  Bairro?: string;
  CEP?: string;
  Municipio?: string;
  Estado?: string;
  Telefone1?: string;
  Telefone2?: string;
  Email1?: string;
  Email2?: string;
  FlgLiberado?: boolean;
  FlgVIP?: boolean;
  FlgAtivo: 'S' | 'N';
  Observacoes?: string;
}

interface ClienteFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  loading?: boolean;
  error?: string | null;
}

// Validation schema
const clienteSchema = yup.object({
  DesCliente: yup.string().required('validation.required').max(100, 'validation.max_length'),
  RazaoSocial: yup.string().max(100, 'validation.max_length'),
  FlgTipoPessoa: yup.string().oneOf(['F', 'J']).required('validation.required'),
  CPF: yup.string().max(14, 'validation.max_length'),
  RG: yup.string().max(20, 'validation.max_length'),
  CNPJ: yup.string().max(18, 'validation.max_length'),
  IE: yup.string().max(20, 'validation.max_length'),
  IM: yup.string().max(20, 'validation.max_length'),
  Endereco: yup.string().max(100, 'validation.max_length'),
  Bairro: yup.string().max(50, 'validation.max_length'),
  CEP: yup.string().max(9, 'validation.max_length'),
  Municipio: yup.string().max(50, 'validation.max_length'),
  Estado: yup.string().max(2, 'validation.max_length'),
  Telefone1: yup.string().max(20, 'validation.max_length'),
  Telefone2: yup.string().max(20, 'validation.max_length'),
  Email1: yup.string().email('validation.email').max(100, 'validation.max_length'),
  Email2: yup.string().email('validation.email').max(100, 'validation.max_length'),
  FlgLiberado: yup.boolean(),
  FlgVIP: yup.boolean(),
  FlgAtivo: yup.string().oneOf(['S', 'N']).required('validation.required'),
  Observacoes: yup.string().max(500, 'validation.max_length'),
});

export const ClienteForm: React.FC<ClienteFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading = false,
  error = null,
}) => {
  const { t } = useTranslation();
  const isEditing = !!initialData;

  const form = useForm<ClienteFormData>({
    resolver: yupResolver(clienteSchema),
    defaultValues: {
      DesCliente: '',
      RazaoSocial: '',
      FlgTipoPessoa: 'F',
      CPF: '',
      RG: '',
      CNPJ: '',
      IE: '',
      IM: '',
      Endereco: '',
      Bairro: '',
      CEP: '',
      Municipio: '',
      Estado: '',
      Telefone1: '',
      Telefone2: '',
      Email1: '',
      Email2: '',
      FlgLiberado: true,
      FlgVIP: false,
      FlgAtivo: 'S',
      Observacoes: '',
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  // Reset form when initialData changes or when closing
  useEffect(() => {
    if (open && initialData) {
      reset({
        DesCliente: initialData.DesCliente || '',
        RazaoSocial: initialData.RazaoSocial || '',
        FlgTipoPessoa: initialData.FlgTipoPessoa || 'F',
        CPF: initialData.CPF || '',
        RG: initialData.RG || '',
        CNPJ: initialData.CNPJ || '',
        IE: initialData.IE || '',
        IM: initialData.IM || '',
        Endereco: initialData.Endereco || '',
        Bairro: initialData.Bairro || '',
        CEP: initialData.CEP || '',
        Municipio: initialData.Municipio || '',
        Estado: initialData.Estado || '',
        Telefone1: initialData.Telefone1 || '',
        Telefone2: initialData.Telefone2 || '',
        Email1: initialData.Email1 || '',
        Email2: initialData.Email2 || '',
        FlgLiberado: initialData.FlgLiberado || true,
        FlgVIP: initialData.FlgVIP || false,
        FlgAtivo: initialData.FlgAtivo || 'S',
        Observacoes: initialData.Observacoes || '',
      });
    } else if (open && !initialData) {
      reset({
        DesCliente: '',
        RazaoSocial: '',
        FlgTipoPessoa: 'F',
        CPF: '',
        RG: '',
        CNPJ: '',
        IE: '',
        IM: '',
        Endereco: '',
        Bairro: '',
        CEP: '',
        Municipio: '',
        Estado: '',
        Telefone1: '',
        Telefone2: '',
        Email1: '',
        Email2: '',
        FlgLiberado: true,
        FlgVIP: false,
        FlgAtivo: 'S',
        Observacoes: '',
      });
    }
  }, [open, initialData, reset]);

  const handleClose = () => {
    onClose();
  };

  const handleFormSubmit = (data: ClienteFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('clientes.editarCliente') : t('clientes.novoCliente')}
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert className="mb-4">
            {error}
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="md:col-span-2">
                <FormField
                  control={control}
                  name="DesCliente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('clientes.nome')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tipo de Pessoa */}
              <FormField
                control={control}
                name="FlgTipoPessoa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clientes.tipo_pessoa')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="F">{t('clientes.tipo_pessoa_f')}</SelectItem>
                        <SelectItem value="J">{t('clientes.tipo_pessoa_j')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Razão Social */}
              <FormField
                control={control}
                name="RazaoSocial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clientes.razao_social')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CPF */}
              <FormField
                control={control}
                name="CPF"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clientes.cpf')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* RG */}
              <FormField
                control={control}
                name="RG"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clientes.rg')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CNPJ */}
              <FormField
                control={control}
                name="CNPJ"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clientes.cnpj')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* IE */}
              <FormField
                control={control}
                name="IE"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clientes.ie')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* IM */}
              <FormField
                control={control}
                name="IM"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clientes.im')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Telefone 1 */}
              <FormField
                control={control}
                name="Telefone1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clientes.telefone1')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Telefone 2 */}
              <FormField
                control={control}
                name="Telefone2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clientes.telefone2')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email 1 */}
              <FormField
                control={control}
                name="Email1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clientes.email1')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email 2 */}
              <FormField
                control={control}
                name="Email2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clientes.email2')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Endereço */}
              <div className="md:col-span-2">
                <FormField
                  control={control}
                  name="Endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('clientes.endereco')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Bairro */}
              <FormField
                control={control}
                name="Bairro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clientes.bairro')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CEP */}
              <FormField
                control={control}
                name="CEP"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clientes.cep')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Município */}
              <FormField
                control={control}
                name="Municipio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clientes.municipio')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estado */}
              <FormField
                control={control}
                name="Estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clientes.estado')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Observações */}
              <div className="md:col-span-2">
                <FormField
                  control={control}
                  name="Observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('clientes.observacoes')}</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-[80px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Flags */}
              <FormField
                control={control}
                name="FlgLiberado"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t('clientes.liberado')}</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="FlgVIP"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t('clientes.vip')}</FormLabel>
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
                    <FormLabel>{t('clientes.ativo')}</FormLabel>
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
          </form>
        </Form>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          {t('common.cancelar')}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          onClick={handleSubmit(handleFormSubmit)}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('common.salvar')}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};