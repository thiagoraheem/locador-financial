import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LancamentosTable } from '@/components/tables/LancamentosTable';
import { LancamentoForm } from '@/components/forms/LancamentoForm';
import { useAppDispatch } from '@/store';
import { createLancamento, updateLancamento } from '@/store/slices/lancamentosSlice';
import { LancamentoResponse } from '@/services/lancamentosApi';
import { toast } from 'sonner';

export const LancamentosPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [openForm, setOpenForm] = useState(false);
  const [editingLancamento, setEditingLancamento] = useState<LancamentoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingLancamento(null);
    setOpenForm(true);
  };

  const handleEdit = (lancamento: LancamentoResponse) => {
    setEditingLancamento(lancamento);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingLancamento(null);
    setError(null);
  };

  const handleSubmitForm = async (data: any) => {
    setLoading(true);
    setError(null);
    
    try {
      if (editingLancamento) {
        // Atualizar lançamento existente
        await dispatch(updateLancamento({ id: editingLancamento.CodLancamento, data })).unwrap();
        toast.success('Lançamento atualizado com sucesso!');
      } else {
        // Criar novo lançamento
        await dispatch(createLancamento(data)).unwrap();
        toast.success('Lançamento criado com sucesso!');
      }
      handleCloseForm();
    } catch (err: any) {
      const errorMessage = err.message || t('messages.error_occurred');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('lancamentos.title')}
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus lançamentos financeiros
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('lancamentos.novo')}
        </Button>
      </div>

      {/* Lancamentos Table */}
      <LancamentosTable onEdit={handleEdit} onCreate={handleCreate} />

      {/* Lancamento Form Modal */}
      <LancamentoForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        initialData={editingLancamento}
        loading={loading}
        error={error}
      />
    </div>
  );
};