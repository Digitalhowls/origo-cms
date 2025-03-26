import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { CustomRoleDefinition, SystemRole } from "@shared/types";

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

  // Obtener roles personalizados
  const getRolesQuery = useQuery({
    queryKey: ["/api/roles/organization", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const res = await apiRequest("GET", `/api/roles/organization/${organizationId}`);
      return await res.json();
    },
    enabled: !!organizationId
  });

  // Obtener rol personalizado específico
  const getRoleQuery = (roleId: number) => useQuery({
    queryKey: ["/api/roles", roleId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/roles/${roleId}`);
      return await res.json() as CustomRoleDefinition;
    },
    enabled: !!roleId
  });

  // Crear rol personalizado
  const createRoleMutation = useMutation({
    mutationFn: async (roleData: CreateRoleData) => {
      const res = await apiRequest("POST", "/api/roles", roleData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Rol creado",
        description: "El rol personalizado ha sido creado exitosamente.",
      });
      // Invalida la caché para refrescar los datos
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: ["/api/roles/organization", organizationId]
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear rol",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Actualizar rol personalizado
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateRoleData }) => {
      const res = await apiRequest("PATCH", `/api/roles/${id}`, data);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Rol actualizado",
        description: "El rol personalizado ha sido actualizado exitosamente.",
      });
      // Invalida las cachés para refrescar los datos
      queryClient.invalidateQueries({
        queryKey: ["/api/roles", variables.id]
      });
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: ["/api/roles/organization", organizationId]
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar rol",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Eliminar rol personalizado
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: number) => {
      const res = await apiRequest("DELETE", `/api/roles/${roleId}`);
      return await res.json();
    },
    onSuccess: (_, roleId) => {
      toast({
        title: "Rol eliminado",
        description: "El rol personalizado ha sido eliminado exitosamente.",
      });
      // Invalida las cachés para refrescar los datos
      queryClient.invalidateQueries({
        queryKey: ["/api/roles", roleId]
      });
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: ["/api/roles/organization", organizationId]
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar rol",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Asignar rol a usuario
  const assignRoleToUserMutation = useMutation({
    mutationFn: async ({ roleId, userId }: { roleId: number; userId: number }) => {
      const res = await apiRequest("POST", `/api/roles/${roleId}/assign/${userId}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Rol asignado",
        description: "El rol ha sido asignado al usuario exitosamente.",
      });
      // Invalida la caché de usuarios para refrescar los datos
      queryClient.invalidateQueries({
        queryKey: ["/api/users"]
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al asignar rol",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    roles: getRolesQuery.data || [],
    isLoadingRoles: getRolesQuery.isLoading,
    getRoleQuery,
    createRoleMutation,
    updateRoleMutation,
    deleteRoleMutation,
    assignRoleToUserMutation
  };
}