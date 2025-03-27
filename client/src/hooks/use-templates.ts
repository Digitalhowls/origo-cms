import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { BlockTemplate, InsertBlockTemplate } from '@shared/schema';
import { Block } from '@shared/types';
import { useToast } from '@/hooks/use-toast';

interface UseTemplatesFilters {
  search?: string;
  category?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

interface TemplatesResponse {
  items: BlockTemplate[];
  total: number;
}

export function useTemplates() {
  const { toast } = useToast();

  // Consultar todas las plantillas con filtros opcionales
  const getTemplates = (filters?: UseTemplatesFilters) => {
    // Construir parámetros de consulta
    const queryParams = new URLSearchParams();
    if (filters) {
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => queryParams.append('tags', tag));
      }
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.offset) queryParams.append('offset', filters.offset.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/templates${queryString ? `?${queryString}` : ''}`;

    return useQuery<TemplatesResponse, Error>({
      queryKey: ['templates', filters],
      queryFn: async () => {
        const response = await apiRequest('GET', endpoint);
        return response.json();
      },
      placeholderData: (previousData) => previousData, // Mantener datos anteriores mientras se actualiza
    });
  };

  // Obtener una plantilla específica por ID
  const getTemplate = (id: number) => {
    return useQuery<BlockTemplate, Error>({
      queryKey: ['template', id],
      queryFn: async () => {
        const response = await apiRequest('GET', `/api/templates/${id}`);
        return response.json();
      },
      enabled: !!id, // Solo ejecutar si hay un ID
    });
  };

  // Crear una nueva plantilla
  const createTemplateMutation = useMutation({
    mutationFn: async (template: InsertBlockTemplate) => {
      const response = await apiRequest('POST', '/api/templates', template);
      return response.json();
    },
    onSuccess: () => {
      // Invalidar consultas relacionadas con plantillas
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: 'Plantilla creada',
        description: 'La plantilla se ha creado correctamente.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al crear plantilla',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Actualizar una plantilla existente
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, template }: { id: number, template: Partial<InsertBlockTemplate> }) => {
      const response = await apiRequest('PATCH', `/api/templates/${id}`, template);
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidar consultas relacionadas con plantillas
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template', variables.id] });
      toast({
        title: 'Plantilla actualizada',
        description: 'La plantilla se ha actualizado correctamente.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al actualizar plantilla',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Eliminar una plantilla
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/templates/${id}`);
    },
    onSuccess: () => {
      // Invalidar consultas relacionadas con plantillas
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: 'Plantilla eliminada',
        description: 'La plantilla se ha eliminado correctamente.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al eliminar plantilla',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Usar una plantilla (convertirla en un bloque)
  const useTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('POST', `/api/templates/${id}/use`);
      return response.json() as Promise<Block>;
    },
    onSuccess: (_, id) => {
      // Incrementar el contador de uso de la plantilla sin invalidar la caché completa
      queryClient.setQueryData<TemplatesResponse>(['templates'], (oldData) => {
        if (!oldData) return undefined;
        
        return {
          ...oldData,
          items: oldData.items.map(template => 
            template.id === id 
              ? { ...template, usageCount: (template.usageCount || 0) + 1 } 
              : template
          )
        };
      });
      
      // También actualizar la entrada individual si está en caché
      queryClient.setQueryData<BlockTemplate>(['template', id], (oldData) => {
        if (!oldData) return undefined;
        return {
          ...oldData,
          usageCount: (oldData.usageCount || 0) + 1
        };
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al usar plantilla',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Función simplificada para usar en componentes
  const createTemplate = (template: InsertBlockTemplate) => 
    createTemplateMutation.mutateAsync(template);
  
  const updateTemplate = (id: number, template: Partial<InsertBlockTemplate>) => 
    updateTemplateMutation.mutateAsync({ id, template });
  
  const deleteTemplate = (id: number) => 
    deleteTemplateMutation.mutateAsync(id);
  
  const useTemplate = (id: number) => 
    useTemplateMutation.mutateAsync(id);

  return {
    getTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,
    // Exponer los estados de las mutaciones si es necesario
    createTemplateLoading: createTemplateMutation.isPending,
    updateTemplateLoading: updateTemplateMutation.isPending,
    deleteTemplateLoading: deleteTemplateMutation.isPending,
    useTemplateLoading: useTemplateMutation.isPending,
  };
}