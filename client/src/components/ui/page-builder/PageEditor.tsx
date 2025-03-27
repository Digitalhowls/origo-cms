import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, Check, GripVertical, X, Split, RefreshCw } from 'lucide-react';
import { usePageStore } from '@/lib/store';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PageData, Block, BlockType } from '@shared/types';
import HeaderBlock from './blocks/HeaderBlock';
import FeaturesBlock from './blocks/FeaturesBlock';
import TextMediaBlock from './blocks/TextMediaBlock';
import TestimonialBlock from './blocks/TestimonialBlock';
import AccordionBlock from './blocks/AccordionBlock';
import TabsBlock from './blocks/TabsBlock';
import TableBlock from './blocks/TableBlock';
import GalleryBlock from './blocks/GalleryBlock';
import SortableBlockWrapper from './SortableBlockWrapper';
import { PreviewContainer } from './preview';
import { v4 as uuidv4 } from 'uuid';
import { TransitionList, AOSElement } from '@/lib/animation-service';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

// Render appropriate block based on type - exported for use in preview
export const renderBlock = (block: Block, options?: { isPreview?: boolean; isSelected?: boolean }) => {
  const { isPreview = false, isSelected = false } = options || {};
  let blockComponent;
  
  // Si estamos en modo de vista previa, no necesitamos manejar clics
  const handleClick = isPreview ? () => {} : () => {};
  
  switch (block.type) {
    case BlockType.HEADER:
    case 'hero':
      blockComponent = <HeaderBlock 
        block={block} 
        onClick={handleClick} 
      />;
      break;
    case BlockType.FEATURES:
    case 'features':
      blockComponent = <FeaturesBlock 
        block={block} 
        onClick={handleClick} 
      />;
      break;
    case BlockType.TEXT_MEDIA:
    case 'text-media':
      blockComponent = <TextMediaBlock 
        block={block} 
        onClick={handleClick} 
      />;
      break;
    case BlockType.TESTIMONIAL:
    case 'testimonial':
      blockComponent = <TestimonialBlock 
        block={block} 
        onClick={handleClick} 
      />;
      break;
    case BlockType.ACCORDION:
      blockComponent = <AccordionBlock 
        block={block} 
        onClick={handleClick} 
        isPreview={isPreview}
      />;
      break;
    case BlockType.TABS:
      blockComponent = <TabsBlock 
        block={block} 
        onClick={handleClick} 
        isPreview={isPreview}
      />;
      break;
    case BlockType.TABLE:
      blockComponent = <TableBlock 
        block={block} 
        onClick={handleClick} 
        isPreview={isPreview}
      />;
      break;
    case BlockType.GALLERY:
      blockComponent = <GalleryBlock 
        block={block} 
        onClick={handleClick} 
        isPreview={isPreview}
      />;
      break;
    default:
      blockComponent = <div>Bloque no soportado: {block.type}</div>;
  }
  
  // En modo vista previa, no envolvemos con SortableBlockWrapper
  if (isPreview) {
    return blockComponent;
  }
  
  return (
    <SortableBlockWrapper 
      id={block.id}
      onSelect={() => {}} // Será sobrescrito desde el componente
      isSelected={isSelected}
    >
      {blockComponent}
    </SortableBlockWrapper>
  );
};

interface PageEditorProps {
  pageId?: number;
}

const PageEditor: React.FC<PageEditorProps> = ({ pageId }) => {
  const { toast } = useToast();
  const { setCurrentPage, currentPage, updatePageTitle, updatePageSlug } = usePageStore();
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  
  // Estado para el modo de vista previa
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'split' | 'fullscreen'>('split');
  
  // Fetch page data if editing an existing page
  const { data: pageData, isLoading } = useQuery({
    queryKey: pageId ? [`/api/pages/${pageId}`] : ['empty'],
    enabled: !!pageId,
  });

  // Initialize page or set from fetched data
  useEffect(() => {
    if (pageId && pageData) {
      setCurrentPage(pageData as PageData);
    } else if (!pageId) {
      setCurrentPage({
        title: 'Nueva página',
        slug: 'nueva-pagina',
        status: 'draft',
        blocks: [],
      });
    }
  }, [pageId, pageData, setCurrentPage]);

  // Save/publish page mutation
  const savePageMutation = useMutation({
    mutationFn: async (status: 'draft' | 'published') => {
      const payload = { ...currentPage, status };
      const method = pageId ? 'PATCH' : 'POST';
      const url = pageId ? `/api/pages/${pageId}` : '/api/pages';
      
      return apiRequest(method, url, payload);
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: currentPage?.status === 'published' 
          ? "La página ha sido publicada correctamente" 
          : "La página ha sido guardada como borrador",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo guardar la página: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePageTitle(e.target.value);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePageSlug(e.target.value);
  };

  const handleSaveDraft = () => {
    savePageMutation.mutate('draft');
  };

  const handlePublish = () => {
    savePageMutation.mutate('published');
  };

  const handleRealtimePreview = () => {
    setShowPreview(true);
  };

  const handleExternalPreview = () => {
    // Open preview in new tab
    if (currentPage?.slug) {
      window.open(`/api/preview/pages/${currentPage.slug}`, '_blank');
    }
  };

  const handleBlockClick = (blockId: string) => {
    setSelectedBlockId(blockId);
    setIsPropertiesPanelOpen(true);
  };

  const handleAddEmptyBlock = () => {
    // This would typically open a block selector modal
    alert('Esta funcionalidad estaría integrada con el BlockLibrary');
  };

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Update store with new order
      if (currentPage) {
        const reordered = reorderBlocksArray(
          [...currentPage.blocks],
          active.id.toString(),
          over.id.toString()
        );
        
        // Update page store
        usePageStore.getState().setBlocksOrder(reordered);
      }
    }
  };
  
  // Helper function to reorder blocks
  const reorderBlocksArray = (blocks: Block[], activeId: string, overId: string) => {
    const oldIndex = blocks.findIndex((block) => block.id === activeId);
    const newIndex = blocks.findIndex((block) => block.id === overId);
    
    return arrayMove(blocks, oldIndex, newIndex);
  };

  if (isLoading) {
    return <div className="flex justify-center p-10">Cargando...</div>;
  }

  // En modo de pantalla dividida, el editor y la vista previa se muestran lado a lado
  if (showPreview && previewMode === 'split' && currentPage) {
    return (
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Editor de Página</h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPreviewMode('fullscreen')}
              title="Pantalla completa"
            >
              <Split className="h-4 w-4 mr-1" />
              Vista Dividida
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowPreview(false)}
              title="Cerrar vista previa"
            >
              <X className="h-4 w-4 mr-1" />
              Cerrar Vista Previa
            </Button>
          </div>
        </div>

        {/* Split view container */}
        <div className="flex h-[calc(100vh-200px)] gap-4">
          {/* Editor Panel - 50% width */}
          <div className="w-1/2 overflow-auto pr-2">
            {/* Page Meta */}
            <Card className="bg-white mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                  <div>
                    <Label htmlFor="page-title" className="block text-sm font-medium text-gray-700 mb-1">
                      Título de la página
                    </Label>
                    <Input
                      id="page-title"
                      className="block w-full"
                      value={currentPage.title || ''}
                      onChange={handleTitleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="page-slug" className="block text-sm font-medium text-gray-700 mb-1">
                      URL amigable
                    </Label>
                    <div className="flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        /
                      </span>
                      <Input
                        id="page-slug"
                        className="rounded-none rounded-r-md"
                        value={currentPage.slug || ''}
                        onChange={handleSlugChange}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Page Builder Canvas */}
            <Card className="bg-white mb-6">
              <CardContent className="p-4">
                {currentPage.blocks && currentPage.blocks.length > 0 ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext 
                      items={currentPage.blocks.map(block => block.id)} 
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {currentPage.blocks.map((block) => (
                          <div key={block.id}>
                            <SortableBlockWrapper 
                              id={block.id}
                              onSelect={() => handleBlockClick(block.id)}
                              isSelected={selectedBlockId === block.id}
                            >
                              {renderBlock(block)}
                            </SortableBlockWrapper>
                          </div>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Añadir nuevo bloque</h3>
                    <p className="text-gray-500 mb-4">Arrastra un bloque aquí o haz clic para seleccionar</p>
                    <Button variant="outline" onClick={handleAddEmptyBlock}>
                      Seleccionar bloque
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mb-6">
              <Button variant="outline" onClick={handleSaveDraft} disabled={savePageMutation.isPending}>
                Guardar borrador
              </Button>
              <Button onClick={handlePublish} disabled={savePageMutation.isPending}>
                <Check className="h-5 w-5 mr-1" />
                Publicar
              </Button>
            </div>
          </div>

          {/* Preview Panel - 50% width */}
          <div className="w-1/2 overflow-auto border rounded-md bg-gray-50">
            <PreviewContainer
              blocks={currentPage.blocks || []}
              title={currentPage.title || ''}
              selectedBlockId={selectedBlockId}
              onBlockSelect={setSelectedBlockId}
              onClose={() => setShowPreview(false)}
              defaultMode="split"
              className="h-full"
            />
          </div>
        </div>
      </div>
    );
  }

  // En modo de pantalla completa, solo se muestra la vista previa
  if (showPreview && previewMode === 'fullscreen' && currentPage) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <PreviewContainer
          blocks={currentPage.blocks || []}
          title={currentPage.title || ''}
          selectedBlockId={selectedBlockId}
          onBlockSelect={setSelectedBlockId}
          onClose={() => {
            setPreviewMode('split');
            setShowPreview(false);
          }}
          defaultMode="fullscreen"
          className="h-full"
        />
      </div>
    );
  }

  // Vista normal del editor
  return (
    <>
      {/* Page Meta */}
      <Card className="bg-white mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
            <div className="flex-1 mb-4 md:mb-0">
              <Label htmlFor="page-title" className="block text-sm font-medium text-gray-700 mb-1">
                Título de la página
              </Label>
              <Input
                id="page-title"
                className="block w-full"
                value={currentPage?.title || ''}
                onChange={handleTitleChange}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="page-slug" className="block text-sm font-medium text-gray-700 mb-1">
                URL amigable
              </Label>
              <div className="flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  /
                </span>
                <Input
                  id="page-slug"
                  className="rounded-none rounded-r-md"
                  value={currentPage?.slug || ''}
                  onChange={handleSlugChange}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Page Builder Canvas */}
      <Card className="bg-white mb-6 min-h-[500px]">
        <CardContent className="p-4 md:p-6">
          {currentPage?.blocks && currentPage.blocks.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={currentPage.blocks.map(block => block.id)} 
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {currentPage.blocks.map((block) => (
                    <AOSElement 
                      key={block.id}
                      animation="fade-up" 
                      duration={600} 
                      delay={150}
                    >
                      <SortableBlockWrapper 
                        id={block.id}
                        onSelect={() => handleBlockClick(block.id)}
                        isSelected={selectedBlockId === block.id}
                      >
                        {renderBlock(block)}
                      </SortableBlockWrapper>
                    </AOSElement>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Añadir nuevo bloque</h3>
              <p className="text-gray-500 mb-4">Arrastra un bloque aquí o haz clic para seleccionar</p>
              <Button variant="outline" onClick={handleAddEmptyBlock}>
                Seleccionar bloque
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mb-10">
        <Button variant="outline" onClick={handleSaveDraft} disabled={savePageMutation.isPending}>
          Guardar borrador
        </Button>
        <Button variant="outline" onClick={handleRealtimePreview} className="text-primary">
          <RefreshCw className="h-5 w-5 mr-1" />
          Vista previa en tiempo real
        </Button>
        <Button variant="outline" onClick={handleExternalPreview} className="text-primary">
          <Eye className="h-5 w-5 mr-1" />
          Vista previa externa
        </Button>
        <Button onClick={handlePublish} disabled={savePageMutation.isPending}>
          <Check className="h-5 w-5 mr-1" />
          Publicar
        </Button>
      </div>
    </>
  );
};

export default PageEditor;
