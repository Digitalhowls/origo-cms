import React from 'react';
import { Block, BlockType } from '@shared/types';
import { cn } from '@/lib/utils';
import HeaderBlock from '../blocks/HeaderBlock';
import FeaturesBlock from '../blocks/FeaturesBlock';
import TextMediaBlock from '../blocks/TextMediaBlock';
import TestimonialBlock from '../blocks/TestimonialBlock';
import AccordionBlock from '../blocks/AccordionBlock';
import TabsBlock from '../blocks/TabsBlock';
import TableBlock from '../blocks/TableBlock';

export interface PreviewRendererProps {
  blocks: Block[];
  title: string;
  className?: string;
  selectedBlockId?: string | null;
  onBlockSelect?: (blockId: string) => void;
  previewMode?: 'desktop' | 'tablet' | 'mobile';
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
  previewMode = 'desktop'
}) => {
  // Función para renderizar bloques en modo vista previa
  const renderPreviewBlock = (block: Block, isSelected: boolean = false) => {
    // En el modo de vista previa, pasamos un manejador nulo ya que no necesitamos interacción
    const handleClick = () => {};
    
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
      default:
        return <div>Bloque no soportado: {block.type}</div>;
    }
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

  return (
    <div className={cn(
      'preview-container overflow-auto flex flex-col items-center bg-gray-100 p-4',
      className
    )}>
      <div 
        className="preview-content bg-white transition-all duration-300"
        style={getPreviewStyles()}
      >
        <div className="preview-header border-b p-4">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <div className="preview-body">
          {blocks.map((block) => (
            <div 
              key={block.id}
              className={cn(
                'preview-block relative transition-all',
                selectedBlockId === block.id && 'ring-2 ring-primary ring-offset-2'
              )}
              onClick={() => onBlockSelect && onBlockSelect(block.id)}
            >
              {renderPreviewBlock(block, selectedBlockId === block.id)}
              {selectedBlockId === block.id && (
                <div className="absolute top-0 right-0 bg-primary text-white text-xs px-2 py-1 rounded-bl">
                  Seleccionado
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
      </div>
    </div>
  );
};

export default PreviewRenderer;