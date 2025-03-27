import React, { ReactNode } from 'react';
import { GridCell as GridCellType } from '@shared/types';

interface GridCellProps {
  children: ReactNode;
  cell: GridCellType;
  editable?: boolean;
  onResize?: (cell: GridCellType) => void;
  onPositionChange?: (cell: GridCellType) => void;
}

/**
 * Componente que representa una celda dentro del sistema de rejilla.
 * Permite ubicar contenido en posiciones específicas con opciones para
 * ajustar tamaño y posición cuando está en modo editable.
 */
export const GridCell: React.FC<GridCellProps> = ({
  children,
  cell,
  editable = false,
  onResize,
  onPositionChange
}) => {
  // Estilo de grid que determina la posición del contenido dentro de la rejilla
  const gridStyle = {
    gridColumnStart: cell.colStart,
    gridColumnEnd: cell.colEnd,
    gridRowStart: cell.rowStart,
    gridRowEnd: cell.rowEnd,
    position: 'relative' as const
  };
  
  // Maneja el cambio de tamaño de la celda
  const handleResize = (newCell: GridCellType) => {
    if (onResize) {
      onResize(newCell);
    }
  };
  
  // Maneja el cambio de posición de la celda
  const handlePositionChange = (newCell: GridCellType) => {
    if (onPositionChange) {
      onPositionChange(newCell);
    }
  };
  
  return (
    <div 
      className={`grid-cell ${editable ? 'editable' : ''}`}
      style={gridStyle}
      data-cell-id={cell.id}
      data-col-start={cell.colStart}
      data-col-end={cell.colEnd}
      data-row-start={cell.rowStart}
      data-row-end={cell.rowEnd}
    >
      {children}
      
      {/* Controles de edición solo visibles en modo editable */}
      {editable && (
        <div className="grid-cell-controls">
          <div className="resize-handle resize-handle-se" />
          <div className="resize-handle resize-handle-sw" />
          <div className="resize-handle resize-handle-ne" />
          <div className="resize-handle resize-handle-nw" />
        </div>
      )}
    </div>
  );
};

export default GridCell;