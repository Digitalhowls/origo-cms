import React, { useState } from 'react';
import { Block } from '@shared/types';
import { AnimateCss, StyleTransition } from '@/lib/animation-service';
import { 
  Zap, 
  Shield, 
  BarChart, 
  Layers, 
  BarChart2, 
  CheckCircle, 
  Clock, 
  Database, 
  Globe, 
  Heart, 
  Lock, 
  Search, 
  Star, 
  Unlock 
} from 'lucide-react';

interface FeaturesBlockProps {
  block: Block;
  onClick: () => void;
}

const iconMap: { [key: string]: React.ReactNode } = {
  zap: <Zap />,
  shield: <Shield />,
  'bar-chart': <BarChart />,
  layers: <Layers />,
  'bar-chart-2': <BarChart2 />,
  'check-circle': <CheckCircle />,
  clock: <Clock />,
  database: <Database />,
  globe: <Globe />,
  heart: <Heart />,
  lock: <Lock />,
  search: <Search />,
  star: <Star />,
  unlock: <Unlock />,
};

const FeaturesBlock: React.FC<FeaturesBlockProps> = ({ block, onClick }) => {
  const { content, settings } = block;
  const [isHovered, setIsHovered] = useState(false);
  
  // Default values if not set
  const title = content.title || 'Nuestras características principales';
  const features = content.features || [];
  
  // Apply spacing from settings
  const marginTop = settings.spacing?.marginTop !== undefined ? settings.spacing.marginTop : 10;
  const marginBottom = settings.spacing?.marginBottom !== undefined ? settings.spacing.marginBottom : 10;
  
  // Apply appearance settings
  const backgroundColor = settings.appearance?.backgroundColor || 'white';
  const columns = settings.appearance?.columns || 3;
  
  const style = {
    marginTop: `${marginTop}px`,
    marginBottom: `${marginBottom}px`,
    backgroundColor,
  };

  // Set column class based on settings
  const columnClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'grid-cols-1 md:grid-cols-3';

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || <Star />;
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <StyleTransition
      property="all"
      duration="0.3s"
      timingFunction="ease-in-out"
      className="page-builder-block relative mb-6 transition-all duration-200 hover:border hover:border-dashed hover:border-blue-500 hover:bg-blue-50/20"
      style={style}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
        <h2 className={`text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8 ${isHovered ? 'text-blue-600' : ''}`}>{title}</h2>
        <div className={`grid ${columnClass} gap-8 max-w-6xl mx-auto`}>
          {features.length > 0 ? (
            features.map((feature: any, index: number) => (
              <AnimateCss 
                key={feature.id || index}
                animationName={isHovered ? 'pulse' : ''}
                duration="0.5s"
                delay={`${0.1 * index}s`}
              >
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
                  <StyleTransition
                    property="transform"
                    duration="0.3s"
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ 
                      backgroundColor: feature.iconBgColor || '#EFF6FF',
                      transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    <div style={{ color: feature.iconColor || '#3B82F6' }}>
                      {getIconComponent(feature.icon || 'star')}
                    </div>
                  </StyleTransition>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </AnimateCss>
            ))
          ) : (
            // Default sample features if none are provided
            <>
              <AnimateCss 
                animationName={isHovered ? 'pulse' : ''}
                duration="0.5s"
                delay="0s"
              >
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
                  <StyleTransition
                    property="transform"
                    duration="0.3s"
                    className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4"
                    style={{ 
                      transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    <div className="text-primary">
                      <Zap />
                    </div>
                  </StyleTransition>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalización avanzada</h3>
                  <p className="text-gray-600">Adapta cada aspecto de tu plataforma con nuestras opciones de personalización intuitivas.</p>
                </div>
              </AnimateCss>
              
              <AnimateCss 
                animationName={isHovered ? 'pulse' : ''}
                duration="0.5s"
                delay="0.1s"
              >
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
                  <StyleTransition
                    property="transform"
                    duration="0.3s"
                    className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4"
                    style={{ 
                      transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    <div className="text-secondary">
                      <Shield />
                    </div>
                  </StyleTransition>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Seguridad garantizada</h3>
                  <p className="text-gray-600">Protección avanzada para tus datos y contenido con nuestro sistema de seguridad multicapa.</p>
                </div>
              </AnimateCss>
              
              <AnimateCss 
                animationName={isHovered ? 'pulse' : ''}
                duration="0.5s"
                delay="0.2s"
              >
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
                  <StyleTransition
                    property="transform"
                    duration="0.3s"
                    className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4"
                    style={{ 
                      transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    <div className="text-accent">
                      <BarChart />
                    </div>
                  </StyleTransition>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Análisis detallado</h3>
                  <p className="text-gray-600">Comprende el comportamiento de tus usuarios con nuestras herramientas analíticas intuitivas.</p>
                </div>
              </AnimateCss>
            </>
          )}
        </div>
      </div>
    </StyleTransition>
  );
};

export default FeaturesBlock;
