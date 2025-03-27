import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBuildStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { v4 as uuidv4 } from 'uuid';
import { Grid, GridCell } from '@shared/types';
import { GridSettings } from './GridSettings';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutGrid, 
  XCircle, 
  PlusCircle, 
  Grid as GridIcon, 
  Smartphone, 
  Tablet, 
  Monitor 
} from 'lucide-react';

/**
 * Panel para gestionar la configuración de rejilla de la página
 */
const GridPanel: React.FC = () => {
  const { 
    currentPage, 
    updatePageGrid, 
    resetPageGrid,
    previewDevice,
    updateBlockGridPosition
  } = useBuildStore();
  
  const [activeTab, setActiveTab] = useState<string>('desktop');
  
  // Estado local para edición
  const [editingGrid, setEditingGrid] = useState<Grid | null>(
    currentPage?.grid || null
  );

  // Cuando cambia la página, actualizamos el estado local
  React.useEffect(() => {
    setEditingGrid(currentPage?.grid || null);
  }, [currentPage?.grid]);

  // Crea una nueva rejilla por defecto
  const createDefaultGrid = (): Grid => {
    return {
      id: uuidv4(),
      name: 'Rejilla principal',
      columns: 12,
      rows: 0, // Auto rows
      gap: 16,
      padding: 16,
      cells: [],
      responsive: {
        tablet: {
          columns: 6,
          gap: 12,
          padding: 12
        },
        mobile: {
          columns: 3,
          gap: 8,
          padding: 8
        }
      }
    };
  };

  // Actualiza la configuración de la rejilla actual
  const handleUpdateGrid = (updatedGrid: Grid) => {
    setEditingGrid(updatedGrid);
    updatePageGrid(updatedGrid);
  };

  // Añade una nueva rejilla al no existir una
  const handleAddGrid = () => {
    const newGrid = createDefaultGrid();
    setEditingGrid(newGrid);
    updatePageGrid(newGrid);
  };

  // Elimina la rejilla actual
  const handleResetGrid = () => {
    setEditingGrid(null);
    resetPageGrid();
  };

  // Actualiza la posición de un bloque en la rejilla
  const handleUpdateBlockPosition = (blockId: string, position: GridCell) => {
    updateBlockGridPosition(blockId, position);
  };

  // Maneja la asignación automática de bloques a celdas de la rejilla
  const handleAutoAssignBlocks = () => {
    if (!editingGrid || !currentPage?.blocks) return;

    // Crea una distribución automática simple basada en filas
    const assignedBlocks = currentPage.blocks.map((block, index) => {
      // Posición de la celda (por ahora simplemente en fila)
      const gridPosition: GridCell = {
        id: uuidv4(),
        rowStart: index + 1,
        rowEnd: index + 2,
        colStart: 1,
        colEnd: editingGrid.columns + 1
      };

      return {
        ...block,
        gridPosition
      };
    });

    // Actualiza las posiciones de los bloques
    assignedBlocks.forEach(block => {
      if (block.gridPosition) {
        updateBlockGridPosition(block.id, block.gridPosition);
      }
    });
  };

  if (!currentPage) {
    return <div>Cargando...</div>;
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-md flex items-center">
          <LayoutGrid className="w-5 h-5 mr-2" />
          Sistema de Rejilla
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {!editingGrid ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <GridIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Sin sistema de rejilla
              </h3>
              <p className="text-gray-500 mb-4">
                Añade un sistema de rejilla para posicionar tus bloques con mayor precisión
              </p>
              <Button onClick={handleAddGrid}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Añadir sistema de rejilla
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-2">
                <TabsList>
                  <TabsTrigger value="desktop" className="flex items-center">
                    <Monitor className="h-4 w-4 mr-2" />
                    Escritorio
                  </TabsTrigger>
                  <TabsTrigger value="tablet" className="flex items-center">
                    <Tablet className="h-4 w-4 mr-2" />
                    Tablet
                  </TabsTrigger>
                  <TabsTrigger value="mobile" className="flex items-center">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Móvil
                  </TabsTrigger>
                </TabsList>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleResetGrid}
                  title="Eliminar sistema de rejilla"
                >
                  <XCircle className="h-4 w-4 mr-1 text-red-500" />
                  Eliminar
                </Button>
              </div>

              <TabsContent value="desktop" className="space-y-4 mt-2">
                <GridSettings
                  grid={editingGrid}
                  onUpdate={handleUpdateGrid}
                  device="desktop"
                />
              </TabsContent>
              
              <TabsContent value="tablet" className="space-y-4 mt-2">
                <GridSettings
                  grid={editingGrid}
                  onUpdate={handleUpdateGrid}
                  device="tablet"
                />
              </TabsContent>
              
              <TabsContent value="mobile" className="space-y-4 mt-2">
                <GridSettings
                  grid={editingGrid}
                  onUpdate={handleUpdateGrid}
                  device="mobile"
                />
              </TabsContent>
            </Tabs>
            
            <Separator />
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Posicionamiento de bloques</h3>
              <Button 
                onClick={handleAutoAssignBlocks}
                variant="outline"
                size="sm"
              >
                Distribuir bloques automáticamente
              </Button>
              <p className="text-xs text-gray-500 mt-1">
                Asigna automáticamente los bloques a la rejilla. Puedes ajustar manualmente la posición después.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GridPanel;