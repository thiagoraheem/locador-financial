import React from 'react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  CreditCard,
  Tag,
  DollarSign,
  FileText,
  BarChart3,
  Building2,
  Landmark,
  Users,
} from 'lucide-react';
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
  const dispatch = useDispatch();
  
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const isMobile = window.innerWidth < 768;

  const handleClose = () => {
    if (isMobile) {
      dispatch(setSidebarOpen(false));
    }
  };

  const menuItems = [
    {
      text: t('nav.dashboard'),
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/dashboard',
    },
    {
      text: t('nav.lancamentos'),
      icon: <CreditCard className="h-5 w-5" />,
      path: '/lancamentos',
    },
    {
      text: t('nav.categorias'),
      icon: <Tag className="h-5 w-5" />,
      path: '/categorias',
    },
    {
      text: t('nav.empresas'),
      icon: <Building2 className="h-5 w-5" />,
      path: '/empresas',
    },
    {
      text: t('nav.bancos'),
      icon: <Landmark className="h-5 w-5" />,
      path: '/bancos',
    },
    {
      text: t('nav.contas'),
      icon: <CreditCard className="h-5 w-5" />,
      path: '/contas',
    },
    {
      text: t('nav.favorecidos'),
      icon: <Users className="h-5 w-5" />,
      path: '/favorecidos',
    },
    {
      text: t('nav.contas_pagar'),
      icon: <DollarSign className="h-5 w-5" />,
      path: '/contas-pagar',
    },
    {
      text: t('nav.contas_receber'),
      icon: <FileText className="h-5 w-5" />,
      path: '/contas-receber',
    },
    {
      text: t('nav.relatorios'),
      icon: <BarChart3 className="h-5 w-5" />,
      path: '/relatorios',
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    handleClose();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 bg-primary text-primary-foreground">
        <h1 className="text-lg font-semibold truncate">
          Sistema Financeiro
        </h1>
        <p className="text-sm opacity-80">
          Locador
        </p>
      </div>

      <Separator />

      {/* User Info */}
      {user && (
        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            Bem-vindo
          </p>
          <p className="text-sm font-medium truncate">
            {user.nome}
          </p>
        </div>
      )}

      <Separator />

      {/* Navigation Menu */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.text}>
              <button
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-foreground"
                )}
              >
                <span className="flex-shrink-0">
                  {item.icon}
                </span>
                <span className="truncate">
                  {item.text}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={sidebarOpen} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent side="left" className="p-0 w-80">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        "border-r bg-card transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-80" : "w-0 overflow-hidden"
      )}
      style={{ width: sidebarOpen ? width : 0 }}
    >
      {sidebarContent}
    </aside>
  );
};