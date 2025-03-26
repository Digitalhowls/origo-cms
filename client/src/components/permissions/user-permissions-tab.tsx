import React, { useState, useEffect } from 'react';
import { RolePermissions, PermissionSet, UserRole } from '@shared/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import RolePermissionsInfo from './role-permissions-info';
import { useCustomRoles } from '@/hooks/use-custom-roles';
import { Info, Shield, AlertTriangle } from 'lucide-react';

interface UserPermissionsTabProps {
  userId: number;
  userName: string;
  userRole: UserRole;
}

const UserPermissionsTab: React.FC<UserPermissionsTabProps> = ({
  userId,
  userName,
  userRole
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('role-info');
  
  // Obtener roles personalizados para asignar al usuario
  const { 
    roles: customRoles = [], 
    isLoading: isLoadingRoles,
    assignRoleMutation 
  } = useCustomRoles();
  
  // Determinar si el rol actual es un rol personalizado
  const isCustomRole = typeof userRole === 'string' && userRole.startsWith('custom:');
  const customRoleId = isCustomRole ? parseInt(userRole.split(':')[1], 10) : null;
  const systemRole = isCustomRole ? null : userRole;
  
  // Obtener el detalle del rol personalizado si aplica
  const { data: customRoleData, isLoading: isLoadingCustomRole } = useQuery({
    queryKey: ['/api/roles/custom', customRoleId],
    queryFn: async () => {
      if (!customRoleId) return null;
      const response = await fetch(`/api/roles/custom/${customRoleId}`);
      if (!response.ok) {
        throw new Error('Error al obtener el rol personalizado');
      }
      return response.json();
    },
    enabled: !!customRoleId
  });
  
  // Funciones para manejar la asignación de roles personalizados
  const handleAssignRole = async (roleId: number) => {
    try {
      await assignRoleMutation.mutateAsync({ userId, roleId });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    } catch (error) {
      console.error('Error al asignar el rol:', error);
    }
  };
  
  // Permisos basados en el rol actual (sistema o personalizado)
  const currentPermissions = isCustomRole 
    ? customRoleData?.permissions || {}
    : systemRole ? RolePermissions[systemRole as keyof typeof RolePermissions] || {} : {};
  
  // Estado de carga
  const isLoading = isLoadingRoles || (isCustomRole && isLoadingCustomRole);
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="role-info">Información del rol</TabsTrigger>
          <TabsTrigger value="assign-role">Asignar rol personalizado</TabsTrigger>
        </TabsList>
        
        <TabsContent value="role-info">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permisos de {userName}
              </CardTitle>
              <CardDescription>
                Permisos actuales del usuario basados en su rol.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="p-4 text-center">
                  <p className="text-muted-foreground">Cargando permisos...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <p className="text-sm font-medium">Rol actual:</p>
                    {isCustomRole ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{customRoleData?.name || 'Rol personalizado'}</span>
                        <span className="text-xs text-muted-foreground">(Personalizado)</span>
                      </div>
                    ) : (
                      <span className="text-sm font-bold">
                        {typeof userRole === 'string' 
                          ? userRole.charAt(0).toUpperCase() + userRole.slice(1) 
                          : 'Desconocido'}
                      </span>
                    )}
                  </div>
                  
                  {isCustomRole && customRoleData?.basedOnRole && (
                    <Alert className="mb-4">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Rol personalizado</AlertTitle>
                      <AlertDescription>
                        Este rol está basado en el rol <span className="font-bold">{customRoleData.basedOnRole}</span> con permisos modificados.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <RolePermissionsInfo permissions={currentPermissions} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assign-role">
          <Card>
            <CardHeader>
              <CardTitle>Asignar rol personalizado</CardTitle>
              <CardDescription>
                Asigna un rol personalizado al usuario para definir sus permisos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="p-4 text-center">
                  <p className="text-muted-foreground">Cargando roles disponibles...</p>
                </div>
              ) : customRoles.length > 0 ? (
                <div className="grid gap-4">
                  {customRoles.map((role) => (
                    <Card key={role.id} className="overflow-hidden">
                      <div className="p-4 border-b flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium">{role.name}</h3>
                          <p className="text-xs text-muted-foreground">{role.description}</p>
                        </div>
                        {customRoleId === role.id ? (
                          <Button variant="outline" size="sm" disabled>
                            Rol actual
                          </Button>
                        ) : (
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => handleAssignRole(role.id)}
                            disabled={assignRoleMutation.isPending}
                          >
                            Asignar
                          </Button>
                        )}
                      </div>
                      <div className="p-4 bg-muted">
                        <p className="text-xs text-muted-foreground mb-2">
                          Basado en: <span className="font-medium">{role.basedOnRole}</span>
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>No hay roles personalizados</AlertTitle>
                  <AlertDescription>
                    No se han creado roles personalizados. Ve a la pestaña de roles para crear uno.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserPermissionsTab;