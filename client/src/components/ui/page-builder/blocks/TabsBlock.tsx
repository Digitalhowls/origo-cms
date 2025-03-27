import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Block, BlockType } from '@shared/types';
import { LayoutGrid, Smartphone } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useBlockStyles } from '@/hooks/use-block-styles';

// Función para crear un nuevo bloque de pestañas
export function createTabsBlock(): Block {
  // Usamos un valor por defecto para el estilo de pestañas
  const defaultTabsStyle = 'default';

  const tabId1 = uuidv4();
  const tabId2 = uuidv4();

  return {
    id: uuidv4(),
    type: BlockType.TABS,
    content: {},
    settings: {},
    data: {
      title: 'Información organizada en pestañas',
      description: 'Accede a todo el contenido con un clic',
      settings: {
        style: defaultTabsStyle,
        orientation: 'horizontal',
        defaultTab: tabId1,
        showIcons: false,
        fullWidth: true,
        animationType: 'fade'
      },
      items: [
        {
          id: tabId1,
          title: 'Características',
          content: '<p>Origo CMS ofrece una flexibilidad sin precedentes para la creación de contenido digital. Su arquitectura modular permite adaptar cada elemento a tus necesidades específicas.</p>'
        },
        {
          id: tabId2,
          title: 'Beneficios',
          content: '<p>Con nuestro CMS, disfrutarás de un flujo de trabajo simplificado, una interfaz intuitiva y herramientas potentes para gestionar tu contenido de manera eficiente.</p>'
        }
      ]
    }
  };
}

interface TabsBlockProps {
  block: Block;
  onClick?: () => void;
  isPreview?: boolean;
  isSelected?: boolean;
  isEditing?: boolean;
  onBlockChange?: (block: Block) => void;
}

interface TabItemData {
  id: string;
  title: string;
  content: string;
  icon?: string; // Iconos opcionales para cada pestaña
}

// Definición de tipos segura para settings
interface TabsSettings {
  style: 'default' | 'boxed' | 'underline' | 'pills' | 'minimal';
  orientation: 'horizontal' | 'vertical';
  defaultTab: string;
  showIcons: boolean;
  fullWidth: boolean;
  animationType: 'fade' | 'slide' | 'scale' | 'none';
}

/**
 * Componente de bloque de Pestañas para el constructor de páginas
 * Permite organizar contenido en pestañas seleccionables
 */
const TabsBlock: React.FC<TabsBlockProps> = ({ 
  block, 
  onClick = () => {}, 
  isPreview = false,
  isSelected = false,
  isEditing = false,
  onBlockChange
}) => {
  // Acceder a los estilos globales
  const { styles } = useBlockStyles();
  
  // Asegurar que se tenga la estructura correcta de datos
  const data = block.data || {};
  const title = data.title || 'Pestañas';
  const description = data.description || 'Contenido organizado en pestañas';
  const items: TabItemData[] = data.items || [];
  
  // Crear configuración por defecto y asignar valores sobreescritos
  const defaultSettings: TabsSettings = {
    style: 'default',
    orientation: 'horizontal', 
    defaultTab: items.length > 0 ? items[0].id : '',
    showIcons: false,
    fullWidth: true,
    animationType: 'fade'
  };

  // Fusionar las configuraciones por defecto con las proporcionadas
  const blockSettings = data.settings || {};
  const settings = {
    ...defaultSettings,
    ...(blockSettings as Partial<TabsSettings>)
  };

  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState<string>(settings.defaultTab || '');

  // Obtener las clases según el estilo seleccionado usando el sistema global de estilos
  const getStyleClasses = () => {
    const styleValue = settings.style || styles.defaultTabsStyle;
    switch (styleValue) {
      case 'boxed':
        return 'tabs-style-boxed';
      case 'underline':
        return 'tabs-style-underline';
      case 'pills':
        return 'tabs-style-pills';
      case 'minimal':
        return 'tabs-style-minimal';
      default:
        return 'tabs-style-default';
    }
  };

  // Obtener las clases para el contenedor de TabsList según orientación
  const getTabsListClasses = () => {
    const baseClasses = 'transition-all duration-300';
    
    if (settings.orientation === 'vertical') {
      return cn(
        baseClasses,
        'flex-col mr-4 border-r h-auto',
        settings.fullWidth ? 'w-1/4' : 'w-auto'
      );
    }
    
    return cn(
      baseClasses,
      'mb-4',
      settings.fullWidth ? 'w-full' : 'w-auto'
    );
  };

  // Obtener clases para TabsTrigger según el estilo utilizando el sistema global
  const getTriggerClasses = () => {
    const baseClasses = 'tab-trigger';
    const styleValue = settings.style || styles.defaultTabsStyle;
    
    return cn(
      baseClasses,
      `tab-trigger-${styleValue}`
    );
  };

  // Obtener clases para TabsContent según la animación utilizando el sistema global
  const getContentClasses = () => {
    const baseClasses = 'tab-content focus-visible:ring-0 focus-visible:ring-offset-0';
    const animation = settings.animationType || 'fade';
    
    return cn(
      baseClasses,
      `tab-animation-${animation}`,
      'block-elements' // Clase para aplicar estilos globales al contenido
    );
  };

  // Generar el contenido de las pestañas
  const renderTabs = () => (
    <Tabs 
      value={activeTab}
      onValueChange={setActiveTab}
      // @ts-ignore - la propiedad orientation existe en el componente
      orientation={settings.orientation === 'vertical' ? 'vertical' : 'horizontal'}
      className={cn(
        getStyleClasses(),
        settings.orientation === 'vertical' ? 'flex flex-row' : 'flex flex-col'
      )}
    >
      <TabsList className={getTabsListClasses()}>
        {items.map((item) => (
          <TabsTrigger 
            key={item.id} 
            value={item.id}
            className={getTriggerClasses()}
          >
            {settings.showIcons && item.icon && (
              <span className="mr-2">{item.icon}</span>
            )}
            {item.title}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {items.map((item) => (
        <TabsContent 
          key={item.id} 
          value={item.id}
          className={getContentClasses()}
        >
          <div dangerouslySetInnerHTML={{ __html: item.content || 'Contenido de la pestaña' }} />
        </TabsContent>
      ))}
    </Tabs>
  );

  return (
    <div className={`block block-style-${styles.defaultBlockStyle} ${isSelected ? 'is-selected' : ''}`} onClick={isPreview ? undefined : onClick}>
      <div className="block-inner">
        {/* Título y descripción */}
        {title && (
          <h3 className="text-xl font-semibold mb-3">{title}</h3>
        )}
        {description && (
          <p className="text-muted-foreground mb-4">{description}</p>
        )}
        
        {/* Contenido de las pestañas */}
        {items.length > 0 ? (
          renderTabs()
        ) : (
          <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
            No hay pestañas configuradas. Añade pestañas en las propiedades del bloque.
          </div>
        )}
      </div>
    </div>
  );
};

export default TabsBlock;