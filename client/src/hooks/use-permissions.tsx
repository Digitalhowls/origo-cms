import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { 
  PermissionSet, 
  Resource, 
  Action, 
  RolePermissions, 
  SystemRole,
  isSystemRole,
  Permission
} from '@shared/types';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook para gestionar y verificar permisos del usuario
 * Permite verificar si el usuario actual tiene permisos para realizar acciones específicas
 */
export function usePermissions() {
  const { user } = useAuth();
  const [userPermissions, setUserPermissions] = useState<PermissionSet>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Si el rol es personalizado (custom:X), cargar sus permisos
  const isCustomRole = user?.role?.startsWith('custom:');
  const customRoleId = isCustomRole ? parseInt(user?.role?.split(':')[1] || '0') : undefined;
  
  // Obtener permisos del rol personalizado
  const { data: customRoleData } = useQuery({
    queryKey: ['/api/roles/custom', customRoleId],
    queryFn: async () => {
      if (!customRoleId) return null;
      
      const response = await fetch(`/api/roles/custom/${customRoleId}`);
      if (!response.ok) {
        throw new Error('Error al obtener los permisos del rol personalizado');
      }
      return response.json();
    },
    enabled: !!customRoleId && !!user,
  });

  // Cuando cambia el usuario o los datos del rol, actualizar los permisos
  useEffect(() => {
    if (!user) {
      setUserPermissions({});
      setIsLoaded(false);
      return;
    }
    
    let permissions: PermissionSet = {};
    
    // Si es un rol del sistema, usar los permisos predefinidos
    if (user.role && isSystemRole(user.role)) {
      permissions = { ...RolePermissions[user.role as SystemRole] };
    }
    // Si es un rol personalizado, usar los permisos obtenidos de la API
    else if (isCustomRole && customRoleData) {
      permissions = { ...customRoleData.permissions };
    }
    
    setUserPermissions(permissions);
    setIsLoaded(true);
  }, [user, customRoleData, isCustomRole]);

  /**
   * Verifica si el usuario tiene permiso para una acción específica en un recurso
   */
  const hasPermission = useCallback(
    (resource: Resource, action: Action): boolean => {
      if (!user || !isLoaded) return false;
      
      // Super admin siempre tiene todos los permisos
      if (user.role === 'superadmin') return true;
      
      const permissionKey = `${resource}.${action}` as Permission;
      return !!userPermissions[permissionKey];
    },
    [user, userPermissions, isLoaded]
  );

  /**
   * Verifica si el usuario tiene al menos uno de los permisos proporcionados
   */
  const hasAnyPermission = useCallback(
    (permissions: Array<[Resource, Action]>): boolean => {
      return permissions.some(([resource, action]) => hasPermission(resource, action));
    },
    [hasPermission]
  );
  
  /**
   * Verifica si el usuario tiene todos los permisos proporcionados
   */
  const hasAllPermissions = useCallback(
    (permissions: Array<[Resource, Action]>): boolean => {
      return permissions.every(([resource, action]) => hasPermission(resource, action));
    },
    [hasPermission]
  );

  return {
    isLoaded,
    permissions: userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isCustomRole,
    customRoleData,
  };
}