import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export const ContasReceberPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            // TODO: Implementar abertura do modal de criação
            console.log('Nova conta a receber');
          }}
        >
          {t('contas_receber.nova')}
        </Button>
      </Box>

      {/* Content */}
      <Paper sx={{ p: 3, minHeight: 400 }}>
        <Box
          sx={{
            height: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.grey[50],
            borderRadius: 1,
          }}
        >
          <Typography variant="h6" color="textSecondary" sx={{ textAlign: 'center' }}>
            Módulo de Contas a Receber
            <br />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Gestão de clientes e recebimentos
              <br />
              (A ser implementado)
            </Typography>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};