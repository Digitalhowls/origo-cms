import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check, Minus } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Resource, 
  Action, 
  RolePermissions, 
  PermissionSet, 
  SystemRole 
} from '@shared/types';

// Estructura de los grupos de permisos para la interfaz de usuario
interface PermissionGroup {
  resource: Resource;
  label: string;
  actions: {
    action: Action;
    label: string;
    description: string;
  }[];
}

// Mapeo de recursos a etiquetas legibles
const resourceLabels: Record<Resource, string> = {
  [Resource.PAGE]: 'Páginas',
  [Resource.BLOG]: 'Blog',
  [Resource.MEDIA]: 'Medios',
  [Resource.COURSE]: 'Cursos',
  [Resource.USER]: 'Usuarios',
  [Resource.ORGANIZATION]: 'Organización',
  [Resource.SETTING]: 'Configuración',
  [Resource.ANALYTICS]: 'Analíticas',
  [Resource.API_KEY]: 'Claves API',
  [Resource.CATEGORY]: 'Categorías',
  [Resource.TAG]: 'Etiquetas',
};

// Mapeo de acciones a etiquetas legibles
const actionLabels: Record<Action, string> = {
  [Action.CREATE]: 'Crear',
  [Action.READ]: 'Ver',
  [Action.UPDATE]: 'Editar',
  [Action.DELETE]: 'Eliminar',
  [Action.PUBLISH]: 'Publicar',
  [Action.UNPUBLISH]: 'Despublicar',
  [Action.INVITE]: 'Invitar',
  [Action.MANAGE]: 'Gestionar',
  [Action.ADMIN]: 'Administrar',
};

// Descripciones de acciones para diferentes recursos
const actionDescriptions: Record<string, string> = {
  'page.create': 'Crear nuevas páginas',
  'page.read': 'Ver páginas existentes',
  'page.update': 'Modificar páginas existentes',
  'page.delete': 'Eliminar páginas',
  'page.publish': 'Publicar páginas',
  'page.unpublish': 'Despublicar páginas',
  'blog.create': 'Crear nuevos artículos de blog',
  'blog.read': 'Ver artículos de blog',
  'blog.update': 'Modificar artículos de blog',
  'blog.delete': 'Eliminar artículos de blog',
  'blog.publish': 'Publicar artículos de blog',
  'blog.unpublish': 'Despublicar artículos de blog',
  'media.create': 'Subir nuevos archivos multimedia',
  'media.read': 'Ver archivos multimedia',
  'media.update': 'Modificar archivos multimedia',
  'media.delete': 'Eliminar archivos multimedia',
  'course.create': 'Crear nuevos cursos',
  'course.read': 'Ver cursos',
  'course.update': 'Modificar cursos',
  'course.delete': 'Eliminar cursos',
  'course.publish': 'Publicar cursos',
  'course.unpublish': 'Despublicar cursos',
  'user.create': 'Crear nuevos usuarios',
  'user.read': 'Ver usuarios',
  'user.update': 'Modificar usuarios',
  'user.delete': 'Eliminar usuarios',
  'user.invite': 'Invitar nuevos usuarios',
  'organization.read': 'Ver información de la organización',
  'organization.update': 'Modificar información de la organización',
  'organization.manage': 'Gestionar configuración de la organización',
  'organization.admin': 'Administrar todos los aspectos de la organización',
  'setting.read': 'Ver configuración',
  'setting.update': 'Modificar configuración',
  'setting.manage': 'Gestionar configuración avanzada',
  'analytics.read': 'Ver analíticas',
  'api_key.create': 'Crear nuevas claves API',
  'api_key.read': 'Ver claves API',
  'api_key.delete': 'Eliminar claves API',
  'category.create': 'Crear nuevas categorías',
  'category.read': 'Ver categorías',
  'category.update': 'Modificar categorías',
  'category.delete': 'Eliminar categorías',
  'tag.create': 'Crear nuevas etiquetas',
  'tag.read': 'Ver etiquetas',
  'tag.update': 'Modificar etiquetas',
  'tag.delete': 'Eliminar etiquetas',
};

// Definición de grupos de permisos para la interfaz
const permissionGroups: PermissionGroup[] = [
  {
    resource: Resource.PAGE,
    label: resourceLabels[Resource.PAGE],
    actions: [
      { action: Action.CREATE, label: actionLabels[Action.CREATE], description: actionDescriptions['page.create'] },
      { action: Action.READ, label: actionLabels[Action.READ], description: actionDescriptions['page.read'] },
      { action: Action.UPDATE, label: actionLabels[Action.UPDATE], description: actionDescriptions['page.update'] },
      { action: Action.DELETE, label: actionLabels[Action.DELETE], description: actionDescriptions['page.delete'] },
      { action: Action.PUBLISH, label: actionLabels[Action.PUBLISH], description: actionDescriptions['page.publish'] },
      { action: Action.UNPUBLISH, label: actionLabels[Action.UNPUBLISH], description: actionDescriptions['page.unpublish'] },
    ],
  },
  {
    resource: Resource.BLOG,
    label: resourceLabels[Resource.BLOG],
    actions: [
      { action: Action.CREATE, label: actionLabels[Action.CREATE], description: actionDescriptions['blog.create'] },
      { action: Action.READ, label: actionLabels[Action.READ], description: actionDescriptions['blog.read'] },
      { action: Action.UPDATE, label: actionLabels[Action.UPDATE], description: actionDescriptions['blog.update'] },
      { action: Action.DELETE, label: actionLabels[Action.DELETE], description: actionDescriptions['blog.delete'] },
      { action: Action.PUBLISH, label: actionLabels[Action.PUBLISH], description: actionDescriptions['blog.publish'] },
      { action: Action.UNPUBLISH, label: actionLabels[Action.UNPUBLISH], description: actionDescriptions['blog.unpublish'] },
    ],
  },
  {
    resource: Resource.MEDIA,
    label: resourceLabels[Resource.MEDIA],
    actions: [
      { action: Action.CREATE, label: actionLabels[Action.CREATE], description: actionDescriptions['media.create'] },
      { action: Action.READ, label: actionLabels[Action.READ], description: actionDescriptions['media.read'] },
      { action: Action.UPDATE, label: actionLabels[Action.UPDATE], description: actionDescriptions['media.update'] },
      { action: Action.DELETE, label: actionLabels[Action.DELETE], description: actionDescriptions['media.delete'] },
    ],
  },
  {
    resource: Resource.COURSE,
    label: resourceLabels[Resource.COURSE],
    actions: [
      { action: Action.CREATE, label: actionLabels[Action.CREATE], description: actionDescriptions['course.create'] },
      { action: Action.READ, label: actionLabels[Action.READ], description: actionDescriptions['course.read'] },
      { action: Action.UPDATE, label: actionLabels[Action.UPDATE], description: actionDescriptions['course.update'] },
      { action: Action.DELETE, label: actionLabels[Action.DELETE], description: actionDescriptions['course.delete'] },
      { action: Action.PUBLISH, label: actionLabels[Action.PUBLISH], description: actionDescriptions['course.publish'] },
      { action: Action.UNPUBLISH, label: actionLabels[Action.UNPUBLISH], description: actionDescriptions['course.unpublish'] },
    ],
  },
  {
    resource: Resource.USER,
    label: resourceLabels[Resource.USER],
    actions: [
      { action: Action.CREATE, label: actionLabels[Action.CREATE], description: actionDescriptions['user.create'] },
      { action: Action.READ, label: actionLabels[Action.READ], description: actionDescriptions['user.read'] },
      { action: Action.UPDATE, label: actionLabels[Action.UPDATE], description: actionDescriptions['user.update'] },
      { action: Action.DELETE, label: actionLabels[Action.DELETE], description: actionDescriptions['user.delete'] },
      { action: Action.INVITE, label: actionLabels[Action.INVITE], description: actionDescriptions['user.invite'] },
    ],
  },
  {
    resource: Resource.CATEGORY,
    label: resourceLabels[Resource.CATEGORY],
    actions: [
      { action: Action.CREATE, label: actionLabels[Action.CREATE], description: actionDescriptions['category.create'] },
      { action: Action.READ, label: actionLabels[Action.READ], description: actionDescriptions['category.read'] },
      { action: Action.UPDATE, label: actionLabels[Action.UPDATE], description: actionDescriptions['category.update'] },
      { action: Action.DELETE, label: actionLabels[Action.DELETE], description: actionDescriptions['category.delete'] },
    ],
  },
  {
    resource: Resource.TAG,
    label: resourceLabels[Resource.TAG],
    actions: [
      { action: Action.CREATE, label: actionLabels[Action.CREATE], description: actionDescriptions['tag.create'] },
      { action: Action.READ, label: actionLabels[Action.READ], description: actionDescriptions['tag.read'] },
      { action: Action.UPDATE, label: actionLabels[Action.UPDATE], description: actionDescriptions['tag.update'] },
      { action: Action.DELETE, label: actionLabels[Action.DELETE], description: actionDescriptions['tag.delete'] },
    ],
  },
  {
    resource: Resource.ORGANIZATION,
    label: resourceLabels[Resource.ORGANIZATION],
    actions: [
      { action: Action.READ, label: actionLabels[Action.READ], description: actionDescriptions['organization.read'] },
      { action: Action.UPDATE, label: actionLabels[Action.UPDATE], description: actionDescriptions['organization.update'] },
      { action: Action.MANAGE, label: actionLabels[Action.MANAGE], description: actionDescriptions['organization.manage'] },
      { action: Action.ADMIN, label: actionLabels[Action.ADMIN], description: actionDescriptions['organization.admin'] },
    ],
  },
  {
    resource: Resource.SETTING,
    label: resourceLabels[Resource.SETTING],
    actions: [
      { action: Action.READ, label: actionLabels[Action.READ], description: actionDescriptions['setting.read'] },
      { action: Action.UPDATE, label: actionLabels[Action.UPDATE], description: actionDescriptions['setting.update'] },
      { action: Action.MANAGE, label: actionLabels[Action.MANAGE], description: actionDescriptions['setting.manage'] },
    ],
  },
  {
    resource: Resource.ANALYTICS,
    label: resourceLabels[Resource.ANALYTICS],
    actions: [
      { action: Action.READ, label: actionLabels[Action.READ], description: actionDescriptions['analytics.read'] },
    ],
  },
  {
    resource: Resource.API_KEY,
    label: resourceLabels[Resource.API_KEY],
    actions: [
      { action: Action.CREATE, label: actionLabels[Action.CREATE], description: actionDescriptions['api_key.create'] },
      { action: Action.READ, label: actionLabels[Action.READ], description: actionDescriptions['api_key.read'] },
      { action: Action.DELETE, label: actionLabels[Action.DELETE], description: actionDescriptions['api_key.delete'] },
    ],
  },
];

interface PermissionEditorProps {
  permissions: PermissionSet;
  onChange: (permissions: PermissionSet) => void;
  baseRole?: SystemRole;
  readOnly?: boolean;
}

const PermissionEditor: React.FC<PermissionEditorProps> = ({
  permissions,
  onChange,
  baseRole,
  readOnly = false,
}) => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Obtener los permisos base del rol del sistema si se especifica
  const basePermissions = baseRole ? RolePermissions[baseRole] : {};
  
  // Función para verificar el estado de un permiso
  const getPermissionState = (resource: Resource, action: Action): boolean | null => {
    const permissionKey = `${resource}.${action}`;
    
    // Si el permiso está definido en los permisos personalizados
    if (permissionKey in permissions) {
      return permissions[permissionKey];
    }
    
    // Si el permiso está definido en los permisos base del rol
    if (baseRole && permissionKey in basePermissions) {
      return basePermissions[permissionKey];
    }
    
    return false; // Por defecto, sin permiso
  };

  // Función para cambiar el estado de un permiso
  const togglePermission = (resource: Resource, action: Action) => {
    if (readOnly) return;
    
    const permissionKey = `${resource}.${action}`;
    const currentValue = getPermissionState(resource, action);
    
    onChange({
      ...permissions,
      [permissionKey]: !currentValue,
    });
  };

  // Función para alternar todos los permisos de un recurso
  const toggleResourcePermissions = (resource: Resource, value: boolean) => {
    if (readOnly) return;
    
    const newPermissions = { ...permissions };
    const group = permissionGroups.find((g) => g.resource === resource);
    
    if (group) {
      group.actions.forEach(({ action }) => {
        const permissionKey = `${resource}.${action}`;
        newPermissions[permissionKey] = value;
      });
    }
    
    onChange(newPermissions);
  };

  // Determinar si un grupo tiene todos, algunos o ningún permiso activo
  const getGroupState = (resource: Resource): 'all' | 'some' | 'none' => {
    const group = permissionGroups.find((g) => g.resource === resource);
    if (!group) return 'none';
    
    let activeCount = 0;
    const totalCount = group.actions.length;
    
    group.actions.forEach(({ action }) => {
      if (getPermissionState(resource, action)) {
        activeCount++;
      }
    });
    
    if (activeCount === 0) return 'none';
    if (activeCount === totalCount) return 'all';
    return 'some';
  };

  return (
    <Card className="border rounded-lg">
      <CardContent className="pt-6">
        {permissionGroups.map((group) => {
          const isOpen = openGroups[group.resource] ?? false;
          const groupState = getGroupState(group.resource);
          
          return (
            <Collapsible
              key={group.resource}
              open={isOpen}
              onOpenChange={(open) =>
                setOpenGroups((prev) => ({ ...prev, [group.resource]: open }))
              }
              className="mb-4"
            >
              <div className="flex items-center justify-between p-2 border rounded-md hover:bg-accent/20">
                <div className="flex items-center gap-2">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-5 w-5">
                      {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </Button>
                  </CollapsibleTrigger>
                  <span className="font-medium">{group.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {groupState === 'some' && (
                    <Minus className="h-4 w-4 text-orange-500" />
                  )}
                  {groupState === 'all' && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  <Switch
                    checked={groupState !== 'none'}
                    onCheckedChange={(checked) => toggleResourcePermissions(group.resource, checked)}
                    disabled={readOnly}
                  />
                </div>
              </div>
              <CollapsibleContent>
                <div className="pl-6 pr-2 mt-2 space-y-2">
                  {group.actions.map(({ action, label, description }) => {
                    const isActive = getPermissionState(group.resource, action);
                    
                    return (
                      <div
                        key={`${group.resource}.${action}`}
                        className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-accent/10"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{label}</span>
                          <span className="text-xs text-muted-foreground">
                            {description}
                          </span>
                        </div>
                        <Switch
                          checked={!!isActive}
                          onCheckedChange={() => togglePermission(group.resource, action)}
                          disabled={readOnly}
                        />
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default PermissionEditor;