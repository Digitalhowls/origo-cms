import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Maximize2, Minimize2, RefreshCw, ExternalLink, Smartphone, Tablet, Monitor } from 'lucide-react';

export interface PreviewControlsProps {
  previewMode: 'desktop' | 'tablet' | 'mobile';
  onPreviewModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  onToggleFullscreen: () => void;
  onOpenNewWindow?: () => void;
  onRefresh?: () => void;
  isFullscreen: boolean;
  className?: string;
}

/**
 * Componente que proporciona controles para la vista previa
 */
const PreviewControls: React.FC<PreviewControlsProps> = ({
  previewMode,
  onPreviewModeChange,
  onToggleFullscreen,
  onOpenNewWindow,
  onRefresh,
  isFullscreen,
  className,
}) => {
  return (
    <div className={cn('preview-controls flex items-center space-x-2', className)}>
      {/* Controles de dispositivo */}
      <div className="preview-device-controls bg-gray-100 rounded-md flex">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onPreviewModeChange('desktop')}
          className={cn(
            'rounded-r-none',
            previewMode === 'desktop' ? 'bg-white' : 'text-gray-500'
          )}
          title="Vista de escritorio"
        >
          <Monitor className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onPreviewModeChange('tablet')}
          className={cn(
            'rounded-none',
            previewMode === 'tablet' ? 'bg-white' : 'text-gray-500'
          )}
          title="Vista de tablet"
        >
          <Tablet className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onPreviewModeChange('mobile')}
          className={cn(
            'rounded-l-none',
            previewMode === 'mobile' ? 'bg-white' : 'text-gray-500'
          )}
          title="Vista de móvil"
        >
          <Smartphone className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Controles de acciones */}
      <div className="preview-action-controls flex space-x-1">
        {onRefresh && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onRefresh}
            className="text-gray-500"
            title="Refrescar vista previa"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
        
        {onOpenNewWindow && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onOpenNewWindow}
            className="text-gray-500"
            title="Abrir en nueva ventana"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onToggleFullscreen}
          className="text-gray-500"
          title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default PreviewControls;