import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPermissionsManager } from './user-permissions-manager';
import { usePermissions } from '@/hooks/use-permissions';
import { UserRole, Resource, Action, RolePermissions } from '@shared/types';
import { Loader2, Lock, AlertTriangle, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

interface UserPermissionsTabProps {
  userId: number;
  userName: string;
  userRole: UserRole;
}

export function UserPermissionsTab({ userId, userName, userRole }: UserPermissionsTabProps) {
  const { 
    permissionsData, 
    permissionsLoading, 
    rolePermissions,
    addPermission,
    updatePermission,
    deletePermission
  } = usePermissions(userId);

  const [activeTab, setActiveTab] = useState<'role' | 'custom'>('role');
  
  // Función de utilidad para convertir los datos de permisos a un formato más manejable
  const processPermissions = () => {
    const permissions: Record<string, Record<string, { has: boolean, custom: boolean }>> = {};
    
    // Inicializa los permisos según el rol
    Object.entries(rolePermissions).forEach(([key, hasPermission]) => {
      const [resource, action] = key.split('.');
      
      if (!permissions[resource]) {
        permissions[resource] = {};
      }
      
      permissions[resource][action] = {
        has: hasPermission,
        custom: false
      };
    });
    
    // Sobreescribe con permisos personalizados si existen
    if (permissionsData) {
      permissionsData.forEach((permission) => {
        const resource = permission.resource;
        const action = permission.action;
        
        if (!permissions[resource]) {
          permissions[resource] = {};
        }
        
        permissions[resource][action] = {
          has: permission.allowed,
          custom: true,
          id: permission.id
        };
      });
    }
    
    return permissions;
  };
  
  const permissions = processPermissions();
  
  const handlePermissionChange = async (resource: string, action: string, allowed: boolean) => {
    const permissionKey = `${resource}.${action}`;
    const existingPermission = permissionsData?.find(
      (p) => p.resource === resource && p.action === action
    );
    
    // Verifica si este permiso ya está presente en los permisos base del rol
    const isBaseRolePermission = rolePermissions[permissionKey] !== undefined;
    
    if (existingPermission) {
      // Si ya existe un permiso personalizado, actualízalo
      if (
        // Si está estableciendo el permiso al mismo valor que el permiso base del rol,
        // entonces podemos eliminar el permiso personalizado
        (isBaseRolePermission && allowed === rolePermissions[permissionKey])
      ) {
        await deletePermission(existingPermission.id);
      } else {
        // De lo contrario, actualiza el permiso personalizado
        await updatePermission(existingPermission.id, {
          allowed
        });
      }
    } else {
      // Si el permiso no existe y es diferente del permiso base, crea uno nuevo
      if (!isBaseRolePermission || allowed !== rolePermissions[permissionKey]) {
        await addPermission({
          userId,
          resource,
          action,
          allowed
        });
      }
    }
  };
  
  // Renderiza los recursos y sus acciones como checkboxes
  const renderResourceActions = (resource: string, actions: Record<string, { has: boolean, custom: boolean, id?: number }>) => {
    return (
      <div key={resource} className="mb-6">
        <h3 className="text-lg font-medium mb-2 capitalize flex items-center">
          {resource}
          {activeTab === 'custom' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={() => {
                // Restablece todos los permisos personalizados para este recurso
                Object.entries(actions).forEach(([action, data]) => {
                  if (data.custom) {
                    const permissionKey = `${resource}.${action}`;
                    const baseValue = rolePermissions[permissionKey] || false;
                    handlePermissionChange(resource, action, baseValue);
                  }
                });
              }}
            >
              Restablecer
            </Button>
          )}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {Object.entries(actions).map(([action, data]) => {
            // En la pestaña de rol, solo mostramos los permisos que vienen con el rol
            // En la pestaña personalizada, mostramos todos los permisos
            if (activeTab === 'role' && !rolePermissions[`${resource}.${action}`] && !data.custom) {
              return null;
            }
            
            const isCustomized = data.custom;
            const isInherited = !isCustomized && data.has;
            
            return (
              <div key={`${resource}.${action}`} className="flex items-center space-x-2">
                <Checkbox 
                  id={`${resource}-${action}`}
                  checked={data.has}
                  disabled={activeTab === 'role'}
                  onCheckedChange={(checked) => {
                    if (activeTab === 'custom') {
                      handlePermissionChange(resource, action, Boolean(checked));
                    }
                  }}
                />
                <label
                  htmlFor={`${resource}-${action}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  <span className="capitalize">{action}</span>
                  {isCustomized && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Personalizado
                    </Badge>
                  )}
                  {isInherited && (
                    <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
                      Del rol
                    </Badge>
                  )}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando permisos...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Permisos de {userName}</h2>
      </div>
      
      <div className="flex items-center gap-2 p-4 rounded-md bg-blue-50 border border-blue-200">
        <ShieldCheck className="h-5 w-5 text-blue-600" />
        <div>
          <p className="text-blue-800 font-medium">Rol actual: {userRole}</p>
          <p className="text-sm text-blue-700">
            Los permisos mostrados incluyen los heredados del rol y cualquier permiso personalizado.
          </p>
        </div>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as 'role' | 'custom')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="role">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Permisos del rol
          </TabsTrigger>
          <TabsTrigger value="custom">
            <ShieldAlert className="h-4 w-4 mr-2" />
            Permisos personalizados
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="role" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Permisos heredados del rol {userRole}</CardTitle>
              <CardDescription>
                Estos permisos vienen predefinidos con el rol y no se pueden modificar directamente.
                Para modificarlos, usa la pestaña de permisos personalizados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.entries(permissions).map(([resource, actions]) => 
                renderResourceActions(resource, actions)
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="custom" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Permisos personalizados</CardTitle>
              <CardDescription>
                Aquí puedes personalizar los permisos para este usuario,
                sobreescribiendo los permisos predeterminados de su rol.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 mb-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Importante</p>
                  <p className="text-sm text-amber-700">
                    Al personalizar los permisos, estás sobreescribiendo los permisos base del rol.
                    Si cambias el rol del usuario, los permisos personalizados se mantendrán.
                  </p>
                </div>
              </div>
              
              {Object.entries(permissions).map(([resource, actions]) => 
                renderResourceActions(resource, actions)
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <UserPermissionsManager userId={userId} />
    </div>
  );
}