import React from 'react';
import { Grid } from './types';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  LayoutGrid, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Maximize,
  Minimize,
  Settings
} from 'lucide-react';

interface GridControlsProps {
  grid: Grid;
  onUpdate: (grid: Partial<Grid>) => void;
  showControls: boolean;
  setShowControls: (show: boolean) => void;
}

/**
 * Componente que muestra los controles para modificar la estructura del grid
 */
const GridControls: React.FC<GridControlsProps> = ({
  grid,
  onUpdate,
  showControls,
  setShowControls
}) => {
  // Handler para añadir una columna al grid
  const handleAddColumn = () => {
    const newColumns = grid.columns + 1;
    let newColumnWidths = [...(grid.columnWidths || Array(grid.columns).fill('1fr'))];
    newColumnWidths.push('1fr');
    
    onUpdate({
      columns: newColumns,
      columnWidths: newColumnWidths
    });
  };

  // Handler para eliminar una columna
  const handleRemoveColumn = () => {
    if (grid.columns <= 1) return;
    
    const newColumns = grid.columns - 1;
    let newColumnWidths = [...(grid.columnWidths || [])];
    if (newColumnWidths.length > 0) {
      newColumnWidths.pop();
    }
    
    onUpdate({
      columns: newColumns,
      columnWidths: newColumnWidths.length > 0 ? newColumnWidths : undefined
    });
  };

  // Handler para añadir una fila al grid
  const handleAddRow = () => {
    const newRows = grid.rows + 1;
    let newRowHeights = [...(grid.rowHeights || Array(grid.rows).fill('auto'))];
    newRowHeights.push('auto');
    
    onUpdate({
      rows: newRows,
      rowHeights: newRowHeights
    });
  };

  // Handler para eliminar una fila
  const handleRemoveRow = () => {
    if (grid.rows <= 1) return;
    
    const newRows = grid.rows - 1;
    let newRowHeights = [...(grid.rowHeights || [])];
    if (newRowHeights.length > 0) {
      newRowHeights.pop();
    }
    
    onUpdate({
      rows: newRows,
      rowHeights: newRowHeights.length > 0 ? newRowHeights : undefined
    });
  };

  // Handler para aumentar el espacio entre celdas
  const handleIncreaseGap = () => {
    const currentGap = grid.gap || 16;
    onUpdate({ gap: currentGap + 4 });
  };

  // Handler para disminuir el espacio entre celdas
  const handleDecreaseGap = () => {
    const currentGap = grid.gap || 16;
    if (currentGap <= 4) return;
    onUpdate({ gap: currentGap - 4 });
  };

  return (
    <div className="grid-controls bg-background border border-border rounded-md p-2 mb-2 flex items-center space-x-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowControls(!showControls)}
            className={showControls ? 'bg-primary text-primary-foreground' : ''}
          >
            <LayoutGrid size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {showControls ? 'Ocultar controles de rejilla' : 'Mostrar controles de rejilla'}
        </TooltipContent>
      </Tooltip>

      {showControls && (
        <>
          <div className="flex items-center space-x-1 border-l border-border pl-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAddColumn}
                >
                  <ChevronRight size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Añadir columna</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRemoveColumn}
                  disabled={grid.columns <= 1}
                >
                  <ChevronLeft size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Eliminar columna</TooltipContent>
            </Tooltip>
            
            <span className="text-xs font-medium">
              {grid.columns} col{grid.columns !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center space-x-1 border-l border-border pl-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAddRow}
                >
                  <ChevronDown size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Añadir fila</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRemoveRow}
                  disabled={grid.rows <= 1}
                >
                  <ChevronUp size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Eliminar fila</TooltipContent>
            </Tooltip>
            
            <span className="text-xs font-medium">
              {grid.rows} fila{grid.rows !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center space-x-1 border-l border-border pl-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleIncreaseGap}
                >
                  <Maximize size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Aumentar espacio</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDecreaseGap}
                  disabled={(grid.gap || 16) <= 4}
                >
                  <Minimize size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reducir espacio</TooltipContent>
            </Tooltip>
            
            <span className="text-xs font-medium">
              {grid.gap || 16}px
            </span>
          </div>

          <div className="flex items-center space-x-1 border-l border-border pl-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                >
                  <Settings size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ajustes avanzados</TooltipContent>
            </Tooltip>
          </div>
        </>
      )}
    </div>
  );
};

export default GridControls;