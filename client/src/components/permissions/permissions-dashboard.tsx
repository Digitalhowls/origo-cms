import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Shield, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { 
  Resource, 
  Action, 
  ResourceGroups, 
  resourceLabels, 
  actionLabels, 
  SystemRole,
  RolePermissions,
  PermissionSet
} from '@shared/types';

const PermissionsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('system-roles');
  
  const { data: customRoles, isLoading } = useQuery({
    queryKey: ['/api/roles/custom'],
    queryFn: async () => {
      const response = await fetch('/api/roles/custom');
      if (!response.ok) {
        throw new Error('Error al obtener roles personalizados');
      }
      return response.json();
    }
  });

  // Función para determinar si un permiso está asignado
  const hasPermission = (permissions: PermissionSet, resource: Resource, action: Action) => {
    const key = `${resource}.${action}`;
    return !!permissions[key];
  };

  // Crear mapa de permisos para roles predefinidos del sistema
  const systemRolesMap = {
    superadmin: { name: 'Super Admin', description: 'Acceso completo a todas las funciones', permissions: RolePermissions.superadmin },
    admin: { name: 'Administrador', description: 'Administración general del sistema', permissions: RolePermissions.admin },
    editor: { name: 'Editor', description: 'Creación y edición de contenido', permissions: RolePermissions.editor },
    contributor: { name: 'Colaborador', description: 'Contribución limitada de contenido', permissions: RolePermissions.contributor },
    viewer: { name: 'Visualizador', description: 'Solo lectura de contenido', permissions: RolePermissions.viewer },
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Panel de Roles y Permisos
          </CardTitle>
          <CardDescription>
            Visión general de todos los roles del sistema y sus permisos asignados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="system-roles">Roles Predefinidos</TabsTrigger>
              <TabsTrigger value="custom-roles">Roles Personalizados</TabsTrigger>
              <TabsTrigger value="permissions-matrix">Matriz de Permisos</TabsTrigger>
            </TabsList>
            
            {/* Roles Predefinidos */}
            <TabsContent value="system-roles">
              <div className="space-y-6">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Rol</TableHead>
                        <TableHead className="w-[300px]">Descripción</TableHead>
                        <TableHead>Nivel de Acceso</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(systemRolesMap).map(([roleKey, role]) => (
                        <TableRow key={roleKey}>
                          <TableCell className="font-medium">
                            {role.name}
                          </TableCell>
                          <TableCell>
                            {role.description}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {roleKey === 'superadmin' ? (
                                <Badge className="bg-purple-100 text-purple-800">Acceso Total</Badge>
                              ) : roleKey === 'admin' ? (
                                <Badge className="bg-red-100 text-red-800">Administración</Badge>
                              ) : roleKey === 'editor' ? (
                                <Badge className="bg-blue-100 text-blue-800">Edición</Badge>
                              ) : roleKey === 'contributor' ? (
                                <Badge className="bg-green-100 text-green-800">Contribución</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800">Solo Lectura</Badge>
                              )}
                              
                              {Object.keys(ResourceGroups).map((group) => {
                                const resources = ResourceGroups[group as keyof typeof ResourceGroups];
                                let hasAnyPermission = false;
                                
                                resources.forEach(resource => {
                                  Object.values(Action).forEach(action => {
                                    if (hasPermission(role.permissions, resource, action)) {
                                      hasAnyPermission = true;
                                    }
                                  });
                                });
                                
                                return hasAnyPermission ? (
                                  <Badge key={group} variant="outline">
                                    {group}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Sobre los roles predefinidos</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Los roles predefinidos son configuraciones estándar que cubren la mayoría de los casos de uso. Si necesitas permisos personalizados, puedes crear roles personalizados basados en estos predefinidos y modificar sus permisos específicos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Roles Personalizados */}
            <TabsContent value="custom-roles">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !customRoles || customRoles.length === 0 ? (
                <div className="bg-muted p-6 rounded-md text-center">
                  <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
                  <h3 className="text-lg font-medium">No hay roles personalizados</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    No se han creado roles personalizados todavía. Puedes crear uno basado en los roles predefinidos.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Nombre</TableHead>
                          <TableHead className="w-[200px]">Basado en</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead className="w-[120px]">Por defecto</TableHead>
                          <TableHead className="w-[150px]">Permisos</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customRoles.map((role: any) => (
                          <TableRow key={role.id}>
                            <TableCell className="font-medium">
                              {role.name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {role.basedOnRole.charAt(0).toUpperCase() + role.basedOnRole.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {role.description || 'Sin descripción'}
                            </TableCell>
                            <TableCell>
                              {role.isDefault ? (
                                <Badge className="bg-green-100 text-green-800">
                                  Por defecto
                                </Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground">No</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {Object.keys(role.permissions).filter(key => 
                                role.permissions[key] === true
                              ).length} permisos
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </TabsContent>
            
            {/* Matriz de Permisos */}
            <TabsContent value="permissions-matrix">
              <div className="space-y-6">
                <div className="bg-muted p-4 rounded-md mb-6">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Matriz de Permisos</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Esta matriz muestra todos los permisos disponibles y qué roles tienen cada permiso. Usa esta información para entender mejor cómo están configurados los roles en tu sistema.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px] font-bold sticky left-0 bg-background z-10">Permiso</TableHead>
                        <TableHead className="text-center w-[100px]">Super Admin</TableHead>
                        <TableHead className="text-center w-[100px]">Admin</TableHead>
                        <TableHead className="text-center w-[100px]">Editor</TableHead>
                        <TableHead className="text-center w-[100px]">Colaborador</TableHead>
                        <TableHead className="text-center w-[100px]">Visualizador</TableHead>
                        {!isLoading && customRoles && customRoles.map((role: any) => (
                          <TableHead key={role.id} className="text-center w-[120px]">
                            {role.name}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(ResourceGroups).map(([groupName, resources]) => (
                        <React.Fragment key={groupName}>
                          <TableRow className="bg-muted/50">
                            <TableCell colSpan={5 + (!isLoading ? customRoles?.length || 0 : 0)} className="font-bold sticky left-0 bg-muted/50">
                              {groupName}
                            </TableCell>
                          </TableRow>
                          {resources.map(resource => 
                            Object.values(Action).map(action => (
                              <TableRow key={`${resource}-${action}`}>
                                <TableCell className="sticky left-0 bg-background z-10">
                                  <div className="flex flex-col">
                                    <span className="font-medium">{resourceLabels[resource]}</span>
                                    <span className="text-xs text-muted-foreground">{actionLabels[`${resource}.${action}`] || action}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  {hasPermission(systemRolesMap.superadmin.permissions, resource, action) ? (
                                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {hasPermission(systemRolesMap.admin.permissions, resource, action) ? (
                                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {hasPermission(systemRolesMap.editor.permissions, resource, action) ? (
                                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {hasPermission(systemRolesMap.contributor.permissions, resource, action) ? (
                                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {hasPermission(systemRolesMap.viewer.permissions, resource, action) ? (
                                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                                  )}
                                </TableCell>
                                {!isLoading && customRoles && customRoles.map((role: any) => (
                                  <TableCell key={role.id} className="text-center">
                                    {hasPermission(role.permissions, resource, action) ? (
                                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                    ) : (
                                      <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                                    )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsDashboard;