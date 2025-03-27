import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Block, BlockType } from '@shared/types';
import { ChevronDown } from 'lucide-react';

interface AccordionBlockProps {
  block: Block;
  onClick?: () => void;
  isPreview?: boolean;
}

interface AccordionItemData {
  id: string;
  title: string;
  content: string;
  isOpen?: boolean;
}

/**
 * Componente de bloque de Acordeón/FAQ para el constructor de páginas
 * Permite crear secciones plegables para mostrar información de forma organizada
 */
const AccordionBlock: React.FC<AccordionBlockProps> = ({ 
  block, 
  onClick = () => {}, 
  isPreview = false 
}) => {
  // Asegurar que se tenga la estructura correcta de datos
  const data = block.data || {};
  const title = data.title || 'Preguntas Frecuentes';
  const description = data.description || 'Respuestas a las preguntas más comunes';
  const items: AccordionItemData[] = data.items || [];
  const settings = data.settings || {
    style: 'basic',
    allowMultiple: true,
    defaultValues: [],
    showControls: false,
    headerTag: 'h3'
  };

  // Estado para controlar qué items están abiertos
  const [openItems, setOpenItems] = useState<string[]>(settings.defaultValues || []);

  // Obtener el valor de tipo para usar clases específicas
  const style = settings.style || 'basic';
  
  // Determinar si se permite abrir múltiples items a la vez
  const allowMultiple = settings.allowMultiple !== false;
  
  // Función para manejar el clic en un ítem
  const handleItemClick = (itemId: string) => {
    if (allowMultiple) {
      // Si es múltiple, toggle el item específico
      setOpenItems(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId) 
          : [...prev, itemId]
      );
    } else {
      // Si es single, reemplazar con el nuevo ítem o cerrar si ya está abierto
      setOpenItems(prev => 
        prev.includes(itemId) ? [] : [itemId]
      );
    }
  };

  // Funciones para expandir o contraer todos los ítems
  const expandAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenItems(items.map(item => item.id));
  };

  const collapseAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenItems([]);
  };
  
  // Determinar las clases para el estilo seleccionado
  const getStyleClasses = () => {
    switch (style) {
      case 'bordered':
        return 'accordion-bordered divide-y';
      case 'shadowed':
        return 'accordion-shadowed divide-y shadow-sm';
      case 'faq':
        return 'accordion-faq rounded-lg';
      default:
        return 'accordion-basic';
    }
  };

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
        <div className={cn('space-y-2', getStyleClasses())}>
          {items.map((item, index) => {
            const itemId = item.id || `item-${index}`;
            const isOpen = openItems.includes(itemId);
            
            return (
              <div 
                key={itemId}
                className={cn(
                  'border rounded-md overflow-hidden',
                  style === 'shadowed' ? 'shadow-sm' : ''
                )}
              >
                <div 
                  className={cn(
                    'flex items-center justify-between p-4 font-medium cursor-pointer',
                    isOpen ? 'border-b' : '',
                    style === 'faq' ? 'bg-gray-50' : ''
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(itemId);
                  }}
                >
                  <div>{item.title || `Ítem ${index + 1}`}</div>
                  <ChevronDown 
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform duration-200',
                      isOpen ? 'rotate-180' : ''
                    )} 
                  />
                </div>
                
                {isOpen && (
                  <div className="px-4 py-3">
                    <div dangerouslySetInnerHTML={{ __html: item.content || 'Contenido del acordeón' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Controles para expandir/contraer todos (opcional) */}
        {settings.showControls && items.length > 1 && (
          <div className="flex justify-end space-x-2 mt-4">
            <button 
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={expandAll}
            >
              Expandir todos
            </button>
            <span className="text-gray-300">|</span>
            <button 
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={collapseAll}
            >
              Contraer todos
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccordionBlock;