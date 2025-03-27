import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, History, Clock, Search, Filter, Star, StarOff, Calendar, RotateCcw, RotateCw, Share2, ImageOff } from 'lucide-react';
import { Block, HistoryActionType, BlockType } from '@shared/types';
import PreviewRenderer from './PreviewRenderer';
import PreviewControls from './PreviewControls';
import { useBuildStore } from '@/lib/store';
import { historyService } from '@/lib/history-service';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Definición de tipos
export type DeviceType = 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'smallMobile';
export type Orientation = 'portrait' | 'landscape';

export interface LivePreviewContainerProps {
  blocks: Block[];
  title: string;
  onClose?: () => void;
  className?: string;
  defaultMode?: 'split' | 'fullscreen';
  syncInterval?: number; // Intervalo en ms para sincronizar (si es 0, será en tiempo real)
  showHistory?: boolean; // Mostrar panel de historial de cambios
}

/**
 * Contenedor de vista previa en tiempo real que se sincroniza automáticamente
 * con el estado de edición actual sin necesidad de actualizaciones manuales
 */
export const LivePreviewContainer: React.FC<LivePreviewContainerProps> = ({
  blocks,
  title,
  onClose,
  className,
  defaultMode = 'split',
  syncInterval = 0, // Por defecto, sincronización en tiempo real
  showHistory = true // Por defecto, mostrar historial
}) => {
  // Obtenemos el ID del bloque seleccionado del store para mantener la selección sincronizada
  const { selectedBlockId } = useBuildStore();
  
  // Estados locales para la vista previa
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [isFullscreen, setIsFullscreen] = useState(defaultMode === 'fullscreen');
  const [showHistoryPanel, setShowHistoryPanel] = useState(showHistory);
  
  // Estados para la sincronización de cambios
  const [previewBlocks, setPreviewBlocks] = useState<Block[]>(blocks || []);
  const [previewTitle, setPreviewTitle] = useState<string>(title || 'Vista Previa');
  
  // Estado para historial de cambios con estructura mejorada
  const [changeHistory, setChangeHistory] = useState<Array<{
    timestamp: number;
    description: string;
    snapshot?: any; // Referencia al snapshot de historyService
    type?: HistoryActionType; // Tipo de cambio
    blocksChanged?: number; // Número de bloques afectados
    blockTypes?: BlockType[]; // Tipos de bloques afectados
    important?: boolean; // Si es un cambio importante
    previewImage?: string; // Miniatura de la vista previa
  }>>([]);
  
  // Estado para el filtrado del historial
  const [historyFilter, setHistoryFilter] = useState<{
    searchTerm: string;
    typeFilter: HistoryActionType | 'all';
    timeRange: 'all' | 'last-hour' | 'today' | 'yesterday' | 'week';
    onlyImportant: boolean;
  }>({
    searchTerm: '',
    typeFilter: 'all',
    timeRange: 'all',
    onlyImportant: false,
  });
  
  // Referencia al intervalo de sincronización si se usa
  const syncTimerRef = useRef<number | null>(null);
  
  // Contador para forzar re-renders en caso necesario
  const [renderKey, setRenderKey] = useState(0);
  
  // Función para mapear el tipo de dispositivo de PreviewControls a PreviewRenderer
  const getPreviewMode = useCallback((type: DeviceType): 'desktop' | 'tablet' | 'mobile' => {
    if (type === 'desktop' || type === 'laptop') return 'desktop';
    if (type === 'tablet') return 'tablet';
    return 'mobile'; // 'mobile' o 'smallMobile'
  }, []);
  
  // Función para generar una miniatura de la vista previa
  const generatePreviewThumbnail = useCallback(async (): Promise<string | null> => {
    // Nota: Para implementación real, necesitaríamos integrar html2canvas o similar
    // y capturar el contenedor de vista previa
    try {
      // Código comentado que implementaría la captura real en el futuro
      /*
      if (typeof html2canvas !== 'undefined') {
        const previewElement = document.querySelector('.preview-container');
        if (previewElement) {
          const canvas = await html2canvas(previewElement, {
            scale: 0.25, // Escala para reducir tamaño
            logging: false,
            backgroundColor: '#f8f9fa'
          });
          return canvas.toDataURL('image/jpeg', 0.7); // Formato JPEG con 70% de calidad
        }
      }
      */
      
      // Por ahora, generamos un placeholder en lugar de una captura real
      // usando colores basados en el tipo de acción para simular la funcionalidad
      const getRandomColor = () => {
        const colors = ['#e0f2fe', '#dcfce7', '#fef3c7', '#fee2e2', '#f3e8ff', '#e0e7ff', '#f1f5f9'];
        return colors[Math.floor(Math.random() * colors.length)];
      };
      
      // Crear un canvas programáticamente para el placeholder
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 180;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Fondo
        ctx.fillStyle = getRandomColor();
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Simular algunos bloques
        for (let i = 0; i < Math.min(blocks.length, 5); i++) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fillRect(20, 20 + i * 30, canvas.width - 40, 20);
        }
        
        // Añadir texto
        ctx.font = '14px Arial';
        ctx.fillStyle = '#475569';
        ctx.fillText(`${previewTitle} - ${new Date().toLocaleTimeString()}`, 25, 15);
        
        return canvas.toDataURL('image/png');
      }
      
      return null;
    } catch (error) {
      console.error('Error generating preview thumbnail:', error);
      return null;
    }
  }, [blocks, previewTitle]);

  // Función para contar cuántos bloques se modificaron entre dos estados
  const countBlockChanges = useCallback((prevBlocks: Block[], newBlocks: Block[]): number => {
    if (!prevBlocks) return newBlocks.length; // Si es el primer estado, todos son nuevos
    
    let changesCount = 0;
    // Comparar tamaños de arrays
    if (prevBlocks.length !== newBlocks.length) {
      // Si cambia el número total, sabemos que hay al menos esa diferencia
      changesCount = Math.abs(prevBlocks.length - newBlocks.length);
    }
    
    // Comprobar bloques modificados (comparación simple por ID y tipo)
    const oldBlocksMap = new Map(prevBlocks.map(b => [b.id, b]));
    
    for (const newBlock of newBlocks) {
      const oldBlock = oldBlocksMap.get(newBlock.id);
      if (!oldBlock) {
        // Es un bloque nuevo
        changesCount++;
        continue;
      }
      
      // Comparación simple para detectar cambios
      // En una implementación real, sería mejor comparar propiedades específicas
      if (JSON.stringify(newBlock) !== JSON.stringify(oldBlock)) {
        changesCount++;
      }
    }
    
    return changesCount;
  }, []);

  // Función para determinar qué tipos de bloques se modificaron
  const getChangedBlockTypes = useCallback((prevBlocks: Block[], newBlocks: Block[]): BlockType[] => {
    if (!prevBlocks) return Array.from(new Set(newBlocks.map(b => b.type)));
    
    const changedTypes = new Set<BlockType>();
    const oldBlocksMap = new Map(prevBlocks.map(b => [b.id, b]));
    
    // Detectar bloques nuevos o modificados
    for (const newBlock of newBlocks) {
      const oldBlock = oldBlocksMap.get(newBlock.id);
      if (!oldBlock || JSON.stringify(newBlock) !== JSON.stringify(oldBlock)) {
        changedTypes.add(newBlock.type);
      }
    }
    
    // Detectar bloques eliminados
    for (const oldBlock of prevBlocks) {
      if (!newBlocks.some(b => b.id === oldBlock.id)) {
        changedTypes.add(oldBlock.type);
      }
    }
    
    return Array.from(changedTypes);
  }, []);

  // Función para detectar el tipo de cambio realizado
  const detectChangeType = useCallback((prevBlocks: Block[], newBlocks: Block[]): HistoryActionType => {
    if (!prevBlocks) return HistoryActionType.INITIAL;
    
    // Detectar si se añadieron bloques
    if (newBlocks.length > prevBlocks.length) {
      const newBlockIds = new Set(newBlocks.map(b => b.id));
      const oldBlockIds = new Set(prevBlocks.map(b => b.id));
      
      // Verificar si realmente hay IDs nuevos
      const hasNewIds = Array.from(newBlockIds).some(id => !oldBlockIds.has(id));
      if (hasNewIds) return HistoryActionType.ADD_BLOCK;
    }
    
    // Detectar si se eliminaron bloques
    if (newBlocks.length < prevBlocks.length) {
      return HistoryActionType.REMOVE_BLOCK;
    }
    
    // Si el número de bloques es el mismo, podría ser una actualización o un movimiento
    // Comprobamos si cambió la estructura (para detectar movimientos)
    const structureChanged = newBlocks.some((block, index) => {
      return prevBlocks[index]?.id !== block.id;
    });
    
    if (structureChanged) return HistoryActionType.MOVE_BLOCK;
    
    // En otro caso, asumimos que es una actualización de propiedades
    return HistoryActionType.UPDATE_BLOCK;
  }, []);

  // Función para actualizar inmediatamente la vista previa con los bloques y título proporcionados
  const syncWithEditor = useCallback(async () => {
    // Guardar el estado anterior para comparar
    const prevBlocks = [...previewBlocks];
    
    // Actualizar el estado
    setPreviewBlocks([...blocks]);
    setPreviewTitle(title);
    // Incrementamos el renderKey para forzar un nuevo render si es necesario
    setRenderKey(prev => prev + 1);
    
    // Si hay historial disponible, añadir entrada al historial de cambios
    if (showHistoryPanel) {
      // Obtener historial del servicio
      const history = historyService.getTimeline();
      if (history.length > 0) {
        // Generar miniatura (posiblemente null por ahora)
        const thumbnailImage = await generatePreviewThumbnail();
        
        // Detectar qué tipo de cambio se ha realizado
        const changeType = detectChangeType(prevBlocks, blocks);
        
        // Contar cuántos bloques han cambiado
        const blocksChangedCount = countBlockChanges(prevBlocks, blocks);
        
        // Obtener los tipos de bloques modificados
        const changedBlockTypes = getChangedBlockTypes(prevBlocks, blocks);
        
        // Generar una descripción basada en el tipo de cambio
        let description = `Actualización: ${new Date().toLocaleTimeString()}`;
        
        switch (changeType) {
          case HistoryActionType.ADD_BLOCK:
            description = `Añadido ${blocksChangedCount} bloque${blocksChangedCount !== 1 ? 's' : ''}`;
            break;
          case HistoryActionType.REMOVE_BLOCK:
            description = `Eliminado ${blocksChangedCount} bloque${blocksChangedCount !== 1 ? 's' : ''}`;
            break;
          case HistoryActionType.MOVE_BLOCK:
            description = `Reorganización de bloques`;
            break;
          case HistoryActionType.UPDATE_BLOCK:
            description = `Actualizado ${blocksChangedCount} bloque${blocksChangedCount !== 1 ? 's' : ''}`;
            break;
          case HistoryActionType.UPDATE_PAGE_META:
            description = `Actualizada información de página`;
            break;
          case HistoryActionType.SAVED_SNAPSHOT:
            description = `Guardado manual`;
            break;
          case HistoryActionType.AUTO_SAVED:
            description = `Guardado automático`;
            break;
        }
        
        // Crear la nueva entrada con todos los metadatos
        const newEntry = {
          timestamp: Date.now(),
          description,
          snapshot: history[history.length - 1],
          type: changeType,
          blocksChanged: blocksChangedCount,
          blockTypes: changedBlockTypes,
          important: changeType === HistoryActionType.SAVED_SNAPSHOT, // Marcar guardados manuales como importantes
          previewImage: thumbnailImage || undefined
        };
        
        setChangeHistory(prev => {
          // Evitar duplicados basados en timestamp
          if (prev.length > 0 && prev[prev.length - 1].timestamp === newEntry.timestamp) {
            return prev;
          }
          // Limitar a 50 entradas máximo
          const updatedHistory = [...prev, newEntry];
          return updatedHistory.slice(-50);
        });
      }
    }
  }, [blocks, title, showHistoryPanel, previewBlocks, generatePreviewThumbnail, detectChangeType, countBlockChanges, getChangedBlockTypes]);
  
  // Efecto para configurar la sincronización automática
  useEffect(() => {
    // Sincronizamos inmediatamente al montar el componente
    syncWithEditor();
    
    // Si se especificó un intervalo de sincronización, lo configuramos
    if (syncInterval > 0) {
      syncTimerRef.current = window.setInterval(syncWithEditor, syncInterval);
    }
    
    // Limpieza del intervalo si existe
    return () => {
      if (syncTimerRef.current !== null) {
        clearInterval(syncTimerRef.current);
      }
    };
  }, [syncWithEditor, syncInterval, blocks, title]);
  
  // Manejador para cuando se selecciona un bloque en la vista previa
  const handleBlockSelect = (blockId: string) => {
    // Actualizamos el bloque seleccionado en el editor
    useBuildStore.getState().setSelectedBlockId(blockId);
  };
  
  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  const handleRefresh = () => {
    // Forzar sincronización inmediata
    syncWithEditor();
  };
  
  // Estado para el enlace compartible generado
  const [shareLink, setShareLink] = useState<string | null>(null);
  
  // Estado para indicar si se está generando un enlace compartible
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false);
  
  // Estado para previsualización antes de restaurar
  const [previewBeforeRestore, setPreviewBeforeRestore] = useState<{
    entry: typeof changeHistory[0] | null;
    previewData: { blocks: Block[], title: string } | null;
  }>({
    entry: null,
    previewData: null
  });

  // Función para generar un enlace compartible
  const generateShareLink = useCallback(async () => {
    setIsGeneratingShareLink(true);
    
    try {
      // Generar un ID único para esta vista previa
      const previewId = `preview-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // En una implementación real, aquí enviaríamos los datos al servidor
      // para crear una vista previa compartible y obtener una URL
      
      // Por ahora, simulamos un enlace local
      const baseUrl = window.location.origin;
      const shareableLink = `${baseUrl}/shared-preview/${previewId}`;
      
      // Almacenamos el enlace en el estado
      setShareLink(shareableLink);
      
      // En una implementación real, aquí se guardarían los bloques y configuración
      // en el servidor asociados al previewId para que sean accesibles desde el enlace
      
      return shareableLink;
    } catch (error) {
      console.error('Error al generar enlace compartible:', error);
      return null;
    } finally {
      setIsGeneratingShareLink(false);
    }
  }, [previewBlocks, previewTitle]);

  // Función para previsualizar un estado antes de restaurarlo
  const handlePreviewBeforeRestore = useCallback((entry: typeof changeHistory[0]) => {
    if (entry.snapshot && historyService) {
      // Obtenemos los datos del snapshot sin modificar el estado actual
      try {
        const snapshotId = typeof entry.snapshot === 'object' && entry.snapshot.id 
          ? entry.snapshot.id 
          : entry.snapshot;
          
        // En un caso real, deberíamos obtener una copia del estado sin modificar el actual
        // Por ahora, simplemente asignamos los mismos bloques para la simulación
        setPreviewBeforeRestore({
          entry,
          previewData: {
            blocks: [...previewBlocks], // Simulado: en realidad debería ser del snapshot
            title: previewTitle
          }
        });
      } catch (error) {
        console.error('Error al previsualizar estado anterior:', error);
      }
    }
  }, [previewBlocks, previewTitle]);

  // Función para abrir una nueva ventana con la vista previa
  const handleOpenNewWindow = useCallback(async () => {
    // Generar un enlace compartible primero (opcional)
    const shareableLink = await generateShareLink();
    
    // Abrir una nueva ventana con la vista previa
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      // Generamos el HTML base para la ventana de vista previa
      previewWindow.document.write(`
        <html>
          <head>
            <title>Vista previa: ${previewTitle}</title>
            <link rel="stylesheet" href="/dist/output.css"> <!-- Enlaza con el CSS generado por Tailwind -->
            <style>
              body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
              .preview-content { max-width: 1200px; margin: 0 auto; padding: 20px; }
              .preview-header { border-bottom: 1px solid #e2e8f0; padding: 20px 0; display: flex; justify-content: space-between; align-items: center; }
              .preview-toolbar { background: #f8fafc; padding: 8px; border-bottom: 1px solid #e2e8f0; display: flex; gap: 8px; }
              .preview-button { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px; font-size: 12px; cursor: pointer; }
              .preview-button:hover { background: #e2e8f0; }
              .device-preview { border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px auto; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
              .preview-mobile { width: 375px; height: 667px; }
              .preview-tablet { width: 768px; height: 1024px; }
              .preview-desktop { width: 100%; max-width: 1280px; height: 800px; }
              .orientation-landscape .preview-mobile { width: 667px; height: 375px; }
              .orientation-landscape .preview-tablet { width: 1024px; height: 768px; }
              .preview-info { margin-top: 8px; font-size: 12px; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="preview-toolbar">
              <button class="preview-button" id="desktop-btn">Desktop</button>
              <button class="preview-button" id="tablet-btn">Tablet</button>
              <button class="preview-button" id="mobile-btn">Mobile</button>
              <button class="preview-button" id="rotate-btn">Rotar</button>
              ${shareableLink ? `<div style="margin-left: auto; font-size: 12px;">
                Enlace compartible: <a href="${shareableLink}" target="_blank">${shareableLink}</a>
              </div>` : ''}
            </div>
            <div class="preview-content">
              <div class="preview-header">
                <h1>${previewTitle}</h1>
                <p>Última actualización: ${new Date().toLocaleTimeString()}</p>
              </div>
              <div class="device-preview preview-desktop" id="preview-container">
                <div id="preview-content">
                  <p>Cargando vista previa...</p>
                </div>
              </div>
              <div class="preview-info">
                <p>Dispositivo: <span id="device-info">Desktop</span></p>
              </div>
            </div>
            <script>
              // Función para actualizar la vista previa
              window.updatePreview = function(html) {
                document.getElementById('preview-content').innerHTML = html;
              };
              
              // Controles para cambiar el dispositivo
              document.getElementById('desktop-btn').addEventListener('click', function() {
                const container = document.getElementById('preview-container');
                container.className = 'device-preview preview-desktop';
                document.getElementById('device-info').textContent = 'Desktop';
              });
              
              document.getElementById('tablet-btn').addEventListener('click', function() {
                const container = document.getElementById('preview-container');
                container.className = 'device-preview preview-tablet';
                document.getElementById('device-info').textContent = 'Tablet';
              });
              
              document.getElementById('mobile-btn').addEventListener('click', function() {
                const container = document.getElementById('preview-container');
                container.className = 'device-preview preview-mobile';
                document.getElementById('device-info').textContent = 'Mobile';
              });
              
              document.getElementById('rotate-btn').addEventListener('click', function() {
                const container = document.getElementById('preview-container');
                if (container.parentElement.classList.contains('orientation-landscape')) {
                  container.parentElement.classList.remove('orientation-landscape');
                  document.getElementById('device-info').textContent += ' (Portrait)';
                } else {
                  container.parentElement.classList.add('orientation-landscape');
                  document.getElementById('device-info').textContent += ' (Landscape)';
                }
              });
            </script>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  }, [previewTitle, generateShareLink]);
  
  // Función para restaurar una versión del historial
  const handleRestoreVersion = useCallback((entry: typeof changeHistory[0]) => {
    if (entry.snapshot && historyService) {
      // Restauramos el estado desde el snapshot del historial
      const snapshotId = typeof entry.snapshot === 'object' && entry.snapshot.id 
        ? entry.snapshot.id 
        : entry.snapshot;
        
      historyService.restoreSnapshot(snapshotId);
      
      // Sincronizamos la vista previa con los datos restaurados
      syncWithEditor();
    }
  }, [syncWithEditor]);

  // Función para alternar el panel de historial
  const toggleHistoryPanel = useCallback(() => {
    setShowHistoryPanel(prev => !prev);
  }, []);

  return (
    <div className={cn(
      'live-preview-container flex flex-col h-full border rounded-lg shadow-sm overflow-hidden',
      className
    )}>
      {/* Barra de herramientas con controles */}
      <div className="preview-toolbar flex justify-between items-center p-2 border-b bg-gray-50">
        <div className="preview-title font-medium text-sm">
          <span className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Vista previa en tiempo real: {previewTitle}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <PreviewControls
            previewMode={deviceType}
            onPreviewModeChange={setDeviceType}
            orientation={orientation}
            onOrientationChange={setOrientation}
            onToggleFullscreen={handleToggleFullscreen}
            onOpenNewWindow={handleOpenNewWindow}
            onRefresh={handleRefresh}
            isFullscreen={isFullscreen}
            className="mx-2"
          />
          
          {/* Botón para compartir vista previa */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={async () => {
                    await generateShareLink();
                  }}
                  className="text-gray-500"
                  disabled={isGeneratingShareLink}
                >
                  {isGeneratingShareLink ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                  ) : (
                    <Share2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Compartir vista previa</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Botón de historial */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleHistoryPanel}
                  className={cn("text-gray-500", showHistoryPanel && "bg-gray-200")}
                >
                  <History className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Historial de cambios</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Contenedor principal con vista previa e historial */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel de historial de cambios */}
        {showHistoryPanel && (
          <div className="w-72 border-r bg-white overflow-hidden flex flex-col">
            <div className="p-2 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-sm font-medium">Historial de cambios</h3>
              <div className="flex items-center gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-500 h-6 w-6 p-0">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Filtrar historial</h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="history-search">Buscar</Label>
                        <Input
                          id="history-search"
                          type="text"
                          placeholder="Descripción o etiquetas"
                          value={historyFilter.searchTerm}
                          onChange={(e) => setHistoryFilter({...historyFilter, searchTerm: e.target.value})}
                          className="h-8"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="history-type">Tipo de cambio</Label>
                        <Select 
                          value={historyFilter.typeFilter} 
                          onValueChange={(value) => setHistoryFilter({...historyFilter, typeFilter: value as any})}
                        >
                          <SelectTrigger id="history-type" className="h-8">
                            <SelectValue placeholder="Todos los tipos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos los tipos</SelectItem>
                            <SelectItem value={HistoryActionType.ADD_BLOCK}>Añadir bloque</SelectItem>
                            <SelectItem value={HistoryActionType.UPDATE_BLOCK}>Actualizar bloque</SelectItem>
                            <SelectItem value={HistoryActionType.REMOVE_BLOCK}>Eliminar bloque</SelectItem>
                            <SelectItem value={HistoryActionType.MOVE_BLOCK}>Mover bloque</SelectItem>
                            <SelectItem value={HistoryActionType.UPDATE_PAGE_META}>Metadatos de página</SelectItem>
                            <SelectItem value={HistoryActionType.SAVED_SNAPSHOT}>Guardado manual</SelectItem>
                            <SelectItem value={HistoryActionType.AUTO_SAVED}>Guardado automático</SelectItem>
                            <SelectItem value={HistoryActionType.UPDATE_ANIMATION}>Animaciones</SelectItem>
                            <SelectItem value={HistoryActionType.UPDATE_GRID}>Cambios en grid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="history-time">Rango de tiempo</Label>
                        <Select 
                          value={historyFilter.timeRange} 
                          onValueChange={(value) => setHistoryFilter({...historyFilter, timeRange: value as any})}
                        >
                          <SelectTrigger id="history-time" className="h-8">
                            <SelectValue placeholder="Todo el tiempo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todo el tiempo</SelectItem>
                            <SelectItem value="last-hour">Última hora</SelectItem>
                            <SelectItem value="today">Hoy</SelectItem>
                            <SelectItem value="yesterday">Ayer</SelectItem>
                            <SelectItem value="week">Esta semana</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="important-only" 
                          checked={historyFilter.onlyImportant}
                          onCheckedChange={(checked) => setHistoryFilter({...historyFilter, onlyImportant: checked})}
                        />
                        <Label htmlFor="important-only">Solo cambios importantes</Label>
                      </div>
                      
                      <div className="flex justify-between pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setHistoryFilter({
                            searchTerm: '',
                            typeFilter: 'all',
                            timeRange: 'all',
                            onlyImportant: false,
                          })}
                        >
                          Resetear
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => {
                            // Aplicar filtros (se aplican automáticamente con los cambios de estado)
                          }}
                        >
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button variant="ghost" size="sm" onClick={toggleHistoryPanel} className="text-gray-500 h-6 w-6 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Barra de búsqueda rápida */}
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar cambios"
                  value={historyFilter.searchTerm}
                  onChange={(e) => setHistoryFilter({...historyFilter, searchTerm: e.target.value})}
                  className="h-7 pl-8 text-xs"
                />
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              {changeHistory.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 text-center">
                  No hay cambios registrados
                </div>
              ) : (
                <ul className="divide-y">
                  {/* Filtrar los cambios según los criterios */}
                  {changeHistory
                    .filter(entry => {
                      // Aplicar filtro de búsqueda
                      if (historyFilter.searchTerm && !entry.description.toLowerCase().includes(historyFilter.searchTerm.toLowerCase())) {
                        return false;
                      }
                      
                      // Aplicar filtro por tipo
                      if (historyFilter.typeFilter !== 'all' && entry.type !== historyFilter.typeFilter) {
                        return false;
                      }
                      
                      // Aplicar filtro por tiempo
                      if (historyFilter.timeRange !== 'all') {
                        const now = new Date();
                        const entryDate = new Date(entry.timestamp);
                        
                        if (historyFilter.timeRange === 'last-hour') {
                          const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
                          if (entryDate < hourAgo) return false;
                        } else if (historyFilter.timeRange === 'today') {
                          if (entryDate.getDate() !== now.getDate() ||
                              entryDate.getMonth() !== now.getMonth() ||
                              entryDate.getFullYear() !== now.getFullYear()) {
                            return false;
                          }
                        } else if (historyFilter.timeRange === 'yesterday') {
                          const yesterday = new Date(now);
                          yesterday.setDate(yesterday.getDate() - 1);
                          if (entryDate.getDate() !== yesterday.getDate() ||
                              entryDate.getMonth() !== yesterday.getMonth() ||
                              entryDate.getFullYear() !== yesterday.getFullYear()) {
                            return false;
                          }
                        } else if (historyFilter.timeRange === 'week') {
                          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                          if (entryDate < weekAgo) return false;
                        }
                      }
                      
                      // Aplicar filtro por importancia
                      if (historyFilter.onlyImportant && !entry.important) {
                        return false;
                      }
                      
                      return true;
                    })
                    .map((entry) => (
                      <li 
                        key={entry.timestamp} 
                        className={cn(
                          "p-2 hover:bg-gray-50", 
                          entry.important && "bg-amber-50 hover:bg-amber-100"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            {entry.important && <Star className="h-3 w-3 text-amber-500" />}
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </span>
                          <div className="flex gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => {
                                      const updatedHistory = changeHistory.map(e => 
                                        e.timestamp === entry.timestamp 
                                          ? {...e, important: !e.important} 
                                          : e
                                      );
                                      setChangeHistory(updatedHistory);
                                    }}
                                    className="h-5 w-5 p-0"
                                  >
                                    {entry.important ? 
                                      <StarOff className="h-3 w-3 text-gray-400" /> : 
                                      <Star className="h-3 w-3 text-gray-400" />
                                    }
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{entry.important ? 'Quitar marca importante' : 'Marcar como importante'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handlePreviewBeforeRestore(entry)}
                                    className="h-5 w-5 p-0"
                                  >
                                    <Clock className="h-3 w-3 text-gray-400" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Previsualizar esta versión</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleRestoreVersion(entry)}
                                    className="h-5 w-5 p-0"
                                  >
                                    <RotateCcw className="h-3 w-3 text-gray-400" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Restaurar a esta versión</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                        
                        <div className="text-xs">{entry.description}</div>
                        
                        {/* Mostrar metadatos adicionales */}
                        {entry.type && (
                          <Badge 
                            variant="outline" 
                            className="mt-1 h-4 text-[10px] px-1 rounded-sm font-normal"
                          >
                            {entry.type}
                          </Badge>
                        )}
                        
                        {entry.blocksChanged && (
                          <div className="text-[10px] text-gray-500 mt-1">
                            {entry.blocksChanged} bloque{entry.blocksChanged !== 1 ? 's' : ''} modificado{entry.blocksChanged !== 1 ? 's' : ''}
                          </div>
                        )}
                        
                        {/* Vista previa en miniatura si está disponible */}
                        {entry.previewImage && (
                          <div className="mt-1 border rounded overflow-hidden">
                            <img 
                              src={entry.previewImage} 
                              alt="Vista previa" 
                              className="w-full h-20 object-cover"
                            />
                          </div>
                        )}
                      </li>
                    ))}
                </ul>
              )}
            </ScrollArea>
          </div>
        )}
        
        {/* Contenedor de la vista previa */}
        <div className="flex-1 overflow-auto bg-gray-100">
          {/* Usamos key con renderKey para forzar el re-render cuando sea necesario */}
          <PreviewRenderer
            key={renderKey}
            blocks={previewBlocks}
            title={previewTitle}
            className="h-full"
            selectedBlockId={selectedBlockId}
            onBlockSelect={handleBlockSelect}
            previewMode={getPreviewMode(deviceType)}
            isLivePreview={true}
          />
        </div>
      </div>
      
      {/* Indicador de sincronización */}
      <div className="preview-status text-xs p-1 bg-gray-50 text-gray-500 border-t text-center">
        {syncInterval > 0 
          ? `Sincronización automática cada ${syncInterval / 1000} segundos`
          : 'Sincronización en tiempo real activada'}
      </div>
      
      {/* Modal para previsualizar antes de restaurar */}
      <Dialog 
        open={previewBeforeRestore.entry !== null} 
        onOpenChange={(open) => !open && setPreviewBeforeRestore({entry: null, previewData: null})}
      >
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Previsualizar estado anterior</DialogTitle>
            <DialogDescription>
              {previewBeforeRestore.entry && (
                <div className="text-sm text-muted-foreground">
                  {previewBeforeRestore.entry.description} - {new Date(previewBeforeRestore.entry.timestamp).toLocaleString()}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="h-[500px] overflow-auto border rounded">
            {previewBeforeRestore.previewData && (
              <PreviewRenderer
                blocks={previewBeforeRestore.previewData.blocks}
                title={previewBeforeRestore.previewData.title}
                className="h-full"
                previewMode={getPreviewMode(deviceType)}
                isLivePreview={false}
              />
            )}
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewBeforeRestore({entry: null, previewData: null})}
            >
              Cancelar
            </Button>
            {previewBeforeRestore.entry && (
              <Button
                onClick={() => {
                  if (previewBeforeRestore.entry) {
                    handleRestoreVersion(previewBeforeRestore.entry);
                    setPreviewBeforeRestore({entry: null, previewData: null});
                  }
                }}
              >
                Restaurar este estado
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal para compartir enlace */}
      <Dialog 
        open={shareLink !== null} 
        onOpenChange={(open) => !open && setShareLink(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Compartir vista previa</DialogTitle>
            <DialogDescription>
              Envía este enlace para compartir la vista previa actual
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2">
            <Input
              readOnly
              value={shareLink || ''}
              className="flex-1"
            />
            <Button
              variant="ghost"
              className="shrink-0 h-8"
              onClick={() => {
                if (shareLink) {
                  navigator.clipboard.writeText(shareLink);
                  // En un caso real, aquí añadiríamos notificación de copiado
                }
              }}
            >
              Copiar
            </Button>
          </div>
          
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShareLink(null)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LivePreviewContainer;