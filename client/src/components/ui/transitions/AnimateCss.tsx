import React, { useState, useEffect } from 'react';

interface AnimateCssProps {
  children: React.ReactNode;
  animationName: string;
  duration?: string;
  delay?: string;
  infinite?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onAnimationEnd?: () => void;
}

/**
 * Componente que agrega animaciones basadas en Animate.css
 * Requiere que Animate.css esté incluido en el proyecto
 * 
 * @param {React.ReactNode} children - Contenido interno del componente
 * @param {string} animationName - Nombre de la animación (ej: 'fadeIn', 'bounce')
 * @param {string} duration - Duración de la animación (ej: '1s')
 * @param {string} delay - Retraso antes de la animación (ej: '0.5s')
 * @param {boolean} infinite - Si la animación debe repetirse infinitamente
 * @param {string} className - Clases adicionales
 * @param {React.CSSProperties} style - Estilos adicionales
 * @param {Function} onAnimationEnd - Función a ejecutar cuando termine la animación
 */
export const AnimateCss: React.FC<AnimateCssProps> = ({
  children,
  animationName,
  duration = '1s',
  delay = '0s',
  infinite = false,
  className = '',
  style = {},
  onAnimationEnd
}) => {
  const [animationClasses, setAnimationClasses] = useState<string>('');

  useEffect(() => {
    if (animationName) {
      setAnimationClasses(`animate__animated animate__${animationName}`);
    } else {
      setAnimationClasses('');
    }
  }, [animationName]);

  const animationStyle: React.CSSProperties = {
    ...style,
    animationDuration: duration,
    animationDelay: delay,
    animationIterationCount: infinite ? 'infinite' : '1'
  };

  return (
    <div 
      className={`${className} ${animationClasses}`} 
      style={animationStyle}
      onAnimationEnd={onAnimationEnd}
    >
      {children}
    </div>
  );
};