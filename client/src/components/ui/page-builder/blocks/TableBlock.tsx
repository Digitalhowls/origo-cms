import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
import { 
  ArrowUpDown, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  SlidersHorizontal, 
  Download, 
  Printer, 
  Copy, 
  Info, 
  Eye,
  EyeOff,
  Filter,
  X,
  Trash,
  RefreshCw
} from 'lucide-react';

interface TableBlockProps {
  block: Block;
  onClick?: () => void;
  isPreview?: boolean;
}

// Configuración por defecto para la tabla
interface TableSettings {
  style: 'basic' | 'bordered' | 'striped' | 'compact' | 'modern' | 'minimal';
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
  enableExport: boolean;
  enablePrint: boolean;
  enableCopy: boolean;
  enableColumnVisibility: boolean;
  enableColumnFilter: boolean;
  enableRowSelection: boolean;
  enableMultiSort: boolean;
  enableDensityToggle: boolean;
  theme: 'light' | 'dark' | 'auto';
  borderStyle: 'none' | 'thin' | 'medium' | 'thick';
  headerStyle: 'default' | 'bold' | 'filled' | 'underlined';
  cellPadding: 'small' | 'medium' | 'large';
  cellAlignment: 'left' | 'center' | 'right';
  showRowNumbers: boolean;
  stickyFirstColumn: boolean;
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
    captionPosition: 'bottom',
    enableExport: false,
    enablePrint: false,
    enableCopy: false,
    enableColumnVisibility: false,
    enableColumnFilter: false,
    enableRowSelection: false,
    enableMultiSort: false,
    enableDensityToggle: false,
    theme: 'light',
    borderStyle: 'thin',
    headerStyle: 'default',
    cellPadding: 'medium',
    cellAlignment: 'left',
    showRowNumbers: false,
    stickyFirstColumn: false
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
      case 'modern':
        return 'border-collapse rounded-md shadow-md [&_th]:bg-primary/10 [&_th]:text-primary [&_tr:hover]:bg-muted/30';
      case 'minimal':
        return 'border-collapse [&_th]:border-b-2 [&_th]:border-primary/30 [&_td]:border-b [&_td]:border-muted';
      default:
        return '';
    }
  };

  // Obtener estilos para el borde según la configuración
  const getBorderStyleClass = () => {
    switch (settings.borderStyle) {
      case 'thin':
        return 'border border-border/40';
      case 'medium':
        return 'border-2 border-border/60';
      case 'thick':
        return 'border-4 border-border/80';
      case 'none':
      default:
        return '';
    }
  };

  // Obtener estilos para el header según la configuración
  const getHeaderStyleClass = () => {
    switch (settings.headerStyle) {
      case 'bold':
        return 'font-bold text-lg';
      case 'filled':
        return 'bg-primary text-primary-foreground';
      case 'underlined':
        return 'border-b-2 border-primary';
      case 'default':
      default:
        return '';
    }
  };

  // Obtener estilos para el padding de celdas según la configuración
  const getCellPaddingClass = () => {
    switch (settings.cellPadding) {
      case 'small':
        return 'p-1';
      case 'large':
        return 'p-4';
      case 'medium':
      default:
        return 'p-2';
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
  const renderTable = () => {
    // Filtrar las columnas visibles si está habilitada la funcionalidad
    const visibleHeadersToShow = settings.enableColumnVisibility
      ? getVisibleHeaders()
      : headers;

    // Número de filas a mostrar
    const rowNumbersOffset = (currentPage - 1) * settings.rowsPerPage;

    return (
      <div className={cn(
        'relative',
        settings.isResponsive && 'overflow-x-auto'
      )}>
        <Table className={cn(
          getTableStyleClass(),
          getBorderStyleClass(),
          settings.tableWidth === 'full' ? 'w-full' : 'w-auto',
          settings.theme === 'dark' ? 'dark' : '',
        )}>
          {/* Caption (puede estar arriba o abajo según configuración) */}
          {settings.captionPosition === 'top' && description && (
            <TableCaption className="caption-top">{description}</TableCaption>
          )}
          
          {/* Encabezados de tabla */}
          <TableHeader className={cn(
            getHeaderStyleClass(),
            settings.hasFixedHeader && 'sticky top-0 z-10 bg-background'
          )}>
            <TableRow>
              {/* Mostrar números de fila si está habilitado */}
              {settings.showRowNumbers && (
                <TableHead 
                  className="w-[50px] text-center font-semibold text-foreground"
                >
                  <div className="flex items-center justify-center">
                    #
                  </div>
                </TableHead>
              )}
              
              {/* Mostrar encabezados de columnas visibles */}
              {visibleHeadersToShow.map((header) => (
                <TableHead 
                  key={header.id}
                  className={cn(
                    getCellAlignment(header.align),
                    getCellPaddingClass(),
                    header.width && `w-[${header.width}]`,
                    "font-semibold text-foreground",
                    settings.stickyFirstColumn && header === visibleHeadersToShow[0] && 'sticky left-0 z-10 bg-background'
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
              getPaginatedRows().map((row, rowIndex) => (
                <TableRow 
                  key={row.id}
                  className={cn(
                    row.isHighlighted && settings.enableRowHighlight && 'bg-primary/10',
                    settings.showAlternatingRows && rowIndex % 2 === 1 && 'bg-muted/30', 
                  )}
                >
                  {/* Número de fila si está habilitado */}
                  {settings.showRowNumbers && (
                    <TableCell 
                      className="text-center text-muted-foreground"
                    >
                      {rowNumbersOffset + rowIndex + 1}
                    </TableCell>
                  )}
                  
                  {/* Celdas para columnas visibles */}
                  {visibleHeadersToShow.map((header, colIndex) => (
                    <TableCell 
                      key={`${row.id}-${header.id}`}
                      className={cn(
                        getCellAlignment(header.align),
                        getCellPaddingClass(),
                        settings.stickyFirstColumn && colIndex === 0 && 'sticky left-0 z-10 bg-background',
                        settings.cellAlignment === 'center' && 'text-center',
                        settings.cellAlignment === 'right' && 'text-right',
                      )}
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
                <TableCell 
                  colSpan={settings.showRowNumbers ? visibleHeadersToShow.length + 1 : visibleHeadersToShow.length} 
                  className="text-center py-8 text-muted-foreground"
                >
                  No hay datos disponibles
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          
          {/* Footer con mensajes de paginación */}
          {settings.enablePagination && sortedRows.length > settings.rowsPerPage && (
            <TableFooter>
              <TableRow>
                <TableCell 
                  colSpan={settings.showRowNumbers ? visibleHeadersToShow.length + 1 : visibleHeadersToShow.length}
                >
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
                        onClick={(e) => { 
                          e.stopPropagation();
                          setCurrentPage(prev => Math.max(prev - 1, 1));
                        }}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => { 
                          e.stopPropagation();
                          setCurrentPage(prev => 
                            Math.min(prev + 1, Math.ceil(sortedRows.length / settings.rowsPerPage))
                          );
                        }}
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
  };
  
  // Estado para controlar la visibilidad de columnas
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    headers.reduce((acc, header) => ({ ...acc, [header.id]: true }), {})
  );

  // Estado para controlar la densidad de la tabla
  const [density, setDensity] = useState<'compact' | 'normal' | 'spacious'>('normal');

  // Funciones para exportación de datos
  const exportToCSV = () => {
    if (headers.length === 0 || rows.length === 0) return;

    // Cabeceras CSV
    const csvHeaders = headers.map(h => `"${h.label}"`).join(',');
    
    // Filas CSV
    const csvRows = rows.map(row => 
      headers.map(header => {
        const value = row.cells[header.key];
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(',')
    ).join('\n');

    // Combinar cabeceras y filas
    const csvContent = `${csvHeaders}\n${csvRows}`;
    
    // Crear blob y enlace de descarga
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para copiar datos al portapapeles
  const copyToClipboard = () => {
    if (headers.length === 0 || rows.length === 0) return;

    // Crear tabla en formato de texto
    const headerRow = headers.map(h => h.label).join('\t');
    const dataRows = rows.map(row => 
      headers.map(header => row.cells[header.key]).join('\t')
    ).join('\n');

    const textContent = `${headerRow}\n${dataRows}`;
    
    navigator.clipboard.writeText(textContent)
      .catch(err => console.error('Error al copiar al portapapeles:', err));
  };

  // Función para imprimir la tabla
  const printTable = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableStyles = `
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th { background-color: #f0f0f0; font-weight: bold; text-align: left; padding: 8px; border: 1px solid #ddd; }
      td { padding: 8px; border: 1px solid #ddd; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      h1 { margin-bottom: 10px; }
      .description { font-size: 14px; color: #666; margin-bottom: 20px; }
    `;

    // Construir el HTML de la tabla
    let tableHTML = `
      <html>
        <head>
          <title>${title}</title>
          <style>${tableStyles}</style>
        </head>
        <body>
          <h1>${title}</h1>
          ${description ? `<div class="description">${description}</div>` : ''}
          <table>
            <thead>
              <tr>
                ${headers.map(h => `<th>${h.label}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map(row => `
                <tr>
                  ${headers.map(header => `
                    <td>${typeof row.cells[header.key] === 'boolean' 
                      ? (row.cells[header.key] ? '✓' : '✗') 
                      : row.cells[header.key]}
                    </td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(tableHTML);
    printWindow.document.close();
  };

  // Aplicar densidad a las celdas
  const getDensityClass = () => {
    switch (density) {
      case 'compact': return 'py-1 px-2';
      case 'spacious': return 'py-4 px-6';
      default: return 'py-2 px-4';
    }
  };

  // Aplicar filtros a las columnas visibles
  const getVisibleHeaders = () => {
    return headers.filter(header => visibleColumns[header.id]);
  };

  return (
    <Card 
      className={cn(
        'w-full overflow-hidden',
        isPreview ? 'cursor-default' : 'cursor-pointer hover:shadow-md transition-shadow'
      )}
      onClick={isPreview ? undefined : onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          
          {/* Botones de acciones para tabla */}
          {!isPreview && (
            <div className="flex space-x-1">
              {settings.enableExport && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); exportToCSV(); }}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Exportar a CSV</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {settings.enablePrint && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); printTable(); }}>
                        <Printer className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Imprimir tabla</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {settings.enableCopy && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); copyToClipboard(); }}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copiar al portapapeles</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {settings.enableDensityToggle && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Select 
                        value={density} 
                        onValueChange={(value) => { 
                          setDensity(value as 'compact' | 'normal' | 'spacious');
                        }}
                      >
                        <SelectTrigger className="w-[130px] h-9">
                          <SelectValue placeholder="Densidad" />
                        </SelectTrigger>
                        <SelectContent onClick={(e) => e.stopPropagation()}>
                          <SelectItem value="compact">Compacta</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="spacious">Espaciosa</SelectItem>
                        </SelectContent>
                      </Select>
                    </TooltipTrigger>
                    <TooltipContent>Ajustar densidad</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {settings.enableColumnVisibility && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="w-[200px]" onClick={(e) => e.stopPropagation()}>
                      <div className="p-2">
                        <h4 className="mb-2 font-medium">Visibilidad de columnas</h4>
                        <div className="space-y-2">
                          {headers.map(header => (
                            <div key={header.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`col-${header.id}`}
                                checked={visibleColumns[header.id]}
                                onCheckedChange={(checked) => {
                                  setVisibleColumns(prev => ({
                                    ...prev,
                                    [header.id]: !!checked
                                  }));
                                }}
                              />
                              <label htmlFor={`col-${header.id}`} className="text-sm">
                                {header.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {settings.enableColumnFilter && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                        <Filter className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="w-[250px]" onClick={(e) => e.stopPropagation()}>
                      <div className="p-2">
                        <h4 className="mb-2 font-medium">Filtros avanzados</h4>
                        <div className="space-y-2">
                          {/* Aquí irían controles de filtrado adicionales */}
                          <p className="text-xs text-muted-foreground">
                            Funcionalidad de filtros avanzados disponible en la versión Pro.
                          </p>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </div>
        
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
        
        {settings.enableSearch && (
          <div className="relative w-full max-w-sm mt-2">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
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