import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Grid } from '@shared/types';
import { TrashIcon, PlusIcon, ColumnsIcon, GripVertical } from 'lucide-react';

interface GridSettingsProps {
  grid: Grid;
  onUpdate: (grid: Grid) => void;
  device: 'desktop' | 'tablet' | 'mobile';
}

/**
 * Componente para editar la configuración específica del grid
 * para un tipo de dispositivo (desktop, tablet, mobile)
 */
export const GridSettings: React.FC<GridSettingsProps> = ({ 
  grid, 
  onUpdate,
  device = 'desktop' 
}) => {
  // Determina si estamos editando configuración responsive o la principal
  const isResponsiveMode = device !== 'desktop';
  
  // Obtiene la configuración apropiada según el dispositivo
  const gridConfig = isResponsiveMode 
    ? grid.responsive?.[device] || {} 
    : grid;
  
  // Valores iniciales
  const initialColumns = gridConfig.columns || (device === 'tablet' ? 6 : device === 'mobile' ? 3 : 12);
  const initialGap = gridConfig.gap || (device === 'tablet' ? 12 : device === 'mobile' ? 8 : 16);
  const initialPadding = gridConfig.padding || (device === 'tablet' ? 12 : device === 'mobile' ? 8 : 16);
  
  // Estados locales para edición
  const [columns, setColumns] = useState(initialColumns);
  const [gap, setGap] = useState(initialGap);
  const [padding, setPadding] = useState(initialPadding);
  const [columnWidths, setColumnWidths] = useState<string[]>(
    gridConfig.columnWidths || Array(initialColumns).fill('1fr')
  );
  
  // Actualiza los estados locales cuando cambia la configuración de la rejilla
  useEffect(() => {
    const config = isResponsiveMode ? grid.responsive?.[device] || {} : grid;
    setColumns(config.columns || (device === 'tablet' ? 6 : device === 'mobile' ? 3 : 12));
    setGap(config.gap || (device === 'tablet' ? 12 : device === 'mobile' ? 8 : 16));
    setPadding(config.padding || (device === 'tablet' ? 12 : device === 'mobile' ? 8 : 16));
    setColumnWidths(config.columnWidths || Array(config.columns || initialColumns).fill('1fr'));
  }, [grid, device, isResponsiveMode]);
  
  // Actualiza la rejilla con los cambios
  const applyChanges = () => {
    if (isResponsiveMode) {
      // Actualiza configuración responsive
      const updatedResponsive = {
        ...grid.responsive,
        [device]: {
          ...grid.responsive?.[device],
          columns,
          gap,
          padding,
          columnWidths
        }
      };
      
      onUpdate({
        ...grid,
        responsive: updatedResponsive
      });
    } else {
      // Actualiza configuración principal
      onUpdate({
        ...grid,
        columns,
        gap,
        padding,
        columnWidths
      });
    }
  };
  
  // Actualiza cuando cambia cualquier valor
  useEffect(() => {
    applyChanges();
  }, [columns, gap, padding, columnWidths]);
  
  // Actualiza el ancho de una columna específica
  const handleColumnWidthChange = (index: number, value: string) => {
    const newColumnWidths = [...columnWidths];
    newColumnWidths[index] = value;
    setColumnWidths(newColumnWidths);
  };
  
  // Renderizar controles de edición
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="columns">Columnas</Label>
          <div className="flex items-center mt-1 space-x-2">
            <Input
              id="columns"
              type="number"
              min={1}
              max={24}
              value={columns}
              onChange={(e) => setColumns(parseInt(e.target.value) || 1)}
              className="w-20"
            />
            <Slider
              value={[columns]}
              min={1}
              max={24}
              step={1}
              onValueChange={(value) => setColumns(value[0])}
              className="flex-1"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="gap">Espaciado (px)</Label>
          <div className="flex items-center mt-1 space-x-2">
            <Input
              id="gap"
              type="number"
              min={0}
              max={100}
              value={gap}
              onChange={(e) => setGap(parseInt(e.target.value) || 0)}
              className="w-20"
            />
            <Slider
              value={[gap]}
              min={0}
              max={48}
              step={1}
              onValueChange={(value) => setGap(value[0])}
              className="flex-1"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="padding">Padding (px)</Label>
          <div className="flex items-center mt-1 space-x-2">
            <Input
              id="padding"
              type="number"
              min={0}
              max={100}
              value={padding}
              onChange={(e) => setPadding(parseInt(e.target.value) || 0)}
              className="w-20"
            />
            <Slider
              value={[padding]}
              min={0}
              max={48}
              step={1}
              onValueChange={(value) => setPadding(value[0])}
              className="flex-1"
            />
          </div>
        </div>
      </div>
      
      {!isResponsiveMode && (
        <>
          <Separator className="my-4" />
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Ancho de columnas</Label>
              <div className="text-xs text-gray-500">
                Usa fracciones (fr), porcentajes (%) o píxeles (px)
              </div>
            </div>
            
            <div className="grid grid-cols-6 gap-2">
              {columnWidths.map((width, index) => (
                <div key={index} className="flex items-center">
                  <GripVertical className="h-4 w-4 text-gray-400 mr-1" />
                  <Input
                    value={width}
                    onChange={(e) => handleColumnWidthChange(index, e.target.value)}
                    className="h-8 text-xs"
                    placeholder="1fr"
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      
      <div className="pt-2 text-xs text-gray-500">
        {isResponsiveMode ? (
          <p>
            Estás editando la configuración específica para {device === 'tablet' ? 'tablets' : 'móviles'}.
            Las propiedades no definidas aquí heredarán de la configuración de escritorio.
          </p>
        ) : (
          <p>
            La configuración de escritorio es la base para todos los dispositivos.
            Puedes personalizar ajustes específicos en las pestañas de Tablet y Móvil.
          </p>
        )}
      </div>
    </div>
  );
};