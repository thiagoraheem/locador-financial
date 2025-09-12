import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CategoriasTable } from '@/components/tables/CategoriasTable';
import { CategoriaForm } from '@/components/forms/CategoriaForm';
import { useAppDispatch } from '@/store';
import { createCategoria, updateCategoria } from '@/store/slices/categoriasSlice';
import { CategoriaResponse } from '@/services/categoriasApi';

export const CategoriasPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [openForm, setOpenForm] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingCategoria(null);
    setOpenForm(true);
  };

  const handleEdit = (categoria: CategoriaResponse) => {
    setEditingCategoria(categoria);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingCategoria(null);
    setError(null);
  };

  const handleSubmitForm = (data: any) => {
    setLoading(true);
    setError(null);
    
    const action = editingCategoria 
      ? updateCategoria({ id: editingCategoria.CodCategoria, data })
      : createCategoria(data);
    
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
            {t('categorias.title')}
          </h1>
          <p className="text-muted-foreground">
            Organize suas categorias financeiras
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('categorias.nova')}
        </Button>
      </div>

      {/* Categorias Table */}
      <CategoriasTable onEdit={handleEdit} onCreate={handleCreate} />

      {/* Categoria Form Modal */}
      <CategoriaForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        initialData={editingCategoria}
        loading={loading}
        error={error}
      />
    </div>
  );
};