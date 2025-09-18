import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BancosTable } from '../../../components/tables/BancosTable';
import { BancoForm } from '../../../components/forms/BancoForm';
import { BancoResponse } from '../../../services/bancosApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const BancosPage: React.FC = () => {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanco, setEditingBanco] = useState<BancoResponse | null>(null);

  const handleCreate = () => {
    setEditingBanco(null);
    setIsFormOpen(true);
  };

  const handleEdit = (banco: BancoResponse) => {
    setEditingBanco(banco);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBanco(null);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingBanco(null);
    // A tabela será recarregada automaticamente
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('bancos.title')}
          </h1>
          <p className="text-muted-foreground">
            Gerencie os bancos do sistema
          </p>
        </div>
      </div>

      {/* Content */}
      <BancosTable onEdit={handleEdit} onCreate={handleCreate} />

      <BancoForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSuccess}
        initialData={editingBanco}
      />
    </div>
  );
};