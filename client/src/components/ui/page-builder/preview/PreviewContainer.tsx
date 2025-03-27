import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, Maximize2, Minimize2, RefreshCw, ExternalLink, Smartphone, Tablet, Monitor } from 'lucide-react';
import { Block } from '@shared/types';
import PreviewRenderer from './PreviewRenderer';
import PreviewControls from './PreviewControls';

export interface PreviewContainerProps {
  blocks: Block[];
  title: string;
  selectedBlockId?: string | null;
  onBlockSelect?: (blockId: string) => void;
  onClose?: () => void;
  className?: string;
  defaultMode?: 'split' | 'fullscreen';
}

/**
 * Contenedor principal para la vista previa que gestiona el estado
 * de los controles y la comunicación con el editor
 */
export const PreviewContainer: React.FC<PreviewContainerProps> = ({
  blocks,
  title,
  selectedBlockId,
  onBlockSelect,
  onClose,
  className,
  defaultMode = 'split'
}) => {
  // Estado para el modo de previsualización (móvil, tablet, escritorio)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  // Estado para el modo de pantalla (dividida o completa)
  const [isFullscreen, setIsFullscreen] = useState(defaultMode === 'fullscreen');
  // Estado para simular recarga de la vista previa
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  const handleRefresh = () => {
    // Incrementar la key para forzar un re-render del componente
    setRefreshKey(prev => prev + 1);
  };
  
  const handleOpenNewWindow = () => {
    // Abrir una nueva ventana con la vista previa
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>Vista previa: ${title}</title>
            <style>
              body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
              .preview-content { max-width: 1200px; margin: 0 auto; padding: 20px; }
              .preview-header { border-bottom: 1px solid #e2e8f0; padding: 20px 0; }
            </style>
          </head>
          <body>
            <div class="preview-content">
              <div class="preview-header">
                <h1>${title}</h1>
              </div>
              <div id="preview-content">
                <p>Cargando vista previa...</p>
              </div>
            </div>
            <script>
              // Aquí se podría implementar una comunicación para actualizar el contenido
              // desde la ventana principal, pero por ahora es solo una demostración
            </script>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };
  
  return (
    <div className={cn(
      'preview-container flex flex-col h-full',
      className
    )}>
      {/* Barra de herramientas con controles */}
      <div className="preview-toolbar flex justify-between items-center p-2 border-b bg-gray-50">
        <div className="preview-title font-medium">
          Vista previa: {title}
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
      <div className="flex-1 overflow-auto">
        {/* Usamos key para forzar el re-render cuando se refresca */}
        <PreviewRenderer
          key={refreshKey}
          blocks={blocks}
          title={title}
          className="h-full"
          selectedBlockId={selectedBlockId}
          onBlockSelect={onBlockSelect}
          previewMode={previewMode}
        />
      </div>
    </div>
  );
};

export default PreviewContainer;