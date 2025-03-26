import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopNavbar from '@/components/layout/TopNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { usePageStore } from '@/lib/store';
import { useParams, useLocation } from 'wouter';
import { Check, Eye } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import PageEditor from '@/components/ui/page-builder/PageEditor';
import BlockLibrary from '@/components/ui/page-builder/BlockLibrary';
import PropertiesPanel from '@/components/ui/page-builder/PropertiesPanel';

const PageEditorPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { currentPage } = usePageStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPropertyPanelOpen, setIsPropertyPanelOpen] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const pageId = params.id ? parseInt(params.id) : undefined;
  
  // Fetch page data for editing
  const { data: pageData, isLoading, error } = useQuery({
    queryKey: pageId ? [`/api/pages/${pageId}`] : null,
    enabled: !!pageId,
  });
  
  // Save/publish page mutation
  const saveMutation = useMutation({
    mutationFn: async (action: 'save' | 'publish') => {
      if (!currentPage) {
        throw new Error('No hay página para guardar');
      }
      
      // Set status based on action
      const payload = { 
        ...currentPage, 
        status: action === 'publish' ? 'published' : 'draft'
      };
      
      // Determine if this is a create or update operation
      const method = pageId ? 'PATCH' : 'POST';
      const url = pageId ? `/api/pages/${pageId}` : '/api/pages';
      
      const response = await apiRequest(method, url, payload);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Éxito",
        description: "La página ha sido guardada correctamente."
      });
      
      // Redirect to edit page if this was a new page
      if (!pageId && data.id) {
        setLocation(`/pages/edit/${data.id}`);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo guardar la página: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  const handleBlockSelect = (blockId: string) => {
    setSelectedBlockId(blockId);
    setIsPropertyPanelOpen(true);
  };
  
  const handleClosePropertyPanel = () => {
    setIsPropertyPanelOpen(false);
    setSelectedBlockId(null);
  };
  
  const handleSaveDraft = () => {
    saveMutation.mutate('save');
  };
  
  const handlePublish = () => {
    saveMutation.mutate('publish');
  };
  
  const handlePreview = () => {
    if (!currentPage) return;
    
    // Use a modal or open in a new tab
    window.open(`/api/preview/pages/${currentPage.slug}`, '_blank');
  };
  
  if (error) {
    toast({
      title: "Error",
      description: "No se pudo cargar la página. Por favor, inténtelo de nuevo.",
      variant: "destructive",
    });
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar 
          pageTitle={pageId ? "Editar página" : "Nueva página"}
          actions={
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={handleSaveDraft} 
                disabled={saveMutation.isPending}
              >
                Guardar borrador
              </Button>
              <Button 
                variant="outline" 
                onClick={handlePreview} 
                className="text-primary"
                disabled={!currentPage}
              >
                <Eye className="h-4 w-4 mr-1" />
                Vista previa
              </Button>
              <Button 
                onClick={handlePublish} 
                disabled={saveMutation.isPending}
              >
                <Check className="h-4 w-4 mr-1" />
                Publicar
              </Button>
            </div>
          }
        />
        
        {/* Editor Container */}
        <div className="flex-1 overflow-hidden flex">
          {/* Page Builder Main Area */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
            {isLoading ? (
              <div className="flex justify-center p-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <PageEditor pageId={pageId} onBlockSelect={handleBlockSelect} />
            )}
          </main>
          
          {/* Block Library Sidebar */}
          <aside className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-80 bg-white border-l border-gray-200 overflow-y-auto`}>
            <BlockLibrary />
          </aside>
          
          {/* Properties Panel (conditionally visible) */}
          {isPropertyPanelOpen && (
            <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
              <PropertiesPanel blockId={selectedBlockId} onClose={handleClosePropertyPanel} />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageEditorPage;
