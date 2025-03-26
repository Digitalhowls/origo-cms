import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Resource, Action, RolePermissions, UserRole } from "@shared/types";
import { useState, useEffect } from "react";

// Tipo para los permisos del usuario
interface UserPermission {
  id: number;
  userId: number;
  resource: string;
  action: string;
  allowed: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook para gestionar permisos de usuario
 */
export function usePermissions(userId?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Estado local para los permisos según el rol
  const [rolePermissions, setRolePermissions] = useState<Record<string, boolean>>({});
  
  // Obtener permisos del usuario según su rol
  const roleQuery = useQuery({
    queryKey: userId ? [`/api/permissions/role/${userId}`] : null,
    enabled: !!userId,
  });
  
  // Configurar los permisos del rol cuando cambia la respuesta de la API
  useEffect(() => {
    if (roleQuery.data?.role) {
      const userRole = roleQuery.data.role as UserRole;
      setRolePermissions(RolePermissions[userRole] || {});
    }
  }, [roleQuery.data]);

  // Obtener los permisos personalizados del usuario
  const permissionsQuery = useQuery<UserPermission[]>({
    queryKey: userId ? [`/api/permissions/user/${userId}`] : null,
    enabled: !!userId,
  });

  // Verificar si un usuario tiene un permiso específico
  const checkPermissionQuery = (userId: number, resource: Resource, action: Action) => {
    return useQuery<boolean>({
      queryKey: [`/api/permissions/check/${userId}/${resource}/${action}`],
      enabled: !!userId,
    });
  };

  // Añadir un nuevo permiso
  const addPermissionMutation = useMutation({
    mutationFn: async (permission: {
      userId: number;
      resource: string;
      action: string;
      allowed: boolean;
      description?: string;
    }) => {
      const response = await apiRequest("POST", "/api/permissions", permission);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/permissions/user/${userId}`] });
      toast({
        title: "Permiso añadido",
        description: "El permiso se ha añadido correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al añadir permiso",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Actualizar un permiso existente
  const updatePermissionMutation = useMutation({
    mutationFn: async ({
      id,
      allowed,
    }: {
      id: number;
      allowed: boolean;
    }) => {
      const response = await apiRequest("PATCH", `/api/permissions/${id}`, { allowed });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/permissions/user/${userId}`] });
      toast({
        title: "Permiso actualizado",
        description: "El permiso se ha actualizado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar permiso",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Eliminar un permiso
  const deletePermissionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/permissions/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/permissions/user/${userId}`] });
      toast({
        title: "Permiso eliminado",
        description: "El permiso se ha eliminado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar permiso",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    // Datos de permisos
    permissionsData: permissionsQuery.data,
    permissionsLoading: permissionsQuery.isLoading,
    permissionsError: permissionsQuery.error,
    
    // Datos del rol y sus permisos base
    roleData: roleQuery.data,
    roleLoading: roleQuery.isLoading,
    roleError: roleQuery.error,
    rolePermissions,
    
    // Funciones de utilidad
    checkPermission: checkPermissionQuery,
    
    // Mutaciones para gestión de permisos
    addPermission: addPermissionMutation.mutate,
    isAddingPermission: addPermissionMutation.isPending,
    updatePermission: updatePermissionMutation.mutate,
    isUpdatingPermission: updatePermissionMutation.isPending,
    deletePermission: deletePermissionMutation.mutate,
    isDeletingPermission: deletePermissionMutation.isPending,
    
    // Mantenemos las propiedades anteriores para compatibilidad
    permissions: permissionsQuery.data,
    isLoadingPermissions: permissionsQuery.isLoading,
    errorPermissions: permissionsQuery.error,
  };
}