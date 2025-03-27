import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Block, BlockType } from '@shared/types';
import { LayoutGrid, Smartphone } from 'lucide-react';

interface TabsBlockProps {
  block: Block;
  onClick?: () => void;
  isPreview?: boolean;
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
  isPreview = false 
}) => {
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

  // Obtener las clases según el estilo seleccionado
  const getStyleClasses = () => {
    switch (settings.style) {
      case 'boxed':
        return 'tabs-boxed bg-gray-50 p-4 rounded-lg';
      case 'underline':
        return 'tabs-underline border-b';
      case 'pills':
        return 'tabs-pills';
      case 'minimal':
        return 'tabs-minimal';
      default:
        return 'tabs-default';
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

  // Obtener clases para TabsTrigger según el estilo
  const getTriggerClasses = () => {
    const baseClasses = 'transition-all duration-200';
    
    switch (settings.style) {
      case 'boxed':
        return cn(baseClasses, 'bg-white shadow-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground');
      case 'underline':
        return cn(baseClasses, 'border-b-2 border-transparent rounded-none data-[state=active]:border-primary');
      case 'pills':
        return cn(baseClasses, 'rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground');
      case 'minimal':
        return cn(baseClasses, 'text-muted-foreground data-[state=active]:text-foreground data-[state=active]:font-medium');
      default:
        return baseClasses;
    }
  };

  // Obtener clases para TabsContent según la animación
  const getContentClasses = () => {
    const baseClasses = 'focus-visible:ring-0 focus-visible:ring-offset-0';
    
    switch (settings.animationType) {
      case 'slide':
        return cn(baseClasses, 'tab-slide-animation');
      case 'fade':
        return cn(baseClasses, 'tab-fade-animation');
      case 'scale':
        return cn(baseClasses, 'tab-scale-animation');
      default:
        return baseClasses;
    }
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
    <Card
      className={cn(
        'w-full overflow-hidden',
        isPreview ? 'cursor-default' : 'cursor-pointer hover:shadow-md transition-shadow'
      )}
      onClick={isPreview ? undefined : onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          renderTabs()
        ) : (
          <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
            No hay pestañas configuradas. Añade pestañas en las propiedades del bloque.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TabsBlock;