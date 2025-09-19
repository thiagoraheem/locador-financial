import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

interface BreadcrumbItemData {
  label: string;
  path: string;
  isLast: boolean;
}

const AppBreadcrumb: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();

  // Mapeamento de rotas para labels traduzidos
  const routeLabels: Record<string, string> = {
    '/dashboard': t('nav.dashboard'),
    '/lancamentos': t('nav.lancamentos'),
    '/categorias': t('nav.categorias'),
    '/empresas': t('nav.empresas'),
    '/bancos': t('nav.bancos'),
    '/contas': t('nav.contas'),
    '/clientes': t('nav.clientes'),
    '/contas-pagar': t('nav.contas_pagar'),
    '/contas-receber': t('nav.contas_receber'),
    '/relatorios': t('nav.relatorios'),
  };

  const generateBreadcrumbs = (): BreadcrumbItemData[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItemData[] = [];

    // Sempre adicionar Home como primeiro item
    breadcrumbs.push({
      label: 'Home',
      path: '/dashboard',
      isLast: pathSegments.length === 0 || location.pathname === '/dashboard',
    });

    // Construir breadcrumbs baseado nos segmentos da URL
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Pular se for o dashboard (já adicionado como Home)
      if (currentPath === '/dashboard') {
        return;
      }

      const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      breadcrumbs.push({
        label,
        path: currentPath,
        isLast,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Não mostrar breadcrumb se estiver na página inicial
  if (location.pathname === '/dashboard' || location.pathname === '/') {
    return null;
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={item.path}>
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage className="flex items-center gap-2">
                  {index === 0 && <Home className="h-4 w-4" />}
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={item.path} className="flex items-center gap-2 hover:text-primary">
                    {index === 0 && <Home className="h-4 w-4" />}
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!item.isLast && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default AppBreadcrumb;