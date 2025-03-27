import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../lib/queryClient";
import { BlockTemplate } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Block } from "@shared/types";

interface TemplatesResponse {
  items: BlockTemplate[];
  totalItems: number;
}

interface TemplateFilters {
  search?: string;
  category?: string;
}

/**
 * Hook que provee acceso a las plantillas de bloques
 */
export function useTemplates() {
  const { toast } = useToast();
  
  const getTemplates = (filters?: TemplateFilters) => {
    const queryString = new URLSearchParams();
    
    if (filters?.search) {
      queryString.append('search', filters.search);
    }
    
    if (filters?.category) {
      queryString.append('category', filters.category);
    }
    
    const endpoint = `/api/templates${queryString.toString() ? '?' + queryString.toString() : ''}`;
    
    return useQuery<TemplatesResponse>({
      queryKey: ['/api/templates', filters],
      queryFn: async () => {
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error('Error al cargar las plantillas');
        }
        return response.json();
      },
    });
  };
  
  const getTemplate = (id: number) => {
    return useQuery<BlockTemplate>({
      queryKey: ['/api/templates', id],
      queryFn: async () => {
        const response = await fetch(`/api/templates/${id}`);
        if (!response.ok) {
          throw new Error('Error al cargar la plantilla');
        }
        return response.json();
      },
      enabled: !!id,
    });
  };
  
  const createTemplateMutation = useMutation({
    mutationFn: async (template: Omit<BlockTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await apiRequest('POST', '/api/templates', template);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: 'Plantilla creada',
        description: 'La plantilla se ha creado correctamente',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al crear la plantilla',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<BlockTemplate> }) => {
      const response = await apiRequest('PATCH', `/api/templates/${id}`, data);
      return await response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/templates', variables.id] });
      toast({
        title: 'Plantilla actualizada',
        description: 'La plantilla se ha actualizado correctamente',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al actualizar la plantilla',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: 'Plantilla eliminada',
        description: 'La plantilla se ha eliminado correctamente',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al eliminar la plantilla',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const useTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('POST', `/api/templates/${id}/usage`);
    },
  });
  
  /**
   * Crea una nueva plantilla a partir de un bloque existente
   */
  const saveAsTemplate = async (block: Block, templateData: { name: string; description: string; category: string; organizationId: number; createdById: number }) => {
    try {
      const template = {
        ...templateData,
        block,
        usageCount: 0,
        tags: [],
      };
      
      return await createTemplateMutation.mutateAsync(template);
    } catch (error) {
      console.error('Error al guardar como plantilla:', error);
      throw error;
    }
  };
  
  /**
   * Incrementa el contador de uso de una plantilla y devuelve el bloque para su uso
   */
  const useTemplate = async (id: number): Promise<Block> => {
    try {
      const template = await getTemplate(id).data;
      
      if (!template) {
        throw new Error('Plantilla no encontrada');
      }
      
      // Incrementar contador de uso
      await useTemplateMutation.mutateAsync(id);
      
      // Devolver una copia del bloque para usar
      return JSON.parse(JSON.stringify(template.block));
    } catch (error) {
      console.error('Error al usar la plantilla:', error);
      throw error;
    }
  };
  
  return {
    getTemplates,
    getTemplate,
    createTemplate: createTemplateMutation.mutate,
    updateTemplate: updateTemplateMutation.mutate,
    deleteTemplate: deleteTemplateMutation.mutate,
    saveAsTemplate,
    useTemplate,
    isCreating: createTemplateMutation.isPending,
    isUpdating: updateTemplateMutation.isPending,
    isDeleting: deleteTemplateMutation.isPending,
  };
}