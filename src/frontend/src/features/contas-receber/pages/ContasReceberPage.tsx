import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContasReceberTable } from '../../../components/tables/ContasReceberTable';
import { ContaReceberForm } from '../../../components/forms/ContaReceberForm';
import { RecebimentoContaReceberForm } from '../../../components/forms/RecebimentoContaReceberForm';
import { AccountsReceivableResponse } from '../../../services/contasReceberApi';
import { useAppDispatch } from '../../../store';
import { createContaReceber, updateContaReceber, receberContaReceber } from '../../../store/slices/contasReceberSlice';

export const ContasReceberPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  
  const [openForm, setOpenForm] = useState(false);
  const [openRecebimentoForm, setOpenRecebimentoForm] = useState(false);
  const [editingConta, setEditingConta] = useState<AccountsReceivableResponse | null>(null);
  const [recebendoConta, setRecebendoConta] = useState<AccountsReceivableResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingConta(null);
    setOpenForm(true);
  };

  const handleEdit = (conta: AccountsReceivableResponse) => {
    setEditingConta(conta);
    setOpenForm(true);
  };

  const handleReceber = (conta: AccountsReceivableResponse) => {
    setRecebendoConta(conta);
    setOpenRecebimentoForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingConta(null);
  };

  const handleCloseRecebimentoForm = () => {
    setOpenRecebimentoForm(false);
    setRecebendoConta(null);
    setError(null);
  };

  const handleSubmitForm = (data: any) => {
    if (editingConta) {
      dispatch(updateContaReceber({ id: editingConta.CodAccountsReceivable, data }))
        .then(() => {
          handleCloseForm();
        });
    } else {
      dispatch(createContaReceber(data))
        .then(() => {
          handleCloseForm();
        });
    }
  };

  const handleSubmitRecebimentoForm = (data: any) => {
    if (recebendoConta) {
      setLoading(true);
      setError(null);
      
      dispatch(receberContaReceber({ id: recebendoConta.CodAccountsReceivable, paymentData: data }))
        .then(() => {
          handleCloseRecebimentoForm();
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || t('messages.error_occurred'));
          setLoading(false);
        });
    }
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('contas_receber.title')}
          </h1>
          <p className="text-gray-600">
            Gerencie suas contas a receber
          </p>
        </div>
      </div>

      {/* Content */}
      <ContasReceberTable 
        onEdit={handleEdit}
        onCreate={handleCreate}
        onReceber={handleReceber}
      />
      
      {/* Form Dialog */}
      <ContaReceberForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        initialData={editingConta}
      />
      
      {/* Receipt Form Dialog */}
      {recebendoConta && (
        <RecebimentoContaReceberForm
          open={openRecebimentoForm}
          onClose={handleCloseRecebimentoForm}
          onSubmit={handleSubmitRecebimentoForm}
          contaReceber={recebendoConta}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
};