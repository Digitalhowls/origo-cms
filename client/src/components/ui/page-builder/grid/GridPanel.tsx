import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { GridSettings } from './GridSettings';
import { Grid } from '@shared/types';
import { LayoutGrid, Tablet, Smartphone, RotateCcw } from 'lucide-react';

interface GridPanelProps {
  grid: Grid;
  onUpdate: (newGrid: Grid) => void;
  onReset?: () => void;
}

/**
 * Panel de configuración para el sistema de rejilla (grid)
 * Permite configurar diferentes aspectos del grid para varios dispositivos:
 * - Desktop: Configuración principal
 * - Tablet: Configuración específica para tablets
 * - Mobile: Configuración específica para móviles
 */
const GridPanel: React.FC<GridPanelProps> = ({ 
  grid, 
  onUpdate,
  onReset 
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('desktop');
  
  // Restablecer a los valores predeterminados
  const handleReset = () => {
    if (onReset) {
      onReset();
      
      toast({
        title: 'Grid restablecido',
        description: 'La configuración del grid ha vuelto a sus valores predeterminados.'
      });
    }
  };
  
  // Actualizar el grid con los cambios del panel
  const handleGridUpdate = (updatedGrid: Grid) => {
    onUpdate(updatedGrid);
  };
  
  return (
    <Card className="border-none shadow-none bg-background">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            <LayoutGrid className="h-5 w-5 inline mr-2" />
            Sistema de Grid
          </CardTitle>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleReset}
            title="Restablecer grid"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs 
          defaultValue="desktop" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="desktop" className="flex items-center">
              <LayoutGrid className="h-4 w-4 mr-2" />
              <span>Desktop</span>
            </TabsTrigger>
            <TabsTrigger value="tablet" className="flex items-center">
              <Tablet className="h-4 w-4 mr-2" />
              <span>Tablet</span>
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center">
              <Smartphone className="h-4 w-4 mr-2" />
              <span>Móvil</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="desktop" className="pt-4">
            <GridSettings 
              grid={grid} 
              onUpdate={handleGridUpdate} 
              device="desktop"
            />
          </TabsContent>
          
          <TabsContent value="tablet" className="pt-4">
            <GridSettings 
              grid={grid} 
              onUpdate={handleGridUpdate} 
              device="tablet"
            />
          </TabsContent>
          
          <TabsContent value="mobile" className="pt-4">
            <GridSettings 
              grid={grid} 
              onUpdate={handleGridUpdate} 
              device="mobile"
            />
          </TabsContent>
        </Tabs>
        
        <div className="text-xs text-gray-500 pt-2">
          <p>
            El sistema de grid te permite definir cómo se distribuyen los elementos en la página.
            Configura diferentes ajustes para cada tipo de dispositivo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GridPanel;