import React from 'react';
import { Button } from '@/components/ui/button';
import { Block } from '@shared/types';

interface HeaderBlockProps {
  block: Block;
  onClick: () => void;
}

const HeaderBlock: React.FC<HeaderBlockProps> = ({ block, onClick }) => {
  const { content, settings } = block;
  
  // Default values if not set
  const title = content.title || 'Bienvenidos a nuestra plataforma';
  const subtitle = content.subtitle || 'Ofrecemos soluciones innovadoras para transformar su negocio y alcanzar nuevas metas en el mundo digital.';
  const alignment = content.alignment || 'center';
  
  // Apply spacing from settings
  const marginTop = settings.spacing?.marginTop !== undefined ? settings.spacing.marginTop : 10;
  const marginBottom = settings.spacing?.marginBottom !== undefined ? settings.spacing.marginBottom : 10;
  const style = {
    marginTop: `${marginTop}px`,
    marginBottom: `${marginBottom}px`,
    backgroundColor: settings.appearance?.backgroundColor || 'transparent',
  };

  // Apply text alignment
  const textAlignmentClass = {
    'left': 'text-left',
    'center': 'text-center',
    'right': 'text-right',
  }[alignment] || 'text-center';

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
      
      <div className={`px-4 py-12 md:py-16 ${textAlignmentClass}`}>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">{subtitle}</p>
        
        {content.buttons && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {content.buttons.map((button: any, index: number) => (
              <Button
                key={index}
                variant={index === 0 ? "default" : "outline"}
                className={index === 0 ? "" : "text-gray-700 bg-white"}
              >
                {button.text}
              </Button>
            ))}
          </div>
        )}
        
        {!content.buttons && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button>
              Comenzar ahora
            </Button>
            <Button variant="outline" className="text-gray-700 bg-white">
              Más información
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderBlock;
