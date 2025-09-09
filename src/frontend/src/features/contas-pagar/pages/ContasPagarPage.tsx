import React, { useState } from 'react';
import {
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ContasPagarTable } from '../../../components/tables/ContasPagarTable';
import { ContaPagarForm } from '../../../components/forms/ContaPagarForm';
import { PagamentoContaPagarForm } from '../../../components/forms/PagamentoContaPagarForm';
import { AccountsPayableResponse } from '../../../services/contasPagarApi';
import { useAppDispatch } from '../../../store';
import { createContaPagar, updateContaPagar, pagarContaPagar } from '../../../store/slices/contasPagarSlice';

export const ContasPagarPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  const [openForm, setOpenForm] = useState(false);
  const [openPagamentoForm, setOpenPagamentoForm] = useState(false);
  const [editingConta, setEditingConta] = useState<AccountsPayableResponse | null>(null);
  const [pagandoConta, setPagandoConta] = useState<AccountsPayableResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingConta(null);
    setOpenForm(true);
  };

  const handleEdit = (conta: AccountsPayableResponse) => {
    setEditingConta(conta);
    setOpenForm(true);
  };

  const handlePagar = (conta: AccountsPayableResponse) => {
    setPagandoConta(conta);
    setOpenPagamentoForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingConta(null);
  };

  const handleClosePagamentoForm = () => {
    setOpenPagamentoForm(false);
    setPagandoConta(null);
    setError(null);
  };

  const handleSubmitForm = (data: any) => {
    if (editingConta) {
      dispatch(updateContaPagar({ id: editingConta.CodAccountsPayable, data }))
        .then(() => {
          handleCloseForm();
        });
    } else {
      dispatch(createContaPagar(data))
        .then(() => {
          handleCloseForm();
        });
    }
  };

  const handleSubmitPagamentoForm = (data: any) => {
    if (pagandoConta) {
      setLoading(true);
      setError(null);
      
      dispatch(pagarContaPagar({ id: pagandoConta.CodAccountsPayable, paymentData: data }))
        .then(() => {
          handleClosePagamentoForm();
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
            {t('contas_pagar.title')}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Gerencie suas contas a pagar
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <ContasPagarTable 
        onEdit={handleEdit}
        onCreate={handleCreate}
        onPagar={handlePagar}
      />
      
      {/* Form Dialog */}
      <ContaPagarForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        initialData={editingConta}
      />
      
      {/* Payment Form Dialog */}
      {pagandoConta && (
        <PagamentoContaPagarForm
          open={openPagamentoForm}
          onClose={handleClosePagamentoForm}
          onSubmit={handleSubmitPagamentoForm}
          contaPagar={pagandoConta}
          loading={loading}
          error={error}
        />
      )}
    </Box>
  );
};