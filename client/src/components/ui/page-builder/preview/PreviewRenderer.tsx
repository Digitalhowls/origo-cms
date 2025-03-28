import React, { useEffect, useRef, memo } from 'react';
import { Block, BlockType, AnimationProps, AnimationTrigger } from '@shared/types';
import { cn } from '@/lib/utils';
import HeaderBlock from '../blocks/HeaderBlock';
import FeaturesBlock from '../blocks/FeaturesBlock';
import TextMediaBlock from '../blocks/TextMediaBlock';
import TestimonialBlock from '../blocks/TestimonialBlock';
import AccordionBlock from '../blocks/AccordionBlock';
import TabsBlock from '../blocks/TabsBlock';
import TableBlock from '../blocks/TableBlock';
import GalleryBlock from '../blocks/GalleryBlock';
import CTABlock from '../blocks/CTABlock';
import { 
  AnimateCss, 
  StyleTransition,
  AOSElement,
  initializeAnimations
} from '@/lib/animation-service';

export interface PreviewRendererProps {
  blocks: Block[];
  title: string;
  className?: string;
  selectedBlockId?: string | null;
  onBlockSelect?: (blockId: string) => void;
  previewMode?: 'desktop' | 'tablet' | 'mobile';
  isLivePreview?: boolean; // Indica si es una vista previa en tiempo real
}

/**
 * Componente que renderiza una vista previa de los bloques 
 * exactamente como se verían en la página final
 */
const PreviewRenderer: React.FC<PreviewRendererProps> = ({
  blocks,
  title,
  className,
  selectedBlockId,
  onBlockSelect,
  previewMode = 'desktop',
  isLivePreview = false
}) => {
  // Referencia al contenedor para poder scrollear a elementos específicos
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Inicializar las animaciones cuando el componente se monta
  useEffect(() => {
    initializeAnimations();
  }, []);

  // Función para renderizar bloques en modo vista previa
  const renderPreviewBlock = (block: Block, isSelected: boolean = false) => {
    // En el modo de vista previa, pasamos un manejador nulo ya que no necesitamos interacción
    const handleClick = () => {};
    
    // Renderizar el contenido del bloque según su tipo
    const renderContent = () => {
      switch (block.type) {
        case BlockType.HEADER:
        case 'hero':
          return <HeaderBlock block={block} onClick={handleClick} />;
        case BlockType.FEATURES:
          return <FeaturesBlock block={block} onClick={handleClick} />;
        case BlockType.TEXT_MEDIA:
          return <TextMediaBlock block={block} onClick={handleClick} />;
        case BlockType.TESTIMONIAL:
          return <TestimonialBlock block={block} onClick={handleClick} />;
        case BlockType.ACCORDION:
          return <AccordionBlock block={block} onClick={handleClick} isPreview={true} />;
        case BlockType.TABS:
          return <TabsBlock block={block} onClick={handleClick} isPreview={true} />;
        case BlockType.TABLE:
          return <TableBlock block={block} onClick={handleClick} isPreview={true} />;
        case BlockType.GALLERY:
          return <GalleryBlock block={block} onClick={handleClick} isPreview={true} />;
        case BlockType.CTA:
          return <CTABlock block={block} />;
        default:
          return <div>Bloque no soportado: {block.type}</div>;
      }
    };

    // Aplicar animaciones si el bloque tiene configuradas
    const animation = block.settings?.animation as AnimationProps | undefined;
    
    if (animation && !isSelected) {
      // Basado en el tipo de animación y disparador, elegir el componente apropiado
      if (animation.trigger === AnimationTrigger.LOAD) {
        return (
          <AnimateCss
            animationName={animation.subType}
            duration={`${animation.duration}ms`}
            delay={`${animation.delay}ms`}
            infinite={animation.iterations === Infinity}
          >
            {renderContent()}
          </AnimateCss>
        );
      } 
      else if (animation.trigger === AnimationTrigger.SCROLL) {
        return (
          <AOSElement
            animation={animation.subType}
            duration={animation.duration}
            delay={animation.delay}
            once={!animation.reverse}
          >
            {renderContent()}
          </AOSElement>
        );
      } 
      else if ([AnimationTrigger.HOVER, AnimationTrigger.MOUSE_ENTER, AnimationTrigger.MOUSE_LEAVE].includes(animation.trigger)) {
        // Para las animaciones de hover, usamos StyleTransition
        return (
          <StyleTransition
            property="all"
            duration={`${animation.duration}ms`}
            timingFunction={animation.easing}
            delay={`${animation.delay}ms`}
          >
            {renderContent()}
          </StyleTransition>
        );
      }
    }
    
    // Si no hay animación o es una animación no soportada, renderizar normalmente
    return renderContent();
  };
  
  // Determinar dimensiones según el modo de previsualización
  const getPreviewStyles = () => {
    switch (previewMode) {
      case 'mobile':
        return {
          width: '375px',
          height: '667px',
          transform: 'scale(0.9)',
          border: '16px solid #333',
          borderRadius: '32px'
        };
      case 'tablet':
        return {
          width: '768px',
          height: '1024px',
          transform: 'scale(0.8)',
          border: '16px solid #333',
          borderRadius: '24px'
        };
      default:
        return {
          width: '100%',
          maxWidth: '1200px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px'
        };
    }
  };

  // Efecto para manejar el scroll automático cuando se selecciona un bloque
  useEffect(() => {
    if (selectedBlockId && previewRef.current) {
      const selectedElement = previewRef.current.querySelector(`[data-block-id="${selectedBlockId}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedBlockId]);

  return (
    <div 
      ref={previewRef}
      className={cn(
        'preview-container overflow-auto flex flex-col items-center bg-gray-100 p-4',
        isLivePreview && 'preview-container-live',
        className
      )}
    >
      <div 
        className="preview-content bg-white transition-all duration-300"
        style={getPreviewStyles()}
      >
        <div className="preview-header border-b p-4">
          <h1 className="text-2xl font-bold">{title}</h1>
          {isLivePreview && (
            <div className="flex items-center mt-1 text-sm text-green-600">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              Actualización en tiempo real
            </div>
          )}
        </div>
        <div className="preview-body">
          {blocks.map((block) => (
            <div 
              key={block.id}
              data-block-id={block.id}
              className={cn(
                'preview-block relative transition-all',
                selectedBlockId === block.id && 'ring-2 ring-primary ring-offset-2',
                isLivePreview && selectedBlockId === block.id && 'bg-blue-50'
              )}
              onClick={() => onBlockSelect && onBlockSelect(block.id)}
            >
              {renderPreviewBlock(block, selectedBlockId === block.id)}
              {selectedBlockId === block.id && (
                <div className="absolute top-0 right-0 bg-primary text-white text-xs px-2 py-1 rounded-bl">
                  {isLivePreview ? 'Editando...' : 'Seleccionado'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="preview-info text-sm text-gray-500 mt-4">
        {previewMode !== 'desktop' && (
          <p>Simulando visualización en {previewMode === 'mobile' ? 'móvil' : 'tablet'}</p>
        )}
        {isLivePreview && (
          <p className="mt-1 text-green-600">Vista previa sincronizada con el editor</p>
        )}
      </div>
    </div>
  );
};

export default PreviewRenderer;