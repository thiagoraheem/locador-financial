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

export const EmpresasPage: React.FC = () => {
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
            {t('empresas.title')}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Gerencie as empresas do sistema
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            // TODO: Implementar abertura do modal de criação
            console.log('Nova empresa');
          }}
        >
          {t('empresas.nova')}
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
            Módulo de Empresas
            <br />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Lista de empresas cadastradas
              <br />
              (A ser implementado)
            </Typography>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};