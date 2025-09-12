import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const CategoriasPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('categorias.title')}
          </h1>
          <p className="text-muted-foreground">
            Organize suas categorias financeiras
          </p>
        </div>
        <Button
          onClick={() => {
            // TODO: Implementar abertura do modal de criação
            console.log('Nova categoria');
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('categorias.nova')}
        </Button>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          <div className="h-80 flex items-center justify-center bg-muted/50 rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-muted-foreground">
                Módulo de Categorias
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Árvore de categorias hierárquicas
                <br />
                (A ser implementado)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};