import React from 'react';
import { Block } from '@shared/types';

interface TextMediaBlockProps {
  block: Block;
  onClick: () => void;
}

const TextMediaBlock: React.FC<TextMediaBlockProps> = ({ block, onClick }) => {
  const { content, settings } = block;
  
  // Default values if not set
  const title = content.title || 'Transformamos ideas en realidad';
  const text = content.text || 'Nuestro equipo de expertos trabaja incansablemente para convertir sus ideas en soluciones digitales innovadoras que impulsan el crecimiento de su negocio.';
  const mediaType = content.mediaType || 'image';
  const mediaUrl = content.mediaUrl || 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&h=600&q=80';
  const ctaText = content.ctaText || 'Conoce más sobre nosotros';
  const ctaUrl = content.ctaUrl || '#';
  
  // Apply spacing from settings
  const marginTop = settings.spacing?.marginTop !== undefined ? settings.spacing.marginTop : 10;
  const marginBottom = settings.spacing?.marginBottom !== undefined ? settings.spacing.marginBottom : 10;
  
  // Apply appearance settings
  const layout = settings.appearance?.layout || 'image-left';
  const mediaWidth = settings.appearance?.mediaWidth || '50%';
  const backgroundColor = settings.appearance?.backgroundColor || 'white';
  
  const style = {
    marginTop: `${marginTop}px`,
    marginBottom: `${marginBottom}px`,
    backgroundColor,
  };

  // Set layout direction
  const isMediaLeft = layout === 'image-left';
  const isMediaRight = layout === 'image-right';
  const isMediaTop = layout === 'image-top';
  const isMediaBottom = layout === 'image-bottom';
  
  // Set order classes
  const mediaOrderClass = isMediaRight ? 'md:order-2' : isMediaLeft ? 'md:order-1' : '';
  const contentOrderClass = isMediaRight ? 'md:order-1' : isMediaLeft ? 'md:order-2' : '';
  
  // Set width classes
  const mediaWidthClass = (isMediaLeft || isMediaRight) ? `md:w-1/2` : 'w-full';
  const contentWidthClass = (isMediaLeft || isMediaRight) ? `md:w-1/2` : 'w-full';
  
  // Set flex direction
  const flexDirectionClass = (isMediaTop || isMediaBottom) 
    ? 'flex-col' 
    : 'flex-col md:flex-row';
  
  return (
    <div 
      className="page-builder-block relative mb-6 transition-all duration-200 hover:border hover:border-dashed hover:border-blue-500 hover:bg-blue-50/20" 
      style={style}
      onClick={onClick}
    >
      <div className="block-handle absolute top-2 right-2 hidden bg-white rounded-md shadow-sm border border-gray-200 p-1 group-hover:flex">
        <button className="text-gray-500 hover:text-gray-700 p-1" title="Mover">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
        <button className="text-gray-500 hover:text-gray-700 p-1" title="Editar">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button className="text-gray-500 hover:text-gray-700 p-1" title="Duplicar">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button className="text-red-500 hover:text-red-700 p-1" title="Eliminar">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      <div className="py-10">
        <div className={`flex ${flexDirectionClass} gap-8 max-w-6xl mx-auto`}>
          <div className={`${mediaWidthClass} ${mediaOrderClass} ${isMediaBottom ? 'order-2' : isMediaTop ? 'order-1' : ''}`}>
            {mediaType === 'image' && (
              <img 
                src={mediaUrl} 
                alt={content.alt || "Imagen descriptiva"} 
                className="rounded-lg shadow-md w-full h-full object-cover"
              />
            )}
            {mediaType === 'video' && (
              <div className="rounded-lg shadow-md overflow-hidden">
                <iframe 
                  width="100%" 
                  height="315" 
                  src={mediaUrl} 
                  title="Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="w-full aspect-video"
                ></iframe>
              </div>
            )}
          </div>
          
          <div className={`${contentWidthClass} ${contentOrderClass} ${isMediaBottom ? 'order-1' : isMediaTop ? 'order-2' : ''}`}>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{title}</h2>
            <p className="text-gray-600 mb-4">{text}</p>
            {content.secondaryText && (
              <p className="text-gray-600 mb-6">{content.secondaryText}</p>
            )}
            
            <a 
              href={ctaUrl} 
              className="inline-flex items-center text-primary hover:text-blue-700 font-medium"
            >
              {ctaText}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 ml-1" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextMediaBlock;
