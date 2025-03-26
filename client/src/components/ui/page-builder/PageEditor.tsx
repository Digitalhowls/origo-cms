import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, Check } from 'lucide-react';
import { usePageStore } from '@/lib/store';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PageData, Block } from '@shared/types';
import HeaderBlock from './blocks/HeaderBlock';
import FeaturesBlock from './blocks/FeaturesBlock';
import TextMediaBlock from './blocks/TextMediaBlock';
import { v4 as uuidv4 } from 'uuid';

interface PageEditorProps {
  pageId?: number;
}

const PageEditor: React.FC<PageEditorProps> = ({ pageId }) => {
  const { toast } = useToast();
  const { setCurrentPage, currentPage, updatePageTitle, updatePageSlug } = usePageStore();
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  
  // Fetch page data if editing an existing page
  const { data: pageData, isLoading } = useQuery({
    queryKey: pageId ? [`/api/pages/${pageId}`] : null,
    enabled: !!pageId,
  });

  // Initialize page or set from fetched data
  useEffect(() => {
    if (pageId && pageData) {
      setCurrentPage(pageData);
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
        description: currentPage.status === 'published' 
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

  const handlePreview = () => {
    // Open preview in new tab
    window.open(`/api/preview/pages/${currentPage.slug}`, '_blank');
  };

  const handleBlockClick = (blockId: string) => {
    setSelectedBlockId(blockId);
    setIsPropertiesPanelOpen(true);
  };

  const handleAddEmptyBlock = () => {
    // This would typically open a block selector modal
    alert('Esta funcionalidad estaría integrada con el BlockLibrary');
  };

  // Render appropriate block based on type
  const renderBlock = (block: Block) => {
    switch (block.type) {
      case 'hero':
        return <HeaderBlock 
          key={block.id} 
          block={block} 
          onClick={() => handleBlockClick(block.id)} 
        />;
      case 'features':
        return <FeaturesBlock 
          key={block.id} 
          block={block} 
          onClick={() => handleBlockClick(block.id)} 
        />;
      case 'text-media':
        return <TextMediaBlock 
          key={block.id} 
          block={block} 
          onClick={() => handleBlockClick(block.id)} 
        />;
      default:
        return <div key={block.id}>Bloque no soportado: {block.type}</div>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-10">Cargando...</div>;
  }

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
            currentPage.blocks.map(block => renderBlock(block))
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
        <Button variant="outline" onClick={handlePreview} className="text-primary">
          <Eye className="h-5 w-5 mr-1" />
          Vista previa
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
