import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EmpresasTable } from '@/components/tables/EmpresasTable';
import { EmpresaForm } from '@/components/forms/EmpresaForm';
import { useAppDispatch } from '../../../store';
import { createEmpresa, updateEmpresa } from '@/store/slices/empresasSlice';

export const EmpresasPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  const handleEdit = (empresa: any) => {
    setEditingEmpresa(empresa);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setFormLoading(true);
    try {
      if (editingEmpresa) {
        await dispatch(updateEmpresa({ id: editingEmpresa.CodEmpresa, data })).unwrap();
      } else {
        await dispatch(createEmpresa(data)).unwrap();
      }
      setIsFormOpen(false);
      setEditingEmpresa(null);
    } catch (error) {
      console.error('Error saving empresa:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingEmpresa(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('empresas.title')}</h1>
          <p className="text-muted-foreground">
            Gerencie as empresas do sistema
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('empresas.nova')}
        </Button>
      </div>

      {/* Content */}
      <div className="bg-card rounded-lg border p-6">
        <EmpresasTable onEdit={handleEdit} />
      </div>

      {/* Form Modal */}
      <EmpresaForm
        open={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={editingEmpresa}
        loading={formLoading}
      />
    </div>
  );
};