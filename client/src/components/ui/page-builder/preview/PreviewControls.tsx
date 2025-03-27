import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Maximize2, Minimize2, RefreshCw, ExternalLink, Smartphone, Tablet, Monitor,
  RotateCw, Share2, PhoneCall, PlusSquare, Laptop, ChevronsLeftRight
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Importamos los tipos desde LivePreviewContainer
import { DeviceType, Orientation } from './LivePreviewContainer';

export interface PreviewControlsProps {
  previewMode: DeviceType;
  orientation?: Orientation;
  onPreviewModeChange: (mode: DeviceType) => void;
  onOrientationChange?: (orientation: Orientation) => void;
  onToggleFullscreen: () => void;
  onOpenNewWindow?: () => void;
  onRefresh?: () => void;
  onShare?: () => void;
  isFullscreen: boolean;
  className?: string;
}

// Información sobre dispositivos
const DEVICE_INFO = {
  desktop: { name: 'Escritorio', width: '100%', height: '100%', icon: <Monitor /> },
  laptop: { name: 'Portátil', width: '1366px', height: '768px', icon: <Laptop /> },
  tablet: { name: 'Tablet', width: '768px', height: '1024px', icon: <Tablet /> },
  mobile: { name: 'Móvil', width: '375px', height: '667px', icon: <Smartphone /> },
  smallMobile: { name: 'Móvil pequeño', width: '320px', height: '568px', icon: <PhoneCall /> }
};

/**
 * Componente que proporciona controles avanzados para la vista previa
 */
const PreviewControls: React.FC<PreviewControlsProps> = ({
  previewMode,
  orientation = 'portrait',
  onPreviewModeChange,
  onOrientationChange,
  onToggleFullscreen,
  onOpenNewWindow,
  onRefresh,
  onShare,
  isFullscreen,
  className,
}) => {
  // Estado para mostrar dimensiones de dispositivo
  const [showDimensions, setShowDimensions] = useState(false);
  
  // Obtener información del dispositivo actual
  const currentDevice = DEVICE_INFO[previewMode] || DEVICE_INFO.desktop;
  
  // Determinar las dimensiones según la orientación
  const deviceWidth = orientation === 'portrait' ? currentDevice.width : currentDevice.height;
  const deviceHeight = orientation === 'portrait' ? currentDevice.height : currentDevice.width;
  
  // Alternar orientación
  const handleToggleOrientation = () => {
    if (onOrientationChange) {
      onOrientationChange(orientation === 'portrait' ? 'landscape' : 'portrait');
    }
  };
  
  return (
    <div className={cn('preview-controls flex items-center space-x-2', className)}>
      {/* Menu desplegable de dispositivos */}
      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 h-8"
                >
                  <span className="sr-only">Seleccionar dispositivo</span>
                  {currentDevice.icon}
                  <span className="hidden sm:inline text-xs">{currentDevice.name}</span>
                  {showDimensions && (
                    <span className="text-xs text-muted-foreground">
                      {deviceWidth} × {deviceHeight}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Seleccionar dispositivo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DropdownMenuContent align="center" className="w-48">
          <DropdownMenuItem onClick={() => onPreviewModeChange('desktop')} 
            className={cn("flex items-center gap-2", previewMode === 'desktop' && "bg-accent")}>
            <Monitor className="h-4 w-4" />
            <span>Escritorio</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => onPreviewModeChange('laptop')}
            className={cn("flex items-center gap-2", previewMode === 'laptop' && "bg-accent")}>
            <Laptop className="h-4 w-4" />
            <span>Portátil (1366×768)</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => onPreviewModeChange('tablet')}
            className={cn("flex items-center gap-2", previewMode === 'tablet' && "bg-accent")}>
            <Tablet className="h-4 w-4" />
            <span>Tablet (768×1024)</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => onPreviewModeChange('mobile')}
            className={cn("flex items-center gap-2", previewMode === 'mobile' && "bg-accent")}>
            <Smartphone className="h-4 w-4" />
            <span>Móvil (375×667)</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => onPreviewModeChange('smallMobile')}
            className={cn("flex items-center gap-2", previewMode === 'smallMobile' && "bg-accent")}>
            <PhoneCall className="h-4 w-4" />
            <span>Móvil pequeño (320×568)</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowDimensions(!showDimensions)}
            className="flex items-center gap-2">
            <PlusSquare className="h-4 w-4" />
            <span>{showDimensions ? "Ocultar dimensiones" : "Mostrar dimensiones"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Botón de orientación - solo visible para tablet y móvil */}
      {(previewMode === 'tablet' || previewMode === 'mobile' || previewMode === 'smallMobile') && onOrientationChange && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleToggleOrientation}
                className="h-8"
              >
                <RotateCw className="h-4 w-4" />
                <span className="sr-only">Cambiar orientación</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cambiar orientación a {orientation === 'portrait' ? 'horizontal' : 'vertical'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {/* Controles de acciones */}
      <div className="preview-action-controls flex space-x-1">
        {onRefresh && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onRefresh}
                  className="text-gray-500 h-8"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="sr-only">Refrescar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refrescar vista previa</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {onShare && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onShare}
                  className="text-gray-500 h-8"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Compartir</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Compartir vista previa</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {onOpenNewWindow && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onOpenNewWindow}
                  className="text-gray-500 h-8"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">Abrir en nueva ventana</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Abrir en nueva ventana</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onToggleFullscreen}
                className="text-gray-500 h-8"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="h-4 w-4" />
                    <span className="sr-only">Salir de pantalla completa</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-4 w-4" />
                    <span className="sr-only">Pantalla completa</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default PreviewControls;