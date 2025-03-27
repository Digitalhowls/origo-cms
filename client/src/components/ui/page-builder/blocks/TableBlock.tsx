import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Block, BlockType } from '@shared/types';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableFooter, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ArrowUpDown, ChevronDown, ChevronUp, Search } from 'lucide-react';

interface TableBlockProps {
  block: Block;
  onClick?: () => void;
  isPreview?: boolean;
}

// Configuración por defecto para la tabla
interface TableSettings {
  style: 'basic' | 'bordered' | 'striped' | 'compact';
  isResponsive: boolean;
  hasFixedHeader: boolean;
  enableSorting: boolean;
  enablePagination: boolean;
  rowsPerPage: number;
  enableSearch: boolean;
  enableRowHighlight: boolean;
  showAlternatingRows: boolean;
  tableWidth: 'auto' | 'full';
  captionPosition: 'top' | 'bottom';
}

interface TableHeader {
  id: string;
  label: string;
  key: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  sortable?: boolean;
}

interface TableRow {
  id: string;
  cells: Record<string, string | number | boolean>;
  isHighlighted?: boolean;
}

/**
 * Componente de bloque de Tabla para el constructor de páginas
 * Permite mostrar datos tabulares de manera estilizada y con funcionalidades
 */
const TableBlock: React.FC<TableBlockProps> = ({
  block,
  onClick = () => {},
  isPreview = false
}) => {
  // Asegurar que tenemos la estructura correcta de datos
  const data = block.data || {};
  const title = data.title || 'Tabla de Datos';
  const description = data.description || 'Información organizada en formato tabular';
  
  // Establecer configuraciones por defecto
  const defaultSettings: TableSettings = {
    style: 'basic',
    isResponsive: true,
    hasFixedHeader: false,
    enableSorting: true,
    enablePagination: true,
    rowsPerPage: 5,
    enableSearch: true,
    enableRowHighlight: true,
    showAlternatingRows: true,
    tableWidth: 'full',
    captionPosition: 'bottom'
  };
  
  // Fusionar con configuraciones proporcionadas
  const blockSettings = data.settings || {};
  const settings = {
    ...defaultSettings,
    ...(blockSettings as Partial<TableSettings>)
  };
  
  // Datos de tabla
  const headers: TableHeader[] = data.headers || [];
  const rows: TableRow[] = data.rows || [];
  
  // Estados para funcionalidades interactivas
  const [sortedRows, setSortedRows] = useState<TableRow[]>([...rows]);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Recalcular datos ordenados cuando cambian las props o el ordenamiento
  useEffect(() => {
    let sorted = [...rows];
    
    // Aplicar ordenamiento si está configurado
    if (sortConfig !== null) {
      sorted.sort((a, b) => {
        const valueA = a.cells[sortConfig.key];
        const valueB = b.cells[sortConfig.key];
        
        // Manejar diferentes tipos de datos para ordenar
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return sortConfig.direction === 'asc' ? valueA - valueB : valueB - valueA;
        } else {
          const strA = String(valueA).toLowerCase();
          const strB = String(valueB).toLowerCase();
          return sortConfig.direction === 'asc' 
            ? strA.localeCompare(strB) 
            : strB.localeCompare(strA);
        }
      });
    }
    
    // Aplicar filtro de búsqueda si está habilitado y hay término de búsqueda
    if (settings.enableSearch && searchTerm) {
      sorted = sorted.filter(row => {
        return Object.values(row.cells).some(cellValue => 
          String(cellValue).toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    
    setSortedRows(sorted);
  }, [rows, sortConfig, searchTerm, settings.enableSearch]);
  
  // Manejar solicitud de ordenamiento de columna
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };
  
  // Obtener ícono de ordenamiento
  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="ml-2 h-4 w-4" />
      : <ChevronDown className="ml-2 h-4 w-4" />;
  };
  
  // Obtener filas paginadas si la paginación está habilitada
  const getPaginatedRows = () => {
    if (!settings.enablePagination) return sortedRows;
    
    const start = (currentPage - 1) * settings.rowsPerPage;
    const end = start + settings.rowsPerPage;
    return sortedRows.slice(start, end);
  };
  
  // Obtener estilos según la configuración
  const getTableStyleClass = () => {
    switch (settings.style) {
      case 'bordered':
        return 'border-collapse border border-gray-200';
      case 'striped':
        return 'border-collapse [&_tr:nth-child(even)]:bg-muted/50';
      case 'compact':
        return 'border-collapse [&_td]:py-1 [&_td]:px-2 [&_th]:py-1 [&_th]:px-2 text-xs';
      default:
        return '';
    }
  };
  
  // Obtener alineación para celda
  const getCellAlignment = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };
  
  // Renderizar la tabla
  const renderTable = () => (
    <div className={cn(
      'relative',
      settings.isResponsive && 'overflow-x-auto'
    )}>
      <Table className={cn(
        getTableStyleClass(),
        settings.tableWidth === 'full' ? 'w-full' : 'w-auto',
      )}>
        {/* Caption (puede estar arriba o abajo según configuración) */}
        {settings.captionPosition === 'top' && description && (
          <TableCaption className="caption-top">{description}</TableCaption>
        )}
        
        {/* Encabezados de tabla */}
        <TableHeader className={cn(
          settings.hasFixedHeader && 'sticky top-0 z-10 bg-background'
        )}>
          <TableRow>
            {headers.map((header) => (
              <TableHead 
                key={header.id}
                className={cn(
                  getCellAlignment(header.align),
                  header.width && `w-[${header.width}]`,
                  "font-semibold text-foreground"
                )}
                style={header.width ? { width: header.width } : {}}
                onClick={() => settings.enableSorting && header.sortable !== false && requestSort(header.key)}
              >
                <div className={cn(
                  "flex items-center",
                  header.align === 'center' && 'justify-center',
                  header.align === 'right' && 'justify-end',
                  settings.enableSorting && header.sortable !== false && 'cursor-pointer select-none'
                )}>
                  {header.label}
                  {settings.enableSorting && header.sortable !== false && getSortIcon(header.key)}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        
        {/* Cuerpo de la tabla */}
        <TableBody>
          {getPaginatedRows().length > 0 ? (
            getPaginatedRows().map((row) => (
              <TableRow 
                key={row.id}
                className={cn(
                  row.isHighlighted && settings.enableRowHighlight && 'bg-primary/10',
                )}
              >
                {headers.map((header) => (
                  <TableCell 
                    key={`${row.id}-${header.id}`}
                    className={getCellAlignment(header.align)}
                  >
                    {/* Renderizar diferentes tipos de datos según sea necesario */}
                    {typeof row.cells[header.key] === 'boolean' 
                      ? (row.cells[header.key] ? '✓' : '✗') 
                      : String(row.cells[header.key])}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={headers.length} className="text-center py-8 text-muted-foreground">
                No hay datos disponibles
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        
        {/* Footer con mensajes de paginación */}
        {settings.enablePagination && sortedRows.length > settings.rowsPerPage && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={headers.length}>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">
                    Mostrando {((currentPage - 1) * settings.rowsPerPage) + 1} a {
                      Math.min(currentPage * settings.rowsPerPage, sortedRows.length)
                    } de {sortedRows.length} registros
                  </span>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage(prev => 
                        Math.min(prev + 1, Math.ceil(sortedRows.length / settings.rowsPerPage))
                      )}
                      disabled={currentPage >= Math.ceil(sortedRows.length / settings.rowsPerPage)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
        
        {/* Caption al final si está configurado así */}
        {settings.captionPosition === 'bottom' && description && (
          <TableCaption>{description}</TableCaption>
        )}
      </Table>
    </div>
  );
  
  return (
    <Card 
      className={cn(
        'w-full overflow-hidden',
        isPreview ? 'cursor-default' : 'cursor-pointer hover:shadow-md transition-shadow'
      )}
      onClick={isPreview ? undefined : onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        {settings.enableSearch && (
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {headers.length > 0 ? (
          renderTable()
        ) : (
          <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
            No hay columnas configuradas. Añade columnas en las propiedades del bloque.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TableBlock;