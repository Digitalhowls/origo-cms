import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Definición de los tipos de datos para las variantes de estilo
export type BlockStyleVariant = 'default' | 'bordered' | 'shadowed' | 'card' | 'boxed' | 'underline' | 'highlight' | 'minimal';
export type AccordionStyleVariant = 'default' | 'bordered' | 'minimal' | 'boxed';
export type TabsStyleVariant = 'default' | 'pills' | 'boxed' | 'underline';
export type TableStyleVariant = 'default' | 'striped' | 'bordered' | 'compact';
export type ButtonStyleVariant = 'primary' | 'secondary' | 'accent' | 'outline';

// Tipos para las preferencias de color y espaciado
export interface ColorPreferences {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
}

export interface SpacingPreferences {
  block: number; // Espaciado interior de los bloques (padding)
  elements: number; // Espaciado entre elementos dentro de un bloque
  blocks: number; // Espaciado entre bloques
}

// Configuración global de estilos
export interface GlobalBlockStyles {
  // Variantes de estilo predeterminadas
  defaultBlockStyle: BlockStyleVariant;
  defaultAccordionStyle: AccordionStyleVariant;
  defaultTabsStyle: TabsStyleVariant;
  defaultTableStyle: TableStyleVariant;
  defaultButtonStyle: ButtonStyleVariant;
  
  // Preferencias de espaciado (en múltiplos de 0.25rem)
  spacing: SpacingPreferences;
  
  // Preferencias de radios (de 0 a 1, donde 0 es sin bordes redondeados y 1 es máxima redondez)
  borderRadius: number;
  
  // Preferencias de colores (se pueden sobrescribir con la paleta del tema)
  // Esto permite personalizar los colores de bloques específicos sin cambiar todo el tema
  colors: ColorPreferences;
  
  // Modo oscuro activado
  darkMode: boolean | 'system';

  // Factor de escala para la tipografía (0.8 = 80%, 1 = 100%, 1.2 = 120%)
  fontScale: number;
}

// Valores predeterminados
export const defaultGlobalBlockStyles: GlobalBlockStyles = {
  defaultBlockStyle: 'default',
  defaultAccordionStyle: 'default',
  defaultTabsStyle: 'default',
  defaultTableStyle: 'default',
  defaultButtonStyle: 'primary',
  
  spacing: {
    block: 6, // 1.5rem (equivalente a p-6 en Tailwind)
    elements: 4, // 1rem
    blocks: 8, // 2rem
  },
  
  borderRadius: 0.5, // Valor medio
  
  colors: {
    primary: 'hsl(222.2 47.4% 11.2%)',
    secondary: '#4a6c8c',
    accent: '#dd6b20',
    background: '#ffffff',
    foreground: '#333333',
    muted: '#6b7280',
    border: '#e2e8f0',
  },
  
  darkMode: 'system',
  fontScale: 1,
};

// Interfaz del contexto
interface BlockStylesContextType {
  styles: GlobalBlockStyles;
  updateStyles: (newStyles: Partial<GlobalBlockStyles>) => void;
  resetStyles: () => void;
  applyTheme: (themeName: 'default' | 'modern' | 'minimal' | 'bold' | 'elegant') => void;
  getCssVariableValue: (variableName: string) => string;
}

// Creación del contexto
const BlockStylesContext = createContext<BlockStylesContextType | undefined>(undefined);

// Hook personalizado para acceder al contexto
export function useBlockStyles() {
  const context = useContext(BlockStylesContext);
  if (!context) {
    throw new Error('useBlockStyles must be used within a BlockStylesProvider');
  }
  return context;
}

// Temas predefinidos
const predefinedThemes: Record<string, Partial<GlobalBlockStyles>> = {
  default: defaultGlobalBlockStyles,
  
  modern: {
    defaultBlockStyle: 'card',
    defaultAccordionStyle: 'bordered',
    defaultTabsStyle: 'pills',
    defaultTableStyle: 'striped',
    borderRadius: 0.75,
    colors: {
      primary: '#3182ce',
      secondary: '#805ad5',
      accent: '#f6ad55',
      background: '#ffffff',
      foreground: '#2d3748',
      muted: '#a0aec0',
      border: '#e2e8f0',
    },
  },
  
  minimal: {
    defaultBlockStyle: 'minimal',
    defaultAccordionStyle: 'minimal',
    defaultTabsStyle: 'underline',
    defaultTableStyle: 'default',
    borderRadius: 0.25,
    spacing: {
      block: 4,
      elements: 3,
      blocks: 6,
    },
    colors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#0070f3',
      background: '#ffffff',
      foreground: '#111111',
      muted: '#888888',
      border: '#e1e1e1',
    },
  },
  
  bold: {
    defaultBlockStyle: 'highlight',
    defaultAccordionStyle: 'boxed',
    defaultTabsStyle: 'boxed',
    defaultTableStyle: 'bordered',
    defaultButtonStyle: 'accent',
    borderRadius: 0.5,
    spacing: {
      block: 8,
      elements: 5,
      blocks: 10,
    },
    colors: {
      primary: '#7b341e',
      secondary: '#285e61',
      accent: '#c05621',
      background: '#fffaf0',
      foreground: '#234e52',
      muted: '#71717a',
      border: '#e6e6e6',
    },
    fontScale: 1.1,
  },
  
  elegant: {
    defaultBlockStyle: 'bordered',
    defaultAccordionStyle: 'bordered',
    defaultTabsStyle: 'underline',
    defaultTableStyle: 'compact',
    borderRadius: 0.125,
    spacing: {
      block: 6,
      elements: 4,
      blocks: 8,
    },
    colors: {
      primary: '#805ad5',
      secondary: '#718096',
      accent: '#d53f8c',
      background: '#ffffff',
      foreground: '#2d3748',
      muted: '#a0aec0',
      border: '#e2e8f0',
    },
    fontScale: 0.95,
  },
};

// Proveedor del contexto
export function BlockStylesProvider({ children }: { children: ReactNode }) {
  const [styles, setStyles] = useState<GlobalBlockStyles>(defaultGlobalBlockStyles);

  // Actualiza las variables CSS cuando cambian los estilos
  useEffect(() => {
    // Función para actualizar variables CSS
    const updateCssVariables = () => {
      const root = document.documentElement;
      
      // Colores
      root.style.setProperty('--origo-color-primary', styles.colors.primary);
      root.style.setProperty('--origo-color-secondary', styles.colors.secondary);
      root.style.setProperty('--origo-color-accent', styles.colors.accent);
      root.style.setProperty('--origo-color-background', styles.colors.background);
      root.style.setProperty('--origo-color-foreground', styles.colors.foreground);
      root.style.setProperty('--origo-color-muted', styles.colors.muted);
      root.style.setProperty('--origo-color-border', styles.colors.border);
      
      // Espaciado (convertir a rem)
      root.style.setProperty('--origo-block-spacing', `${styles.spacing.block * 0.25}rem`);
      root.style.setProperty('--origo-elements-spacing', `${styles.spacing.elements * 0.25}rem`);
      root.style.setProperty('--origo-blocks-spacing', `${styles.spacing.blocks * 0.25}rem`);
      
      // Radio de borde
      const radiusValue = styles.borderRadius * 0.5;
      root.style.setProperty('--origo-border-radius-md', `${radiusValue}rem`);
      
      // Escala de fuente
      root.style.setProperty('--origo-font-scale', styles.fontScale.toString());
      
      // Modo oscuro
      if (styles.darkMode === true || 
         (styles.darkMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark-mode');
      } else {
        root.classList.remove('dark-mode');
      }
    };
    
    updateCssVariables();
    
    // Agregar oyente para cambios en el modo oscuro del sistema
    if (styles.darkMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateCssVariables();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [styles]);
  
  // Actualiza los estilos parcialmente
  const updateStyles = (newStyles: Partial<GlobalBlockStyles>) => {
    setStyles(prevStyles => ({
      ...prevStyles,
      ...newStyles,
      // Maneja la actualización de objetos anidados
      colors: {
        ...prevStyles.colors,
        ...(newStyles.colors || {}),
      },
      spacing: {
        ...prevStyles.spacing,
        ...(newStyles.spacing || {}),
      },
    }));
  };
  
  // Restablece los estilos a los valores predeterminados
  const resetStyles = () => {
    setStyles(defaultGlobalBlockStyles);
  };
  
  // Aplica un tema predefinido
  const applyTheme = (themeName: 'default' | 'modern' | 'minimal' | 'bold' | 'elegant') => {
    const theme = predefinedThemes[themeName];
    if (theme) {
      updateStyles(theme);
    }
  };
  
  // Función para obtener el valor de una variable CSS
  const getCssVariableValue = (variableName: string): string => {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  };

  return (
    <BlockStylesContext.Provider 
      value={{ 
        styles, 
        updateStyles, 
        resetStyles, 
        applyTheme, 
        getCssVariableValue 
      }}
    >
      {children}
    </BlockStylesContext.Provider>
  );
}