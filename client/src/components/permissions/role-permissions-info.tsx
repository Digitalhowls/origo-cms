import React from 'react';
import { Resource, Action, PermissionSet } from '@shared/types';
import { Check, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RolePermissionsInfoProps {
  permissions: PermissionSet;
}

// Categorías de recursos para mostrar en grupos
const ResourceGroups = {
  'Contenido': [Resource.PAGE, Resource.BLOG, Resource.MEDIA, Resource.COURSE, Resource.CATEGORY, Resource.TAG],
  'Administración': [Resource.USER, Resource.ORGANIZATION, Resource.SETTING, Resource.API_KEY, Resource.ANALYTICS]
};

// Nombres legibles de cada recurso
const ResourceLabels: Record<Resource, string> = {
  [Resource.PAGE]: 'Páginas',
  [Resource.BLOG]: 'Blog',
  [Resource.MEDIA]: 'Media',
  [Resource.COURSE]: 'Cursos',
  [Resource.USER]: 'Usuarios',
  [Resource.ORGANIZATION]: 'Organización',
  [Resource.SETTING]: 'Ajustes',
  [Resource.ANALYTICS]: 'Análisis',
  [Resource.API_KEY]: 'API Keys',
  [Resource.CATEGORY]: 'Categorías',
  [Resource.TAG]: 'Etiquetas'
};

// Nombres legibles de cada acción
const ActionLabels: Record<Action, string> = {
  [Action.CREATE]: 'Crear',
  [Action.READ]: 'Ver',
  [Action.UPDATE]: 'Editar',
  [Action.DELETE]: 'Eliminar',
  [Action.PUBLISH]: 'Publicar',
  [Action.UNPUBLISH]: 'Despublicar',
  [Action.INVITE]: 'Invitar',
  [Action.MANAGE]: 'Gestionar',
  [Action.ADMIN]: 'Admin'
};

// Acciones más comunes para mostrar en la tabla
const CommonActions = [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE];

const RolePermissionsInfo: React.FC<RolePermissionsInfoProps> = ({ permissions }) => {
  // Verificar si hay algún permiso
  const hasAnyPermissions = Object.keys(permissions).length > 0;
  
  // Verificar si un permiso específico está habilitado
  const hasPermission = (resource: Resource, action: Action): boolean => {
    const permissionKey = `${resource}.${action}`;
    return !!permissions[permissionKey];
  };
  
  // Contar permisos por categoría
  const countPermissionsByGroup = () => {
    const counts: Record<string, number> = {};
    
    Object.entries(ResourceGroups).forEach(([group, resources]) => {
      let count = 0;
      resources.forEach(resource => {
        Object.values(Action).forEach(action => {
          if (hasPermission(resource, action)) {
            count++;
          }
        });
      });
      counts[group] = count;
    });
    
    return counts;
  };
  
  const permissionCounts = countPermissionsByGroup();
  
  return (
    <div className="space-y-4">
      {!hasAnyPermissions ? (
        <Alert variant="destructive">
          <AlertDescription>
            No hay permisos definidos para este rol. El usuario no podrá acceder a ninguna funcionalidad.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Resumen de permisos */}
          <div className="mb-6 flex gap-4">
            {Object.entries(permissionCounts).map(([group, count]) => (
              <div key={group} className="bg-muted p-3 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground">{group}</p>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">permisos</p>
              </div>
            ))}
          </div>
          
          {/* Tablas de permisos por grupo */}
          {Object.entries(ResourceGroups).map(([group, resources]) => (
            <div key={group} className="mb-6">
              <h4 className="text-sm font-medium mb-2">{group}</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Recurso</TableHead>
                    {CommonActions.map(action => (
                      <TableHead key={action} className="text-center">
                        {ActionLabels[action]}
                      </TableHead>
                    ))}
                    <TableHead className="text-center">Otros</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map(resource => (
                    <TableRow key={resource}>
                      <TableCell className="font-medium">
                        {ResourceLabels[resource]}
                      </TableCell>
                      
                      {/* Columnas para acciones comunes */}
                      {CommonActions.map(action => (
                        <TableCell key={action} className="text-center">
                          {hasPermission(resource, action) ? (
                            <Check className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-gray-300 mx-auto" />
                          )}
                        </TableCell>
                      ))}
                      
                      {/* Columna para otras acciones */}
                      <TableCell>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {Object.values(Action).filter(action => !CommonActions.includes(action)).map(action => (
                            hasPermission(resource, action) && (
                              <Badge key={action} variant="outline" className="text-xs">
                                {ActionLabels[action]}
                              </Badge>
                            )
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default RolePermissionsInfo;