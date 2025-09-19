import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Menu,
  LogOut,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { setSidebarOpen } from '../store/slices/uiSlice';
import { logout } from '../store/slices/authSlice';
import { useTheme } from '@/components/theme-provider';

export const TopBar: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/configuracoes');
  };

  const handleToggleSidebar = () => {
    dispatch(setSidebarOpen(!sidebarOpen));
  };

  const handleToggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        {/* Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleSidebar}
          className="mr-4"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Title */}
        <div className="flex-1">
          {/* Breadcrumb ou título da página atual pode ser adicionado aqui */}
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleTheme}
          className="mr-2"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* User Menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                   <AvatarFallback className="bg-primary text-primary-foreground">
                     {user.nome?.charAt(0).toUpperCase()}
                   </AvatarFallback>
                 </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
               <div className="flex items-center justify-start gap-2 p-2">
                 <div className="flex flex-col space-y-1 leading-none">
                   <p className="font-medium">{user.nome}</p>
                 </div>
               </div>
               <DropdownMenuSeparator />
               <DropdownMenuItem onClick={handleSettings}>
                 <Settings className="mr-2 h-4 w-4" />
                 <span>Configurações</span>
               </DropdownMenuItem>
               <DropdownMenuItem onClick={handleLogout}>
                 <LogOut className="mr-2 h-4 w-4" />
                 <span>Sair</span>
               </DropdownMenuItem>
             </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};