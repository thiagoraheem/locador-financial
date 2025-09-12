import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ClientesTable } from '@/components/tables/ClientesTable';
import { ClienteForm } from '@/components/forms/ClienteForm';
import { useAppDispatch } from '@/store';
import { createCliente, updateCliente } from '@/store/slices/clientesSlice';
import { ClienteResponse } from '@/services/clientesApi';

export const ClientesPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [openForm, setOpenForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState<ClienteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingCliente(null);
    setOpenForm(true);
  };

  const handleEdit = (cliente: ClienteResponse) => {
    setEditingCliente(cliente);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingCliente(null);
    setError(null);
  };

  const handleSubmitForm = (data: any) => {
    setLoading(true);
    setError(null);
    
    const action = editingCliente 
      ? updateCliente({ id: editingCliente.CodCliente, data })
      : createCliente(data);
    
    dispatch(action)
      .then(() => {
        handleCloseForm();
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || t('messages.error_occurred'));
        setLoading(false);
      });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('clientes.title')}
          </h1>
          <p className="text-muted-foreground">
            Gerencie os clientes do sistema
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('clientes.novo')}
        </Button>
      </div>

      {/* Clientes Table */}
      <ClientesTable onEdit={handleEdit} onCreate={handleCreate} />

      {/* Cliente Form Modal */}
      <ClienteForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        initialData={editingCliente}
        loading={loading}
        error={error}
      />
    </div>
  );
};