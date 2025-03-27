import React, { useState, useEffect } from 'react';
import { Block, BlockType } from '@shared/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos de íconos disponibles
export enum CTAIconType {
  ARROW_RIGHT = 'ArrowRight',
  ARROW_RIGHT_CIRCLE = 'ArrowRightCircle',
  MOVE_RIGHT = 'MoveRight',
  EXTERNAL_LINK = 'ExternalLink',
  ARROW_UP_RIGHT = 'ArrowUpRight',
  CHEVRON_RIGHT = 'ChevronRight',
  CORNER_UP_RIGHT = 'CornerUpRight',
  ROCKET = 'Rocket',
  ZAPS = 'Zap',
  SPARKLES = 'Sparkles',
  BOLT = 'Bolt',
  STAR = 'Star'
}

// Tipos de efectos de hover
export enum CTAHoverEffect {
  NONE = 'none',
  SCALE = 'scale',
  LIFT = 'lift',
  GLOW = 'glow',
  COLOR_SHIFT = 'colorShift',
  SHADOW = 'shadow',
  UNDERLINE = 'underline',
  BORDER = 'border'
}

// Tipos de contador
export enum CTACounterType {
  NONE = 'none',
  COUNTDOWN = 'countdown',
  REMAINING_ITEMS = 'remainingItems',
  PERCENTAGE_FILLED = 'percentageFilled'
}

// Definición de estilos de CTA disponibles
export enum CTAStyle {
  BASIC = 'basic',
  OUTLINED = 'outlined',
  FULL_WIDTH = 'full-width',
  CARD = 'card',
  BANNER = 'banner',
  SPLIT = 'split',
}

// Definición de posiciones del CTA
export enum CTAPosition {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}

// Definición de tamaños de botón para CTA
export enum CTASize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

// Definición de colores para CTA
export enum CTAColorScheme {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  ACCENT = 'accent',
  NEUTRAL = 'neutral',
  SUCCESS = 'success',
  WARNING = 'warning',
  DESTRUCTIVE = 'destructive',
  CUSTOM = 'custom',
}

// Interfaz para la configuración del CTA
export interface CTAData {
  title: string;
  subtitle?: string;
  description?: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  primaryButtonVariant?: 'default' | 'outline' | 'ghost' | 'link';
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  secondaryButtonVariant?: 'default' | 'outline' | 'ghost' | 'link';
  settings?: {
    style: CTAStyle;
    position: CTAPosition;
    size: CTASize;
    colorScheme: CTAColorScheme;
    customBgColor?: string;
    customTextColor?: string;
    customButtonColor?: string;
    showIcon?: boolean;
    iconType?: string;
    iconPosition?: 'left' | 'right';
    bgImage?: string;
    fullHeight?: boolean;
    maxWidth?: string;
    spacing?: 'compact' | 'normal' | 'loose';
    rounded?: boolean;
    shadow?: boolean;
    animation?: 'none' | 'fade' | 'slideUp' | 'pulse';
    showBorder?: boolean;
    borderColor?: string;
    hoverEffect?: CTAHoverEffect;
    counterType?: CTACounterType;
    counterValue?: number;
    counterEndDate?: string;
    gradient?: boolean;
    gradientFrom?: string;
    gradientTo?: string;
    gradientDirection?: string;
  };
}

/**
 * Componente para renderizar un bloque de Call to Action (CTA)
 */
const CTABlock: React.FC<{ block: Block }> = ({ block }) => {
  const data = block.data as CTAData || {
    title: 'Título del CTA',
    primaryButtonText: 'Acción Principal',
    primaryButtonUrl: '#',
    settings: {
      style: CTAStyle.BASIC,
      position: CTAPosition.CENTER,
      size: CTASize.MEDIUM,
      colorScheme: CTAColorScheme.PRIMARY,
      showIcon: true,
      iconType: CTAIconType.ARROW_RIGHT,
      iconPosition: 'right',
      spacing: 'normal',
      rounded: true,
      shadow: false,
      animation: 'none',
      hoverEffect: CTAHoverEffect.NONE,
      counterType: CTACounterType.NONE,
      counterValue: 0,
      gradient: false,
      gradientFrom: '#4f46e5',
      gradientTo: '#818cf8',
      gradientDirection: 'to-r',
    },
  };

  // Mapeo de tamaños de botón a clases de tailwind
  const buttonSizeClasses = {
    [CTASize.SMALL]: 'h-8 px-3 text-sm',
    [CTASize.MEDIUM]: 'h-10 px-4',
    [CTASize.LARGE]: 'h-12 px-6 text-lg',
  };

  // Mapeo de esquemas de color a clases de tailwind
  const colorSchemeClasses = {
    [CTAColorScheme.PRIMARY]: {
      container: 'bg-primary/5',
      title: 'text-primary-foreground',
      button: '',
    },
    [CTAColorScheme.SECONDARY]: {
      container: 'bg-secondary/10',
      title: 'text-secondary-foreground',
      button: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    },
    [CTAColorScheme.ACCENT]: {
      container: 'bg-accent/10',
      title: 'text-accent-foreground',
      button: 'bg-accent text-accent-foreground hover:bg-accent/90',
    },
    [CTAColorScheme.NEUTRAL]: {
      container: 'bg-gray-100 dark:bg-gray-800',
      title: 'text-gray-900 dark:text-gray-100',
      button: 'bg-gray-800 text-white hover:bg-gray-700 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-100',
    },
    [CTAColorScheme.SUCCESS]: {
      container: 'bg-emerald-50 dark:bg-emerald-900/20',
      title: 'text-emerald-900 dark:text-emerald-100',
      button: 'bg-emerald-600 text-white hover:bg-emerald-700',
    },
    [CTAColorScheme.WARNING]: {
      container: 'bg-amber-50 dark:bg-amber-900/20',
      title: 'text-amber-900 dark:text-amber-100',
      button: 'bg-amber-600 text-white hover:bg-amber-700',
    },
    [CTAColorScheme.DESTRUCTIVE]: {
      container: 'bg-red-50 dark:bg-red-900/20',
      title: 'text-red-900 dark:text-red-100',
      button: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    },
    [CTAColorScheme.CUSTOM]: {
      container: '',
      title: '',
      button: '',
    },
  };

  // Mapeo de estilos de CTA a diferentes estructuras de componentes
  const renderCTAByStyle = () => {
    const settings = data.settings || {
      style: CTAStyle.BASIC,
      position: CTAPosition.CENTER,
      size: CTASize.MEDIUM,
      colorScheme: CTAColorScheme.PRIMARY,
    };
    
    const colorClasses = colorSchemeClasses[settings.colorScheme || CTAColorScheme.PRIMARY];
    const buttonSize = buttonSizeClasses[settings.size || CTASize.MEDIUM];
    
    // Para personalización de colores (solo si es esquema CUSTOM)
    const customStyles = settings.colorScheme === CTAColorScheme.CUSTOM 
      ? {
          backgroundColor: settings.customBgColor,
          color: settings.customTextColor,
        }
      : {};
    
    // Para personalización del botón (solo si es esquema CUSTOM)
    const customButtonStyles = settings.colorScheme === CTAColorScheme.CUSTOM 
      ? { backgroundColor: settings.customButtonColor, color: '#ffffff' }
      : {};
    
    // Clases para posicionamiento del contenido
    const positionClasses = {
      [CTAPosition.LEFT]: 'text-left items-start',
      [CTAPosition.CENTER]: 'text-center items-center',
      [CTAPosition.RIGHT]: 'text-right items-end',
    };
    
    // Clases para espaciado interno
    const spacingClasses = {
      'compact': 'p-4',
      'normal': 'p-6',
      'loose': 'p-10',
    };
    
    // Función para obtener el ícono seleccionado de Lucide
    const getIcon = (iconType: string | undefined) => {
      if (!iconType) return LucideIcons.ArrowRight;
      
      const IconComponent = (LucideIcons as any)[iconType] || LucideIcons.ArrowRight;
      return IconComponent;
    };
    
    // Obtener el ícono configurado o uno predeterminado
    const selectedIconType = settings.iconType || CTAIconType.ARROW_RIGHT;
    const IconComponent = getIcon(selectedIconType);
    
    // Icono a mostrar si showIcon es true
    const ButtonIcon = settings.iconPosition === 'left' ? 
      settings.showIcon && <IconComponent className="mr-2 h-4 w-4" /> : 
      settings.showIcon && <IconComponent className="ml-2 h-4 w-4" />;
    
    // Renderizar el contador si está habilitado
    const renderCounter = () => {
      const counterType = settings.counterType || CTACounterType.NONE;
      if (counterType === CTACounterType.NONE) return null;
      
      // Estado para el contador
      const [counterValue, setCounterValue] = useState(settings.counterValue || 0);
      
      // Efecto para el contador de cuenta regresiva
      useEffect(() => {
        if (counterType === CTACounterType.COUNTDOWN && settings.counterEndDate) {
          const endDate = new Date(settings.counterEndDate).getTime();
          const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = Math.max(0, endDate - now);
            
            // Convertir a días
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            setCounterValue(days);
            
            if (distance <= 0) {
              clearInterval(interval);
            }
          }, 1000);
          
          return () => clearInterval(interval);
        }
      }, [counterType, settings.counterEndDate]);
      
      // Render del contador según el tipo
      switch (counterType) {
        case CTACounterType.COUNTDOWN:
          return (
            <div className="text-sm font-semibold mt-2 text-muted-foreground">
              {counterValue} días restantes
            </div>
          );
        case CTACounterType.REMAINING_ITEMS:
          return (
            <div className="text-sm font-semibold mt-2 text-muted-foreground">
              Solo quedan {counterValue} disponibles
            </div>
          );
        case CTACounterType.PERCENTAGE_FILLED:
          return (
            <div className="w-full mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Completado: {counterValue}%</span>
                <span>{counterValue}% de 100%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${counterValue}%` }}
                />
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    // Determinar las clases de hover para el botón
    const getHoverClasses = () => {
      const hoverEffect = settings.hoverEffect || CTAHoverEffect.NONE;
      
      switch (hoverEffect) {
        case CTAHoverEffect.SCALE:
          return 'transition-transform hover:scale-105';
        case CTAHoverEffect.LIFT:
          return 'transition-transform hover:-translate-y-1';
        case CTAHoverEffect.GLOW:
          return 'transition-shadow hover:shadow-lg hover:shadow-primary/30';
        case CTAHoverEffect.COLOR_SHIFT:
          return 'transition-colors hover:bg-primary-foreground hover:text-primary';
        case CTAHoverEffect.SHADOW:
          return 'transition-shadow hover:shadow-xl';
        case CTAHoverEffect.UNDERLINE:
          return 'hover:underline hover:underline-offset-4';
        case CTAHoverEffect.BORDER:
          return 'hover:border-2 hover:border-primary';
        case CTAHoverEffect.NONE:
        default:
          return '';
      }
    };

    // Renderizar el botón primario
    const renderPrimaryButton = () => (
      <Button
        variant={data.primaryButtonVariant || 'default'}
        className={cn(
          buttonSize,
          settings.colorScheme === CTAColorScheme.CUSTOM ? '' : colorClasses.button,
          settings.rounded ? 'rounded-full' : '',
          settings.shadow ? 'shadow-lg' : '',
          getHoverClasses()
        )}
        style={{
          ...customButtonStyles,
          // Aplicar gradiente si está habilitado
          ...(settings.gradient && {
            background: `linear-gradient(${settings.gradientDirection || 'to-r'}, ${settings.gradientFrom || '#4f46e5'}, ${settings.gradientTo || '#818cf8'})`,
            border: 'none'
          })
        }}
        asChild
      >
        <a href={data.primaryButtonUrl} target="_blank" rel="noopener noreferrer">
          {settings.iconPosition === 'left' && ButtonIcon}
          {data.primaryButtonText}
          {settings.iconPosition === 'right' && ButtonIcon}
        </a>
      </Button>
    );
    
    // Renderizar el botón secundario si existe
    const renderSecondaryButton = () => {
      if (!data.secondaryButtonText) return null;
      return (
        <Button
          variant={data.secondaryButtonVariant || 'outline'}
          className={cn(
            buttonSize,
            settings.rounded ? 'rounded-full' : '',
            settings.shadow ? 'shadow-md' : '',
            'ml-4'
          )}
          asChild
        >
          <a href={data.secondaryButtonUrl || '#'} target="_blank" rel="noopener noreferrer">
            {data.secondaryButtonText}
          </a>
        </Button>
      );
    };
    
    // Renderizar contenido básico del CTA
    const renderCTAContent = () => (
      <div className={cn('flex flex-col gap-4', positionClasses[settings.position || CTAPosition.CENTER])}>
        <h3 className={cn('text-2xl font-bold', settings.colorScheme === CTAColorScheme.CUSTOM ? '' : colorClasses.title)}>
          {data.title}
        </h3>
        
        {data.subtitle && (
          <h4 className="text-xl font-semibold text-muted-foreground">
            {data.subtitle}
          </h4>
        )}
        
        {data.description && (
          <p className="text-muted-foreground max-w-prose">
            {data.description}
          </p>
        )}
        
        <div className={cn('flex', settings.position === CTAPosition.CENTER ? 'justify-center' : '', 
          settings.position === CTAPosition.RIGHT ? 'justify-end' : '',
          'mt-2')}>
          {renderPrimaryButton()}
          {renderSecondaryButton()}
        </div>
        
        {/* Mostrar el contador si está habilitado */}
        {renderCounter()}
      </div>
    );
    
    // Aplicar diferentes estilos de CTA según el valor de style
    switch (settings.style) {
      case CTAStyle.CARD:
        return (
          <Card className={cn(
            'overflow-hidden transition-all',
            settings.shadow ? 'shadow-lg' : '',
            settings.rounded ? 'rounded-2xl' : '',
            settings.maxWidth ? 'mx-auto' : 'w-full',
            settings.colorScheme === CTAColorScheme.CUSTOM ? '' : colorClasses.container
          )}
          style={{ 
            maxWidth: settings.maxWidth,
            ...customStyles
          }}>
            <CardContent className={cn(
              spacingClasses[settings.spacing || 'normal'],
              'flex flex-col justify-between'
            )}>
              {renderCTAContent()}
            </CardContent>
          </Card>
        );
        
      case CTAStyle.BANNER:
        return (
          <div className={cn(
            'w-full relative overflow-hidden',
            spacingClasses[settings.spacing || 'normal'],
            settings.shadow ? 'shadow-lg' : '',
            settings.rounded ? 'rounded-2xl' : '',
            settings.colorScheme === CTAColorScheme.CUSTOM ? '' : colorClasses.container
          )}
          style={{
            backgroundImage: settings.bgImage ? `url(${settings.bgImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            ...customStyles
          }}>
            {/* Overlay para cuando hay imagen de fondo */}
            {settings.bgImage && (
              <div className="absolute inset-0 bg-black/50" />
            )}
            
            <div className={cn(
              'relative z-10 flex flex-col items-center justify-center',
              settings.fullHeight ? 'min-h-[300px]' : '',
              positionClasses[settings.position || CTAPosition.CENTER]
            )}>
              {renderCTAContent()}
            </div>
          </div>
        );
      
      case CTAStyle.SPLIT:
        return (
          <div className={cn(
            'flex flex-col md:flex-row overflow-hidden',
            settings.shadow ? 'shadow-lg' : '',
            settings.rounded ? 'rounded-2xl' : '',
            settings.colorScheme === CTAColorScheme.CUSTOM ? '' : colorClasses.container,
            settings.showBorder ? `border ${settings.borderColor ? settings.borderColor : 'border-border'}` : ''
          )}
          style={customStyles}>
            <div className={cn(
              'flex-1 p-6 md:p-10 flex flex-col justify-center',
              positionClasses[settings.position || CTAPosition.LEFT]
            )}>
              {renderCTAContent()}
            </div>
            
            {settings.bgImage && (
              <div className="flex-1 bg-cover bg-center" style={{ backgroundImage: `url(${settings.bgImage})` }} />
            )}
            
            {!settings.bgImage && (
              <div className="flex-1 bg-muted flex items-center justify-center p-10">
                <div className="text-center">
                  <LucideIcons.ExternalLink className="h-20 w-20 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-sm">Imagen decorativa</p>
                </div>
              </div>
            )}
          </div>
        );
      
      case CTAStyle.FULL_WIDTH:
        return (
          <div className={cn(
            'w-full py-10 px-4',
            settings.colorScheme === CTAColorScheme.CUSTOM ? '' : colorClasses.container,
            settings.showBorder ? `border-y ${settings.borderColor ? settings.borderColor : 'border-border'}` : ''
          )}
          style={customStyles}>
            <div className={cn(
              'container mx-auto',
              positionClasses[settings.position || CTAPosition.CENTER]
            )}>
              {renderCTAContent()}
            </div>
          </div>
        );
        
      case CTAStyle.OUTLINED:
        return (
          <div className={cn(
            'border-2 rounded-xl overflow-hidden',
            settings.borderColor ? settings.borderColor : 'border-primary',
            spacingClasses[settings.spacing || 'normal'],
            settings.shadow ? 'shadow-lg' : '',
            settings.maxWidth ? 'mx-auto' : 'w-full'
          )}
          style={{ 
            maxWidth: settings.maxWidth,
          }}>
            {renderCTAContent()}
          </div>
        );
      
      case CTAStyle.BASIC:
      default:
        return (
          <div className={cn(
            spacingClasses[settings.spacing || 'normal'],
            settings.colorScheme === CTAColorScheme.CUSTOM ? '' : colorClasses.container,
            settings.rounded ? 'rounded-xl' : '',
            settings.shadow ? 'shadow-md' : '',
            settings.maxWidth ? 'mx-auto' : 'w-full',
            settings.showBorder ? `border ${settings.borderColor ? settings.borderColor : 'border-border'}` : ''
          )}
          style={{ 
            maxWidth: settings.maxWidth,
            ...customStyles
          }}>
            {renderCTAContent()}
          </div>
        );
    }
  };

  return renderCTAByStyle();
};

export default CTABlock;