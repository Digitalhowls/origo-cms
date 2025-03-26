import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { CustomRoleDefinition, PermissionSet } from '@shared/types';
import { useToast } from '@/hooks/use-toast';

export interface CustomRoleFormData {
  name: string;
  description: string;
  basedOnRole: string;
  permissions: PermissionSet;
}

/**
 * Hook para gestionar los roles personalizados
 * Proporciona funciones para obtener, crear, actualizar y eliminar roles personalizados
 */
export function useCustomRoles() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  // Obtener todos los roles personalizados
  const { 
    data: roles = [],
    isLoading,
    isError,
    error,
  } = useQuery<CustomRoleDefinition[]>({
    queryKey: ['/api/roles/custom'],
    queryFn: async () => {
      const response = await fetch('/api/roles/custom');
      if (!response.ok) {
        throw new Error('Error al obtener los roles personalizados');
      }
      return response.json();
    },
  });

  // Hook para obtener un rol específico
  const useRoleQuery = (roleId?: number) => {
    return useQuery({
      queryKey: ['/api/roles/custom', roleId],
      queryFn: async () => {
        if (!roleId) return null;
        
        const response = await fetch(`/api/roles/custom/${roleId}`);
        if (!response.ok) {
          throw new Error('Error al obtener el rol personalizado');
        }
        return response.json();
      },
      enabled: !!roleId,
    });
  };

  // Crear un nuevo rol personalizado
  const createRoleMutation = useMutation({
    mutationFn: async (roleData: CustomRoleFormData) => {
      setIsPending(true);
      const response = await apiRequest('POST', '/api/roles/custom', roleData);
      return response;
    },
    onSuccess: () => {
      setIsPending(false);
      toast({
        title: 'Rol creado',
        description: 'El rol personalizado ha sido creado correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/roles/custom'] });
    },
    onError: (error: Error) => {
      setIsPending(false);
      toast({
        title: 'Error',
        description: `Error al crear el rol: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Actualizar un rol personalizado existente
  const updateRoleMutation = useMutation({
    mutationFn: async ({ 
      roleId, 
      data 
    }: { 
      roleId: number, 
      data: Partial<CustomRoleFormData>
    }) => {
      setIsPending(true);
      const response = await apiRequest('PATCH', `/api/roles/custom/${roleId}`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      setIsPending(false);
      toast({
        title: 'Rol actualizado',
        description: 'El rol personalizado ha sido actualizado correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/roles/custom', variables.roleId] });
      queryClient.invalidateQueries({ queryKey: ['/api/roles/custom'] });
    },
    onError: (error: Error) => {
      setIsPending(false);
      toast({
        title: 'Error',
        description: `Error al actualizar el rol: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Eliminar un rol personalizado
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: number) => {
      setIsPending(true);
      const response = await apiRequest('DELETE', `/api/roles/custom/${roleId}`);
      return response;
    },
    onSuccess: () => {
      setIsPending(false);
      toast({
        title: 'Rol eliminado',
        description: 'El rol personalizado ha sido eliminado correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/roles/custom'] });
    },
    onError: (error: Error) => {
      setIsPending(false);
      toast({
        title: 'Error',
        description: `Error al eliminar el rol: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Asignar un rol personalizado a un usuario
  const assignRoleMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      roleId 
    }: { 
      userId: number, 
      roleId: number
    }) => {
      setIsPending(true);
      const response = await apiRequest('POST', `/api/roles/assign`, { userId, roleId });
      return response;
    },
    onSuccess: () => {
      setIsPending(false);
      toast({
        title: 'Rol asignado',
        description: 'El rol ha sido asignado al usuario correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error: Error) => {
      setIsPending(false);
      toast({
        title: 'Error',
        description: `Error al asignar el rol: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  return {
    roles,
    isLoading,
    isError,
    error,
    useRoleQuery,
    createRoleMutation,
    updateRoleMutation,
    deleteRoleMutation,
    assignRoleMutation,
    isPending,
  };
}