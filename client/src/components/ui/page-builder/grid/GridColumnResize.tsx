import React, { useState, useEffect } from 'react';
import { Grid } from './types';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  MoveHorizontal, 
  XCircle,
  RefreshCw
} from 'lucide-react';

interface GridColumnResizeProps {
  grid: Grid;
  onUpdate: (grid: Partial<Grid>) => void;
  onClose: () => void;
}

/**
 * Componente para ajustar visualmente el ancho de las columnas
 */
const GridColumnResize: React.FC<GridColumnResizeProps> = ({
  grid,
  onUpdate,
  onClose
}) => {
  // Estado para almacenar los valores de los sliders durante la edición
  const [columnWeights, setColumnWeights] = useState<number[]>([]);
  
  // Inicializar los valores de los sliders al montar el componente
  useEffect(() => {
    if (!grid.columnWidths || grid.columnWidths.length === 0) {
      // Crear pesos iguales para todas las columnas si no hay definidos
      setColumnWeights(Array(grid.columns).fill(1));
    } else {
      // Convertir las unidades fr a valores numéricos
      const weights = grid.columnWidths.map(width => {
        const match = width.match(/(\d+)fr/);
        return match ? parseInt(match[1], 10) : 1;
      });
      
      setColumnWeights(weights);
    }
  }, [grid]);
  
  // Actualizar el peso de una columna específica
  const handleColumnWeightChange = (index: number, values: number[]) => {
    const newWeights = [...columnWeights];
    newWeights[index] = values[0];
    setColumnWeights(newWeights);
  };
  
  // Aplicar los cambios a la configuración del grid
  const applyChanges = () => {
    const newColumnWidths = columnWeights.map(weight => `${weight}fr`);
    onUpdate({ columnWidths: newColumnWidths });
    onClose();
  };
  
  // Restablecer a una distribución uniforme
  const resetToEqual = () => {
    const equalWeights = Array(grid.columns).fill(1);
    setColumnWeights(equalWeights);
  };
  
  return (
    <Card className="column-resize-dialog mt-4 w-full">
      <CardHeader className="px-4 py-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Ajustar Anchos de Columna</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XCircle size={18} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 py-2">
        <div className="space-y-6">
          {/* Vista previa visual de las columnas */}
          <div className="flex h-12 rounded-md overflow-hidden border">
            {columnWeights.map((weight, index) => {
              // Calcular el porcentaje de ancho basado en el peso relativo
              const totalWeight = columnWeights.reduce((sum, w) => sum + w, 0);
              const percentage = (weight / totalWeight) * 100;
              
              return (
                <div
                  key={`preview-${index}`}
                  style={{ width: `${percentage}%` }}
                  className={`flex items-center justify-center ${
                    index % 2 === 0 ? 'bg-muted' : 'bg-muted/50'
                  }`}
                >
                  <span className="text-xs font-medium">{weight}fr</span>
                </div>
              );
            })}
          </div>
          
          {/* Sliders para ajustar cada columna */}
          <div className="space-y-4">
            {columnWeights.map((weight, index) => (
              <div key={`col-resize-${index}`} className="space-y-1">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span>Columna {index + 1}</span>
                  <span>{weight}fr</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MoveHorizontal size={16} className="text-muted-foreground" />
                  <Slider
                    value={[weight]}
                    min={1}
                    max={12}
                    step={1}
                    onValueChange={(values) => handleColumnWeightChange(index, values)}
                    className="flex-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-2 justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={resetToEqual}
        >
          <RefreshCw size={16} className="mr-1" /> Igualar
        </Button>
        
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={applyChanges}
          >
            Aplicar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default GridColumnResize;