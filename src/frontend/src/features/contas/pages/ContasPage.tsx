import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContasBancariasTable } from '../../../components/tables/ContasBancariasTable';
import { ContaBancariaForm } from '../../../components/forms/ContaBancariaForm';
import { ContaResponse } from '../../../services/contasApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const ContasPage: React.FC = () => {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConta, setEditingConta] = useState<ContaResponse | null>(null);

  const handleCreate = () => {
    setEditingConta(null);
    setIsFormOpen(true);
  };

  const handleEdit = (conta: ContaResponse) => {
    setEditingConta(conta);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingConta(null);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingConta(null);
    // A tabela será recarregada automaticamente
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('contas.title')}
          </h1>
          <p className="text-muted-foreground">
            Gerencie as contas bancárias do sistema
          </p>
        </div>
      </div>

      {/* Content */}
      <ContasBancariasTable onEdit={handleEdit} onCreate={handleCreate} />

      <ContaBancariaForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSuccess}
        initialData={editingConta}
      />
    </div>
  );
};