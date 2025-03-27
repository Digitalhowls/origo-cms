import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, Maximize2, Minimize2, RefreshCw, ExternalLink, Smartphone, Tablet, Monitor } from 'lucide-react';
import { Block } from '@shared/types';
import PreviewRenderer from './PreviewRenderer';
import PreviewControls from './PreviewControls';
import { useBuildStore } from '@/lib/store';

export interface LivePreviewContainerProps {
  blocks: Block[];
  title: string;
  onClose?: () => void;
  className?: string;
  defaultMode?: 'split' | 'fullscreen';
  syncInterval?: number; // Intervalo en ms para sincronizar (si es 0, será en tiempo real)
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
  syncInterval = 0 // Por defecto, sincronización en tiempo real
}) => {
  // Obtenemos el ID del bloque seleccionado del store para mantener la selección sincronizada
  const { selectedBlockId } = useBuildStore();
  
  // Estado local para la vista previa
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(defaultMode === 'fullscreen');
  
  // Estados para la sincronización de cambios
  const [previewBlocks, setPreviewBlocks] = useState<Block[]>(blocks || []);
  const [previewTitle, setPreviewTitle] = useState<string>(title || 'Vista Previa');
  
  // Referencia al intervalo de sincronización si se usa
  const syncTimerRef = useRef<number | null>(null);
  
  // Contador para forzar re-renders en caso necesario
  const [renderKey, setRenderKey] = useState(0);
  
  // Función para actualizar inmediatamente la vista previa con los bloques y título proporcionados
  const syncWithEditor = useCallback(() => {
    setPreviewBlocks([...blocks]);
    setPreviewTitle(title);
    // Incrementamos el renderKey para forzar un nuevo render si es necesario
    setRenderKey(prev => prev + 1);
  }, [blocks, title]);
  
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
      
      // Podríamos implementar una comunicación entre ventanas para mantener actualizada
      // la vista previa, pero eso sería una mejora futura
    }
  };
  
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
        
        <PreviewControls
          previewMode={previewMode}
          onPreviewModeChange={setPreviewMode}
          onToggleFullscreen={handleToggleFullscreen}
          onOpenNewWindow={handleOpenNewWindow}
          onRefresh={handleRefresh}
          isFullscreen={isFullscreen}
          className="mx-auto"
        />
        
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
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
          previewMode={previewMode}
          isLivePreview={true}
        />
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