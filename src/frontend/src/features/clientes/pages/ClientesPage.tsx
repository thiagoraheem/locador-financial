import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export const ClientesPage: React.FC = () => {
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
            {t('clientes.title')}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Gerencie os clientes do sistema
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={() => {
              // TODO: Implementar abertura do modal de busca
              console.log('Buscar clientes');
            }}
            sx={{ mr: 1 }}
          >
            {t('actions.search')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              // TODO: Implementar abertura do modal de criação
              console.log('Novo cliente');
            }}
          >
            {t('clientes.novo')}
          </Button>
        </Box>
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
            Módulo de Clientes
            <br />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Lista de clientes cadastrados
              <br />
              (A ser implementado)
            </Typography>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};