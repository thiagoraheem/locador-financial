import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance as AccountBalanceIcon,
  Category as CategoryIcon,
  PaymentOutlined as PaymentOutlinedIcon,
  RequestQuoteOutlined as RequestQuoteOutlinedIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setSidebarOpen } from '../store/slices/uiSlice';

interface SidebarProps {
  width: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ width }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { user } = useSelector((state: RootState) => state.auth);

  const handleClose = () => {
    if (isMobile) {
      dispatch(setSidebarOpen(false));
    }
  };

  const menuItems = [
    {
      text: t('nav.dashboard'),
      icon: <DashboardIcon />,
      path: '/dashboard',
    },
    {
      text: t('nav.lancamentos'),
      icon: <AccountBalanceIcon />,
      path: '/lancamentos',
    },
    {
      text: t('nav.categorias'),
      icon: <CategoryIcon />,
      path: '/categorias',
    },
    {
      text: t('nav.contas_pagar'),
      icon: <PaymentOutlinedIcon />,
      path: '/contas-pagar',
    },
    {
      text: t('nav.contas_receber'),
      icon: <RequestQuoteOutlinedIcon />,
      path: '/contas-receber',
    },
    {
      text: t('nav.relatorios'),
      icon: <AssessmentIcon />,
      path: '/relatorios',
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    handleClose();
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }}
      >
        <Typography variant="h6" component="h1" noWrap>
          Sistema Financeiro
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Locador
        </Typography>
      </Box>

      <Divider />

      {/* User Info */}
      {user && (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Bem-vindo
          </Typography>
          <Typography variant="subtitle2" noWrap>
            {user.nome}
          </Typography>
        </Box>
      )}

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.contrastText,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path 
                    ? theme.palette.primary.contrastText 
                    : 'inherit',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={sidebarOpen}
      onClose={handleClose}
      sx={{
        width: sidebarOpen ? width : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
    >
      {drawerContent}
    </Drawer>
  );
};