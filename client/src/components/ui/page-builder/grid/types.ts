/**
 * Representa una celda en la rejilla
 */
export interface GridCell {
  id: string;  // ID único del bloque o elemento contenido
  rowStart: number;
  rowEnd: number;
  colStart: number;
  colEnd: number;
}

/**
 * Representa una fila en la rejilla
 */
export interface Row {
  id: string;
  height?: string; // Altura de la fila (ej: "auto", "100px", "1fr")
  cells: GridCell[];
}

/**
 * Representa una columna en la rejilla
 */
export interface Column {
  id: string;
  width?: string; // Ancho de la columna (ej: "1fr", "2fr", "200px")
}

/**
 * Representa una configuración completa de rejilla
 */
export interface Grid {
  id: string;
  name?: string;
  columns: number;           // Número de columnas
  rows: number;              // Número de filas
  columnWidths?: string[];   // Anchos de columnas en formato CSS (ej: ["1fr", "2fr", "1fr"])
  rowHeights?: string[];     // Alturas de filas en formato CSS
  gap?: number;              // Espacio entre celdas en pixels
  padding?: number;          // Padding del grid en pixels
  cells?: GridCell[];        // Configuración de celdas
  responsive?: {             // Configuración responsive
    tablet?: Partial<Grid>;  // Para tablet
    mobile?: Partial<Grid>;  // Para móvil
  };
}

/**
 * Tipos de alineación para elementos dentro de una celda
 */
export enum GridAlignment {
  START = 'start',
  CENTER = 'center',
  END = 'end',
  STRETCH = 'stretch'
}

/**
 * Configuración extendida para una celda
 */
export interface GridCellExtended extends GridCell {
  content?: any;            // Contenido de la celda (bloque u otro elemento)
  alignItems?: GridAlignment;
  justifyContent?: GridAlignment;
  padding?: string;
  background?: string;
}