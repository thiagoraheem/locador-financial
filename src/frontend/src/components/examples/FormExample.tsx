import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormState, useUI } from '@/hooks/useUI';

interface FormData {
  name: string;
  email: string;
  amount: string;
}

const FormExample: React.FC = () => {
  const { isLoading } = useUI();
  
  const {
    formData,
    updateField,
    touchField,
    getFieldError,
    isFieldTouched,
    hasErrors,
    submitForm,
    resetForm
  } = useFormState<FormData>({
    name: '',
    email: '',
    amount: ''
  });

  const isSubmitting = isLoading('form-submit');

  // Simulação de validação
  const validateField = (field: keyof FormData, value: string) => {
    switch (field) {
      case 'name':
        return value.length < 2 ? 'Nome deve ter pelo menos 2 caracteres' : '';
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Email inválido' : '';
      case 'amount':
        return isNaN(Number(value)) || Number(value) <= 0 ? 'Valor deve ser um número positivo' : '';
      default:
        return '';
    }
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    updateField(field, value);
    
    // Validação em tempo real após o campo ser tocado
    if (isFieldTouched(field)) {
      const error = validateField(field, value);
      if (error) {
        // setFieldError seria chamado aqui se houvesse erro
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar todos os campos
    const errors: Partial<Record<keyof FormData, string>> = {};
    Object.keys(formData).forEach(key => {
      const field = key as keyof FormData;
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      // Aqui você marcaria os erros no formulário
      return;
    }

    // Simular envio do formulário
    await submitForm(
      async (data) => {
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simular erro ocasional
        if (Math.random() > 0.7) {
          throw new Error('Erro simulado do servidor');
        }
        
        return { success: true, data };
      },
      {
        loadingKey: 'form-submit',
        successMessage: 'Formulário enviado com sucesso!',
        errorMessage: 'Erro ao enviar formulário',
        resetOnSuccess: true
      }
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Exemplo de Formulário</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              onBlur={() => touchField('name')}
              className={getFieldError('name') ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {getFieldError('name') && (
              <p className="text-sm text-red-500">{getFieldError('name')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              onBlur={() => touchField('email')}
              className={getFieldError('email') ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {getFieldError('email') && (
              <p className="text-sm text-red-500">{getFieldError('email')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleFieldChange('amount', e.target.value)}
              onBlur={() => touchField('amount')}
              className={getFieldError('amount') ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {getFieldError('amount') && (
              <p className="text-sm text-red-500">{getFieldError('amount')}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting || hasErrors}
              className="flex-1"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Limpar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormExample;