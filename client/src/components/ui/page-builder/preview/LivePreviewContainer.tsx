import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, History, Clock } from 'lucide-react';
import { Block } from '@shared/types';
import PreviewRenderer from './PreviewRenderer';
import PreviewControls from './PreviewControls';
import { useBuildStore } from '@/lib/store';
import { historyService } from '@/lib/history-service';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  
  // Estado para historial de cambios
  const [changeHistory, setChangeHistory] = useState<Array<{
    timestamp: number;
    description: string;
    snapshot?: any; // Referencia al snapshot de historyService
  }>>([]);
  
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
  
  // Función para actualizar inmediatamente la vista previa con los bloques y título proporcionados
  const syncWithEditor = useCallback(() => {
    setPreviewBlocks([...blocks]);
    setPreviewTitle(title);
    // Incrementamos el renderKey para forzar un nuevo render si es necesario
    setRenderKey(prev => prev + 1);
    
    // Si hay historial disponible, añadir entrada al historial de cambios
    if (showHistoryPanel) {
      // Obtener historial del servicio
      const history = historyService.getTimeline();
      if (history.length > 0) {
        const newEntry = {
          timestamp: Date.now(),
          description: `Actualización: ${new Date().toLocaleTimeString()}`,
          snapshot: history[history.length - 1]
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
  }, [blocks, title, showHistoryPanel]);
  
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
  
  const handleOpenNewWindow = () => {
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
              .preview-header { border-bottom: 1px solid #e2e8f0; padding: 20px 0; }
            </style>
          </head>
          <body>
            <div class="preview-content">
              <div class="preview-header">
                <h1>${previewTitle}</h1>
                <p>Última actualización: ${new Date().toLocaleTimeString()}</p>
              </div>
              <div id="preview-content">
                <p>Cargando vista previa...</p>
              </div>
            </div>
            <script>
              // Esta función permitiría recibir actualizaciones desde la ventana principal
              window.updatePreview = function(html) {
                document.getElementById('preview-content').innerHTML = html;
              };
            </script>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };
  
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
          <div className="w-64 border-r bg-white overflow-hidden flex flex-col">
            <div className="p-2 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-sm font-medium">Historial de cambios</h3>
              <Button variant="ghost" size="sm" onClick={toggleHistoryPanel} className="text-gray-500 h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              {changeHistory.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 text-center">
                  No hay cambios registrados
                </div>
              ) : (
                <ul className="divide-y">
                  {changeHistory.map((entry) => (
                    <li key={entry.timestamp} className="p-2 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleRestoreVersion(entry)}
                                className="h-6 w-6 p-0"
                              >
                                <Clock className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Restaurar a esta versión</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="text-xs mt-1">{entry.description}</div>
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
    </div>
  );
};

export default LivePreviewContainer;