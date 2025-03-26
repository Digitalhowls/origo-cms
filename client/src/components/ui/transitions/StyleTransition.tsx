import React, { useState, useEffect, useRef } from 'react';

interface StyleTransitionProps {
  children: React.ReactNode;
  property: string;
  duration: string;
  timingFunction: string;
  delay?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
}

/**
 * Componente que agrega transiciones CSS suaves para propiedades de estilo
 * @param {React.ReactNode} children - Contenido interno del componente
 * @param {string} property - Propiedades CSS a las que aplicar transición (separadas por coma)
 * @param {string} duration - Duración de la transición
 * @param {string} timingFunction - Función de temporización
 * @param {string} delay - Retraso opcional antes de la transición
 * @param {string} className - Clases adicionales
 * @param {React.CSSProperties} style - Estilos adicionales
 */
export const StyleTransition: React.FC<StyleTransitionProps> = ({
  children,
  property,
  duration,
  timingFunction,
  delay = '0s',
  className,
  style,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {
  const transitionStyle: React.CSSProperties = {
    ...style,
    transition: `${property} ${duration} ${timingFunction} ${delay}`
  };

  return (
    <div 
      className={className} 
      style={transitionStyle}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
};