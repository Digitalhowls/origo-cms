import React, { useState, useEffect } from 'react';
import { Block } from '@shared/types';
import { usePageStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Slider 
} from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { historyService } from '@/lib/history-service';
import { HistoryActionType } from '@shared/types';
import {
  Play,
  Pause,
  RotateCcw,
  Eye,
  Clock,
  MoveHorizontal,
  MoveVertical,
  Maximize,
  Minimize,
  RotateCw,
  X,
  Save
} from 'lucide-react';

// Tipos de animación disponibles
export enum AnimationType {
  FADE = 'fade',
  SLIDE = 'slide',
  SCALE = 'scale',
  ROTATE = 'rotate',
  FLIP = 'flip',
  SPECIAL = 'special'
}

// Tipos de eventos que pueden desencadenar animaciones
export enum AnimationTrigger {
  LOAD = 'load',
  SCROLL = 'scroll',
  CLICK = 'click',
  HOVER = 'hover',
  MOUSE_ENTER = 'mouseenter',
  MOUSE_LEAVE = 'mouseleave'
}

// Interface para las propiedades de animación
export interface AnimationProps {
  type: AnimationType;
  subType: string;
  trigger: AnimationTrigger;
  duration: number;
  delay: number;
  easing: string;
  direction?: string;
  iterations?: number;
  reverse?: boolean;
  autoplay?: boolean;
  offset?: number;
  custom?: Record<string, any>;
}

// Valores predeterminados para cada tipo de animación
const defaultAnimations: Record<AnimationType, Partial<AnimationProps>> = {
  [AnimationType.FADE]: {
    subType: 'fadeIn',
    duration: 1000,
    delay: 0,
    easing: 'ease'
  },
  [AnimationType.SLIDE]: {
    subType: 'slideInLeft',
    duration: 1000,
    delay: 0,
    easing: 'ease-out',
    direction: 'left'
  },
  [AnimationType.SCALE]: {
    subType: 'zoomIn',
    duration: 1000,
    delay: 0,
    easing: 'ease-out'
  },
  [AnimationType.ROTATE]: {
    subType: 'rotateIn',
    duration: 1000,
    delay: 0,
    easing: 'ease-in-out'
  },
  [AnimationType.FLIP]: {
    subType: 'flipInX',
    duration: 1200,
    delay: 0,
    easing: 'ease-in-out'
  },
  [AnimationType.SPECIAL]: {
    subType: 'bounce',
    duration: 1000,
    delay: 0,
    easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
    iterations: 1
  }
};

// Opciones para cada tipo de animación
const animationOptions: Record<AnimationType, {label: string, value: string}[]> = {
  [AnimationType.FADE]: [
    { label: 'Fade In', value: 'fadeIn' },
    { label: 'Fade In Down', value: 'fadeInDown' },
    { label: 'Fade In Left', value: 'fadeInLeft' },
    { label: 'Fade In Right', value: 'fadeInRight' },
    { label: 'Fade In Up', value: 'fadeInUp' }
  ],
  [AnimationType.SLIDE]: [
    { label: 'Slide In Left', value: 'slideInLeft' },
    { label: 'Slide In Right', value: 'slideInRight' },
    { label: 'Slide In Up', value: 'slideInUp' },
    { label: 'Slide In Down', value: 'slideInDown' }
  ],
  [AnimationType.SCALE]: [
    { label: 'Zoom In', value: 'zoomIn' },
    { label: 'Zoom In Down', value: 'zoomInDown' },
    { label: 'Zoom In Left', value: 'zoomInLeft' },
    { label: 'Zoom In Right', value: 'zoomInRight' },
    { label: 'Zoom In Up', value: 'zoomInUp' }
  ],
  [AnimationType.ROTATE]: [
    { label: 'Rotate In', value: 'rotateIn' },
    { label: 'Rotate In Down Left', value: 'rotateInDownLeft' },
    { label: 'Rotate In Down Right', value: 'rotateInDownRight' },
    { label: 'Rotate In Up Left', value: 'rotateInUpLeft' },
    { label: 'Rotate In Up Right', value: 'rotateInUpRight' }
  ],
  [AnimationType.FLIP]: [
    { label: 'Flip In X', value: 'flipInX' },
    { label: 'Flip In Y', value: 'flipInY' },
    { label: 'Flip Out X', value: 'flipOutX' },
    { label: 'Flip Out Y', value: 'flipOutY' }
  ],
  [AnimationType.SPECIAL]: [
    { label: 'Bounce', value: 'bounce' },
    { label: 'Flash', value: 'flash' },
    { label: 'Pulse', value: 'pulse' },
    { label: 'Rubber Band', value: 'rubberBand' },
    { label: 'Shake', value: 'shake' },
    { label: 'Swing', value: 'swing' },
    { label: 'Tada', value: 'tada' },
    { label: 'Wobble', value: 'wobble' },
    { label: 'Jello', value: 'jello' },
    { label: 'Heart Beat', value: 'heartBeat' }
  ]
};

// Opciones para los eventos de activación
const triggerOptions = [
  { label: 'Al cargar', value: AnimationTrigger.LOAD },
  { label: 'Al hacer scroll', value: AnimationTrigger.SCROLL },
  { label: 'Al hacer clic', value: AnimationTrigger.CLICK },
  { label: 'Al pasar el cursor', value: AnimationTrigger.HOVER },
  { label: 'Al entrar el cursor', value: AnimationTrigger.MOUSE_ENTER },
  { label: 'Al salir el cursor', value: AnimationTrigger.MOUSE_LEAVE }
];

// Opciones para los tipos de easing
const easingOptions = [
  { label: 'Lineal', value: 'linear' },
  { label: 'Ease', value: 'ease' },
  { label: 'Ease In', value: 'ease-in' },
  { label: 'Ease Out', value: 'ease-out' },
  { label: 'Ease In Out', value: 'ease-in-out' },
  { label: 'Elastic', value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
  { label: 'Bounce', value: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' }
];

interface AnimationPanelProps {
  blockId: string;
}

const AnimationPanel: React.FC<AnimationPanelProps> = ({ blockId }) => {
  const { toast } = useToast();
  const { currentPage, updateBlockAnimation } = usePageStore();
  
  // Obtener el bloque seleccionado
  const selectedBlock = currentPage?.blocks.find(block => block.id === blockId);
  
  // Estado para la animación que se está editando
  const [animation, setAnimation] = useState<AnimationProps>(() => {
    // Obtener la animación existente o establecer valores predeterminados
    if (selectedBlock?.settings?.animation) {
      return selectedBlock.settings.animation as AnimationProps;
    }
    
    return {
      type: AnimationType.FADE,
      subType: 'fadeIn',
      trigger: AnimationTrigger.LOAD,
      duration: 1000,
      delay: 0,
      easing: 'ease',
      iterations: 1,
      reverse: false,
      autoplay: true,
      offset: 0
    };
  });
  
  // Estado para el tipo de animación actualmente seleccionado
  const [activeType, setActiveType] = useState<AnimationType>(animation.type);
  
  // Estado para previsualización
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  
  // Actualizar las opciones cuando cambia el tipo de animación
  useEffect(() => {
    if (activeType !== animation.type) {
      const defaultSettings = defaultAnimations[activeType];
      setAnimation(prev => ({
        ...prev,
        type: activeType,
        subType: defaultSettings.subType || '',
        duration: defaultSettings.duration || prev.duration,
        easing: defaultSettings.easing || prev.easing,
        direction: defaultSettings.direction || prev.direction
      }));
    }
  }, [activeType, animation.type]);
  
  // Manejar cambios en la animación
  const handleAnimationChange = (field: keyof AnimationProps, value: any) => {
    setAnimation(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Guardar cambios de animación
  const handleSaveAnimation = () => {
    if (!selectedBlock) return;
    
    // Crear un objeto de ajustes actualizado
    const newSettings = {
      ...(selectedBlock.settings || {}),
      animation
    };
    
    // Guardar el estado anterior para el historial
    const previousAnimation = selectedBlock.settings?.animation;
    
    // Actualizar el bloque
    updateBlockAnimation(blockId, animation);
    
    // Registrar en el historial
    historyService.addEntry(
      currentPage!, 
      HistoryActionType.UPDATE_BLOCK, 
      `Animación actualizada: ${animation.subType}`
    );
    
    toast({
      title: 'Animación actualizada',
      description: 'Los ajustes de animación se han guardado correctamente.',
    });
  };
  
  // Previsualizar la animación
  const handlePreviewAnimation = () => {
    setIsPreviewPlaying(true);
    
    // Reiniciar después de que termine la animación
    setTimeout(() => {
      setIsPreviewPlaying(false);
    }, animation.duration + animation.delay + 500);
  };
  
  // Si no hay bloque seleccionado, mostrar un mensaje
  if (!selectedBlock) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <p className="text-gray-500">Selecciona un bloque para configurar su animación</p>
      </div>
    );
  }
  
  return (
    <div className="animation-panel p-4">
      <h3 className="text-lg font-medium mb-4">Configuración de animación</h3>
      
      <Tabs defaultValue={activeType} onValueChange={(value) => setActiveType(value as AnimationType)}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value={AnimationType.FADE}>
            <Eye className="h-4 w-4 mr-1" />
            Fade
          </TabsTrigger>
          <TabsTrigger value={AnimationType.SLIDE}>
            <MoveHorizontal className="h-4 w-4 mr-1" />
            Slide
          </TabsTrigger>
          <TabsTrigger value={AnimationType.SCALE}>
            <Maximize className="h-4 w-4 mr-1" />
            Scale
          </TabsTrigger>
          <TabsTrigger value={AnimationType.ROTATE}>
            <RotateCw className="h-4 w-4 mr-1" />
            Rotate
          </TabsTrigger>
          <TabsTrigger value={AnimationType.FLIP}>
            <MoveVertical className="h-4 w-4 mr-1" />
            Flip
          </TabsTrigger>
          <TabsTrigger value={AnimationType.SPECIAL}>
            <span>✨</span>
            Special
          </TabsTrigger>
        </TabsList>
        
        {/* Contenido para todos los tipos de animación */}
        <ScrollArea className="h-[400px] pr-4">
          {Object.values(AnimationType).map((type) => (
            <TabsContent key={type} value={type} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="animation-type">Tipo de animación</Label>
                  <Select 
                    value={animation.subType} 
                    onValueChange={(value) => handleAnimationChange('subType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {animationOptions[type as AnimationType].map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="animation-trigger">Activador</Label>
                  <Select 
                    value={animation.trigger} 
                    onValueChange={(value) => handleAnimationChange('trigger', value as AnimationTrigger)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona cuándo activar" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="animation-duration">
                    Duración: {animation.duration}ms
                  </Label>
                  <Slider
                    id="animation-duration"
                    min={100}
                    max={3000}
                    step={100}
                    value={[animation.duration]}
                    onValueChange={(value) => handleAnimationChange('duration', value[0])}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="animation-delay">
                    Retraso: {animation.delay}ms
                  </Label>
                  <Slider
                    id="animation-delay"
                    min={0}
                    max={2000}
                    step={100}
                    value={[animation.delay]}
                    onValueChange={(value) => handleAnimationChange('delay', value[0])}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="animation-easing">Aceleración</Label>
                  <Select 
                    value={animation.easing} 
                    onValueChange={(value) => handleAnimationChange('easing', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo de aceleración" />
                    </SelectTrigger>
                    <SelectContent>
                      {easingOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {animation.trigger === AnimationTrigger.SCROLL && (
                  <div>
                    <Label htmlFor="animation-offset">
                      Desplazamiento: {animation.offset}px
                    </Label>
                    <Slider
                      id="animation-offset"
                      min={0}
                      max={500}
                      step={10}
                      value={[animation.offset || 0]}
                      onValueChange={(value) => handleAnimationChange('offset', value[0])}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Distancia en píxeles antes de que el elemento sea visible y se active la animación
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="animation-iterations">Iteraciones</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="animation-iterations"
                      type="number"
                      min={1}
                      max={10}
                      value={animation.iterations || 1}
                      onChange={(e) => handleAnimationChange('iterations', parseInt(e.target.value))}
                      className="w-16"
                    />
                    <Label htmlFor="animation-infinite">Infinito</Label>
                    <Switch
                      id="animation-infinite"
                      checked={animation.iterations === Infinity}
                      onCheckedChange={(checked) => 
                        handleAnimationChange('iterations', checked ? Infinity : 1)
                      }
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="animation-reverse">Invertir dirección</Label>
                  <Switch
                    id="animation-reverse"
                    checked={animation.reverse || false}
                    onCheckedChange={(checked) => 
                      handleAnimationChange('reverse', checked)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="animation-autoplay">Reproducir automáticamente</Label>
                  <Switch
                    id="animation-autoplay"
                    checked={animation.autoplay !== false}
                    onCheckedChange={(checked) => 
                      handleAnimationChange('autoplay', checked)
                    }
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </ScrollArea>
      </Tabs>
      
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePreviewAnimation}
          disabled={isPreviewPlaying}
        >
          {isPreviewPlaying ? (
            <>
              <Pause className="h-4 w-4 mr-1" />
              Reproduciendo...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-1" />
              Previsualizar
            </>
          )}
        </Button>
        
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setAnimation({
                type: AnimationType.FADE,
                subType: 'fadeIn',
                trigger: AnimationTrigger.LOAD,
                duration: 1000,
                delay: 0,
                easing: 'ease',
                iterations: 1,
                reverse: false,
                autoplay: true,
                offset: 0
              });
            }}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Restablecer
          </Button>
          
          <Button onClick={handleSaveAnimation}>
            <Save className="h-4 w-4 mr-1" />
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnimationPanel;