import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FavorecidosTable } from '@/components/tables/FavorecidosTable';
import { FavorecidoForm } from '@/components/forms/FavorecidoForm';
import { useAppDispatch } from '@/store';
import { createFavorecido, updateFavorecido } from '@/store/slices/favorecidosSlice';
import { FavorecidoResponse } from '@/services/favorecidosApi';

export const FavorecidosPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [openForm, setOpenForm] = useState(false);
  const [editingFavorecido, setEditingFavorecido] = useState<FavorecidoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingFavorecido(null);
    setOpenForm(true);
  };

  const handleEdit = (favorecido: FavorecidoResponse) => {
    setEditingFavorecido(favorecido);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingFavorecido(null);
    setError(null);
  };

  const handleSubmitForm = (data: any) => {
    setLoading(true);
    setError(null);
    
    const action = editingFavorecido 
      ? updateFavorecido({ id: editingFavorecido.CodFavorecido, data })
      : createFavorecido(data);
    
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
            {t('favorecidos.title')}
          </h1>
          <p className="text-muted-foreground">
            Gerencie os favorecidos do sistema
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('favorecidos.novo')}
        </Button>
      </div>

      {/* Favorecidos Table */}
      <FavorecidosTable onEdit={handleEdit} onCreate={handleCreate} />

      {/* Favorecido Form Modal */}
      <FavorecidoForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        initialData={editingFavorecido}
        loading={loading}
        error={error}
      />
    </div>
  );
};