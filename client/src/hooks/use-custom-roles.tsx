import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { type CustomRoleDefinition } from '@shared/types';

interface CustomRoleFormData {
  name: string;
  description: string;
  basedOnRole: string;
  permissions: Record<string, boolean>;
  isDefault?: boolean;
}

// Hook para gestionar roles personalizados
export function useCustomRoles(organizationId = 1) {
  const queryClient = useQueryClient();

  // Obtener todos los roles personalizados de una organización
  const rolesQuery = useQuery({
    queryKey: ['/api/roles/custom', organizationId],
    queryFn: async () => {
      const response = await fetch(`/api/roles/custom?organizationId=${organizationId}`);
      if (!response.ok) {
        throw new Error('Error al obtener roles personalizados');
      }
      return response.json();
    },
    enabled: !!organizationId,
  });

  // Obtener un rol específico
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
    mutationFn: async (data: CustomRoleFormData) => {
      const roleData = {
        ...data,
        organizationId,
      };
      
      const response = await apiRequest('POST', '/api/roles/custom', roleData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles/custom'] });
      toast({
        title: 'Rol creado',
        description: 'El rol personalizado se ha creado correctamente',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al crear rol',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Actualizar un rol personalizado
  const updateRoleMutation = useMutation({
    mutationFn: async ({
      roleId,
      data,
    }: {
      roleId: number;
      data: Partial<CustomRoleFormData>;
    }) => {
      const response = await apiRequest('PATCH', `/api/roles/custom/${roleId}`, data);
      return await response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles/custom'] });
      queryClient.invalidateQueries({ queryKey: ['/api/roles/custom', variables.roleId] });
      toast({
        title: 'Rol actualizado',
        description: 'El rol personalizado se ha actualizado correctamente',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al actualizar rol',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Eliminar un rol personalizado
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: number) => {
      const response = await apiRequest('DELETE', `/api/roles/custom/${roleId}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles/custom'] });
      toast({
        title: 'Rol eliminado',
        description: 'El rol personalizado se ha eliminado correctamente',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al eliminar rol',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Asignar un rol a un usuario
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: number; roleId: number }) => {
      const response = await apiRequest('POST', '/api/roles/assign', { userId, roleId });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: 'Rol asignado',
        description: 'El rol ha sido asignado correctamente al usuario',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al asignar rol',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    roles: rolesQuery.data as CustomRoleDefinition[],
    isLoading: rolesQuery.isLoading,
    isError: rolesQuery.isError,
    error: rolesQuery.error,
    useRoleQuery,
    createRole: createRoleMutation.mutate,
    updateRole: updateRoleMutation.mutate,
    deleteRole: deleteRoleMutation.mutate,
    assignRole: assignRoleMutation.mutate,
    isPending: 
      createRoleMutation.isPending || 
      updateRoleMutation.isPending || 
      deleteRoleMutation.isPending ||
      assignRoleMutation.isPending
  };
}