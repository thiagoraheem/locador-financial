import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const BancosPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('bancos.title')}
          </h1>
          <p className="text-muted-foreground">
            Gerencie os bancos do sistema
          </p>
        </div>
        <Button
          onClick={() => {
            // TODO: Implementar abertura do modal de criação
            console.log('Novo banco');
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('bancos.novo')}
        </Button>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          <div className="h-80 flex items-center justify-center bg-muted/50 rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-muted-foreground">
                Módulo de Bancos
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Lista de bancos cadastrados
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