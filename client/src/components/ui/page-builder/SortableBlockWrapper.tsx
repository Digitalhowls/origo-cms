import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Copy, Trash, ChevronUp, ChevronDown } from 'lucide-react';
import { usePageStore } from '@/lib/store';

interface SortableBlockWrapperProps {
  id: string;
  children: React.ReactNode;
  onSelect?: () => void;
  isSelected?: boolean;
}

const SortableBlockWrapper: React.FC<SortableBlockWrapperProps> = ({
  id,
  children,
  onSelect,
  isSelected = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  
  const { 
    moveBlockUp, 
    moveBlockDown, 
    duplicateBlock, 
    removeBlock 
  } = usePageStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as 'relative',
    marginBottom: '1rem',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`block-wrapper relative group ${isDragging ? 'opacity-50' : ''} ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
    >
      {/* Drag handle and controls */}
      <div className="absolute right-2 top-2 flex items-center space-x-1 bg-white rounded-md shadow-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          {...attributes}
          {...listeners}
          className="text-gray-500 hover:text-gray-700 p-1"
          title="Mover"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        
        <button
          onClick={onSelect}
          className="text-gray-500 hover:text-gray-700 p-1"
          title="Editar"
        >
          <Edit className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => duplicateBlock(id)}
          className="text-gray-500 hover:text-gray-700 p-1"
          title="Duplicar"
        >
          <Copy className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => moveBlockUp(id)}
          className="text-gray-500 hover:text-gray-700 p-1"
          title="Mover arriba"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => moveBlockDown(id)}
          className="text-gray-500 hover:text-gray-700 p-1"
          title="Mover abajo"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => {
            if (window.confirm('¿Estás seguro de que deseas eliminar este bloque?')) {
              removeBlock(id);
            }
          }}
          className="text-red-500 hover:text-red-700 p-1"
          title="Eliminar"
        >
          <Trash className="h-4 w-4" />
        </button>
      </div>

      {/* The actual block content */}
      <div onClick={onSelect} className="cursor-pointer">{children}</div>
    </div>
  );
};

export default SortableBlockWrapper;