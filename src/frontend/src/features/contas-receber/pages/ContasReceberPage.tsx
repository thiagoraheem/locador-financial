import React, { useState } from 'react';
import {
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ContasReceberTable } from '../../../components/tables/ContasReceberTable';
import { ContaReceberForm } from '../../../components/forms/ContaReceberForm';
import { RecebimentoContaReceberForm } from '../../../components/forms/RecebimentoContaReceberForm';
import { AccountsReceivableResponse } from '../../../services/contasReceberApi';
import { useAppDispatch } from '../../../store';
import { createContaReceber, updateContaReceber, receberContaReceber } from '../../../store/slices/contasReceberSlice';

export const ContasReceberPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
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
    <Box>
      {/* Page Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3 
      }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('contas_receber.title')}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Gerencie suas contas a receber
          </Typography>
        </Box>
      </Box>

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
    </Box>
  );
};