import React, { ReactNode } from 'react';
import { Grid } from '@shared/types';
import GridCell from './GridCell';

interface GridSystemProps {
  children?: ReactNode;
  grid: Grid;
  onUpdate: (grid: Grid) => void;
  className?: string;
  editable?: boolean;
  previewMode?: 'desktop' | 'tablet' | 'mobile';
}

/**
 * Sistema de rejilla flexible para la ubicación de bloques
 * Permite:
 * - Definir un número personalizable de columnas
 * - Ajustar el ancho de las columnas
 * - Colocar elementos en posiciones específicas
 * - Comportamiento responsive que se adapta automáticamente
 */
export const GridSystem: React.FC<GridSystemProps> = ({
  children,
  grid,
  onUpdate,
  className = '',
  editable = false,
  previewMode = 'desktop'
}) => {
  // Obtiene la configuración de la rejilla según el modo de vista previa
  const getConfig = () => {
    if (previewMode === 'mobile' && grid.responsive?.mobile) {
      return {
        ...grid,
        ...grid.responsive.mobile
      };
    } else if (previewMode === 'tablet' && grid.responsive?.tablet) {
      return {
        ...grid,
        ...grid.responsive.tablet
      };
    }
    return grid;
  };
  
  const gridConfig = getConfig();
  
  // Genera el template de columnas
  const generateColumnTemplate = () => {
    if (gridConfig.columnWidths && gridConfig.columnWidths.length > 0) {
      return gridConfig.columnWidths.join(' ');
    }
    return `repeat(${gridConfig.columns}, 1fr)`;
  };
  
  // Estilos base de la rejilla
  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: generateColumnTemplate(),
    gap: `${gridConfig.gap}px`,
    padding: `${gridConfig.padding}px`
  };
  
  // Maneja actualización de la rejilla
  const handleGridUpdate = (updatedGrid: Grid) => {
    onUpdate(updatedGrid);
  };
  
  return (
    <div 
      className={`grid-system ${className} ${editable ? 'editable' : ''}`}
      style={gridStyles}
      data-grid-id={grid.id}
      data-columns={gridConfig.columns}
      data-device={previewMode}
    >
      {children}
      
      {/* Mostrar cuadrícula solo en modo edición */}
      {editable && (
        <div className="grid-overlay">
          {Array.from({ length: gridConfig.columns }).map((_, i) => (
            <div 
              key={`col-${i}`} 
              className="grid-column-guide"
              style={{
                gridColumn: `${i + 1} / ${i + 2}`,
                gridRow: '1 / -1'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GridSystem;