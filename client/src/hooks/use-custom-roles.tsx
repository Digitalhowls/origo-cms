import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SystemRole, CustomRoleDefinition } from "@shared/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CreateRoleData {
  name: string;
  description?: string;
  organizationId: number;
  basedOnRole: SystemRole;
  isDefault: boolean;
  permissions?: Record<string, boolean>;
}

interface UpdateRoleData {
  name?: string;
  description?: string;
  basedOnRole?: SystemRole;
  isDefault?: boolean;
  permissions?: Record<string, boolean>;
}

/**
 * Hook para la gestión de roles personalizados
 */
export function useCustomRoles(organizationId?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Obtener todos los roles personalizados
  const { 
    data: roles = [], 
    isLoading: isLoadingRoles,
    error: rolesError,
    refetch: refetchRoles
  } = useQuery({
    queryKey: ['/api/roles/custom', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const response = await apiRequest('GET', `/api/roles/custom?organizationId=${organizationId}`);
      return await response.json();
    },
    enabled: !!organizationId,
  });
  
  // Obtener un rol personalizado específico
  const getRole = async (roleId: number) => {
    const response = await apiRequest('GET', `/api/roles/custom/${roleId}`);
    return await response.json();
  };
  
  // Crear un nuevo rol personalizado
  const createRoleMutation = useMutation({
    mutationFn: async (roleData: CreateRoleData) => {
      const response = await apiRequest('POST', '/api/roles/custom', roleData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles/custom'] });
      toast({
        title: "Rol creado",
        description: "El rol personalizado ha sido creado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo crear el rol: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Actualizar un rol personalizado existente
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateRoleData }) => {
      const response = await apiRequest('PATCH', `/api/roles/custom/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles/custom'] });
      toast({
        title: "Rol actualizado",
        description: "El rol personalizado ha sido actualizado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el rol: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Eliminar un rol personalizado
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: number) => {
      await apiRequest('DELETE', `/api/roles/custom/${roleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles/custom'] });
      toast({
        title: "Rol eliminado",
        description: "El rol personalizado ha sido eliminado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar el rol: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Asignar un rol personalizado a un usuario
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: number; roleId: number }) => {
      const response = await apiRequest('POST', `/api/roles/assign`, { userId, roleId });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Rol asignado",
        description: "El rol ha sido asignado al usuario correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo asignar el rol: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  return {
    roles,
    isLoadingRoles,
    rolesError,
    refetchRoles,
    getRole,
    createRoleMutation,
    updateRoleMutation,
    deleteRoleMutation,
    assignRoleMutation,
  };
}