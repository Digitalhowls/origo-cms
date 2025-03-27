import React, { useState } from 'react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Block, BlockType } from '@shared/types';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Función para crear un bloque de acordeón
export function createAccordionBlock(): Block {
  return {
    id: uuidv4(),
    type: BlockType.ACCORDION,
    content: {},
    settings: {},
    data: {
      title: 'Preguntas frecuentes',
      description: 'Respuestas a las preguntas más comunes',
      settings: {
        style: 'basic',
        allowMultiple: true,
        showControls: true
      },
      items: [
        {
          id: uuidv4(),
          title: '¿Qué es un CMS headless?',
          content: '<p>Un CMS headless es un sistema de gestión de contenido que proporciona una API para que los desarrolladores puedan consumir su contenido desde cualquier plataforma o dispositivo.</p>',
          isOpen: true
        },
        {
          id: uuidv4(),
          title: '¿Cómo puedo crear un nuevo bloque?',
          content: '<p>Puedes crear un nuevo bloque usando la biblioteca de bloques en el editor de páginas. Simplemente arrastra y suelta el tipo de bloque que deseas añadir.</p>',
          isOpen: false
        },
        {
          id: uuidv4(),
          title: '¿Es posible exportar mi contenido?',
          content: '<p>Sí, puedes exportar todo tu contenido en formato JSON o utilizar nuestra API para acceder a él desde cualquier aplicación externa.</p>',
          isOpen: false
        }
      ]
    }
  };
}

interface AccordionBlockProps {
  block: Block;
  isSelected?: boolean;
  isEditing?: boolean;
  onBlockChange?: (block: Block) => void;
}

export function AccordionBlock({ 
  block, 
  isSelected = false, 
  isEditing = false, 
  onBlockChange 
}: AccordionBlockProps) {
  const items = block.data?.items || [];
  const settings = block.data?.settings || {};
  const style = settings.style || 'basic';
  const allowMultiple = settings.allowMultiple !== false; // Por defecto permitir múltiples abiertos
  const showControls = settings.showControls || false;
  
  const [openItems, setOpenItems] = useState<string[]>(
    // Inicializar con los items marcados como abiertos
    items
      .filter(item => item.isOpen)
      .map(item => item.id)
  );

  const handleValueChange = (value: string[]) => {
    setOpenItems(value);
    
    // Si estamos en modo edición y hay un handler, actualizar el estado del bloque
    if (isEditing && onBlockChange) {
      const updatedItems = items.map(item => ({
        ...item,
        isOpen: value.includes(item.id)
      }));
      
      onBlockChange({
        ...block,
        data: {
          ...block.data,
          items: updatedItems
        }
      });
    }
  };

  const handleExpandAll = () => {
    const allItemIds = items.map(item => item.id);
    setOpenItems(allItemIds);
    
    if (isEditing && onBlockChange) {
      const updatedItems = items.map(item => ({
        ...item,
        isOpen: true
      }));
      
      onBlockChange({
        ...block,
        data: {
          ...block.data,
          items: updatedItems
        }
      });
    }
  };

  const handleCollapseAll = () => {
    setOpenItems([]);
    
    if (isEditing && onBlockChange) {
      const updatedItems = items.map(item => ({
        ...item,
        isOpen: false
      }));
      
      onBlockChange({
        ...block,
        data: {
          ...block.data,
          items: updatedItems
        }
      });
    }
  };

  // Si no hay items, mostrar contenido por defecto o mensaje
  if (items.length === 0 && isEditing) {
    return (
      <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500 mb-4">No hay elementos en el acordeón. Añada contenido mediante el panel de propiedades.</p>
        <Button 
          onClick={() => {
            if (onBlockChange) {
              onBlockChange({
                ...block,
                data: {
                  ...block.data,
                  items: [
                    {
                      id: uuidv4(),
                      title: "Elemento 1",
                      content: "Contenido del elemento 1",
                      isOpen: true
                    },
                    {
                      id: uuidv4(),
                      title: "Elemento 2",
                      content: "Contenido del elemento 2",
                      isOpen: false
                    }
                  ]
                }
              });
            }
          }}
          variant="outline"
        >
          Añadir elementos de ejemplo
        </Button>
      </div>
    );
  }

  // Si no hay items y no estamos editando, no mostrar nada
  if (items.length === 0 && !isEditing) {
    return null;
  }

  return (
    <div className={`accordion-block accordion-style-${style} ${isSelected ? 'is-selected' : ''}`}>
      {/* Título y descripción opcional del bloque */}
      {block.data?.title && (
        <h3 className="text-xl font-semibold mb-3">{block.data.title}</h3>
      )}
      {block.data?.description && (
        <p className="text-gray-600 mb-4">{block.data.description}</p>
      )}
      
      {/* Controles para expandir/contraer todo */}
      {showControls && (
        <div className="flex justify-end mb-3 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExpandAll} 
            className="text-sm"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Expandir todo
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCollapseAll}
            className="text-sm"
          >
            <MinusCircle className="h-4 w-4 mr-1" />
            Contraer todo
          </Button>
        </div>
      )}
      
      {/* Componente Acordeón */}
      {allowMultiple ? (
        <Accordion 
          type="multiple"
          value={openItems}
          onValueChange={handleValueChange}
          className={`w-full rounded-md ${style === 'bordered' ? 'border border-border p-1' : ''} ${style === 'shadowed' ? 'shadow-lg' : ''}`}
        >
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id} className={`${style === 'faq' ? 'bg-muted/50 mb-2 rounded-md overflow-hidden' : ''}`}>
              <AccordionTrigger className={`px-4 ${style === 'faq' ? 'hover:bg-muted/80' : ''}`}>
                {item.title}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div dangerouslySetInnerHTML={{ __html: item.content }} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Accordion 
          type="single"
          value={openItems.length > 0 ? openItems[0] : ''}
          onValueChange={(val: string) => handleValueChange([val])}
          className={`w-full rounded-md ${style === 'bordered' ? 'border border-border p-1' : ''} ${style === 'shadowed' ? 'shadow-lg' : ''}`}
        >
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id} className={`${style === 'faq' ? 'bg-muted/50 mb-2 rounded-md overflow-hidden' : ''}`}>
              <AccordionTrigger className={`px-4 ${style === 'faq' ? 'hover:bg-muted/80' : ''}`}>
                {item.title}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div dangerouslySetInnerHTML={{ __html: item.content }} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}

// Componente separado para las propiedades del bloque (utilizado en el panel de propiedades)
export function AccordionBlockProperties({ 
  block, 
  onUpdate 
}: { 
  block: Block;
  onUpdate: (block: Block) => void;
}) {
  const items = block.data?.items || [];
  const settings = block.data?.settings || {};
  const title = block.data?.title || '';
  const description = block.data?.description || '';
  
  // Estilos disponibles para el acordeón
  const styleOptions = [
    { value: 'basic', label: 'Básico' },
    { value: 'bordered', label: 'Con bordes' },
    { value: 'shadowed', label: 'Con sombras' },
    { value: 'faq', label: 'Estilo FAQ' }
  ];
  
  // Manejar cambios en el título
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...block,
      data: {
        ...block.data,
        title: e.target.value
      }
    });
  };
  
  // Manejar cambios en la descripción
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...block,
      data: {
        ...block.data,
        description: e.target.value
      }
    });
  };
  
  // Manejar cambios en el estilo
  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({
      ...block,
      data: {
        ...block.data,
        settings: {
          ...settings,
          style: e.target.value as 'basic' | 'bordered' | 'shadowed' | 'faq'
        }
      }
    });
  };
  
  // Manejar cambios en la configuración de permitir múltiples elementos abiertos
  const handleAllowMultipleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...block,
      data: {
        ...block.data,
        settings: {
          ...settings,
          allowMultiple: e.target.checked
        }
      }
    });
  };
  
  // Manejar cambios en la configuración de mostrar controles
  const handleShowControlsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...block,
      data: {
        ...block.data,
        settings: {
          ...settings,
          showControls: e.target.checked
        }
      }
    });
  };
  
  // Manejar actualización de un elemento del acordeón
  const handleItemUpdate = (index: number, field: string, value: string | boolean) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    
    onUpdate({
      ...block,
      data: {
        ...block.data,
        items: newItems
      }
    });
  };
  
  // Añadir un nuevo elemento al acordeón
  const handleAddItem = () => {
    const newItems = [...items];
    newItems.push({
      id: uuidv4(),
      title: `Nuevo elemento ${items.length + 1}`,
      content: '<p>Contenido del nuevo elemento</p>',
      isOpen: false
    });
    
    onUpdate({
      ...block,
      data: {
        ...block.data,
        items: newItems
      }
    });
  };
  
  // Eliminar un elemento del acordeón
  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    
    onUpdate({
      ...block,
      data: {
        ...block.data,
        items: newItems
      }
    });
  };
  
  // Mover un elemento hacia arriba
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    
    onUpdate({
      ...block,
      data: {
        ...block.data,
        items: newItems
      }
    });
  };
  
  // Mover un elemento hacia abajo
  const handleMoveDown = (index: number) => {
    if (index >= items.length - 1) return;
    
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    
    onUpdate({
      ...block,
      data: {
        ...block.data,
        items: newItems
      }
    });
  };
  
  return (
    <div className="accordion-properties space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Configuración general</h3>
        
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="accordion-title">
            Título del bloque
          </label>
          <input
            id="accordion-title"
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-sm"
            placeholder="Título del acordeón"
          />
        </div>
        
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="accordion-description">
            Descripción (opcional)
          </label>
          <textarea
            id="accordion-description"
            value={description}
            onChange={handleDescriptionChange}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-sm min-h-[80px]"
            placeholder="Breve descripción del contenido"
          />
        </div>
        
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="accordion-style">
            Estilo visual
          </label>
          <select
            id="accordion-style"
            value={settings.style || 'basic'}
            onChange={handleStyleChange}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-sm"
          >
            {styleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            id="allow-multiple"
            type="checkbox"
            checked={settings.allowMultiple !== false}
            onChange={handleAllowMultipleChange}
            className="rounded border-gray-300"
          />
          <label className="text-sm" htmlFor="allow-multiple">
            Permitir múltiples elementos abiertos
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            id="show-controls"
            type="checkbox"
            checked={settings.showControls || false}
            onChange={handleShowControlsChange}
            className="rounded border-gray-300"
          />
          <label className="text-sm" htmlFor="show-controls">
            Mostrar controles expandir/contraer todo
          </label>
        </div>
      </div>
      
      <div className="border-t pt-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Elementos del acordeón</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddItem}
          >
            Añadir elemento
          </Button>
        </div>
        
        {items.map((item, index) => (
          <div key={item.id} className="border rounded-md p-3 space-y-3 bg-background">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">Elemento {index + 1}</span>
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="h-8 w-8 p-0"
                >
                  <span className="sr-only">Mover arriba</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                  </svg>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleMoveDown(index)}
                  disabled={index === items.length - 1}
                  className="h-8 w-8 p-0"
                >
                  <span className="sr-only">Mover abajo</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                  </svg>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRemoveItem(index)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <span className="sr-only">Eliminar</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </div>
            
            <div className="grid gap-2">
              <label 
                className="text-sm font-medium" 
                htmlFor={`item-${index}-title`}
              >
                Título
              </label>
              <input
                id={`item-${index}-title`}
                type="text"
                value={item.title}
                onChange={(e) => handleItemUpdate(index, 'title', e.target.value)}
                className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-sm"
              />
            </div>
            
            <div className="grid gap-2">
              <label 
                className="text-sm font-medium" 
                htmlFor={`item-${index}-content`}
              >
                Contenido (soporta HTML)
              </label>
              <textarea
                id={`item-${index}-content`}
                value={item.content}
                onChange={(e) => handleItemUpdate(index, 'content', e.target.value)}
                className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-sm min-h-[100px]"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                id={`item-${index}-open`}
                type="checkbox"
                checked={item.isOpen || false}
                onChange={(e) => handleItemUpdate(index, 'isOpen', e.target.checked)}
                className="rounded border-gray-300"
              />
              <label 
                className="text-sm" 
                htmlFor={`item-${index}-open`}
              >
                Abierto por defecto
              </label>
            </div>
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="border rounded-md border-dashed p-6 text-center">
            <p className="text-gray-500 mb-2">No hay elementos en este acordeón</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAddItem}
            >
              Añadir primer elemento
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Función para crear un nuevo bloque de acordeón con valores predeterminados
export function createAccordionBlock(): Block {
  return {
    id: uuidv4(),
    type: BlockType.ACCORDION,
    content: {},
    settings: {},
    data: {
      title: "Preguntas Frecuentes",
      description: "Encuentra respuestas a las preguntas más comunes",
      items: [
        {
          id: uuidv4(),
          title: "¿Cómo funciona este servicio?",
          content: "<p>Este servicio funciona mediante un sistema intuitivo que permite a los usuarios gestionar su contenido fácilmente. Simplemente sigue los pasos indicados en la plataforma.</p>",
          isOpen: true
        },
        {
          id: uuidv4(),
          title: "¿Qué incluye la suscripción básica?",
          content: "<p>La suscripción básica incluye acceso a todas las funcionalidades esenciales como gestión de contenido, análisis básicos y soporte por correo electrónico.</p>",
          isOpen: false
        },
        {
          id: uuidv4(),
          title: "¿Puedo cancelar mi suscripción en cualquier momento?",
          content: "<p>Sí, puedes cancelar tu suscripción en cualquier momento. No hay contratos de permanencia y puedes gestionar tus suscripciones desde tu perfil de usuario.</p>",
          isOpen: false
        }
      ],
      settings: {
        style: 'basic' as 'basic' | 'bordered' | 'shadowed' | 'faq',
        allowMultiple: true,
        showControls: true
      }
    }
  };
}