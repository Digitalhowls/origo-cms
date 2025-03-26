import React, { useState, useEffect } from 'react';
import { Resource, Action, PermissionSet, RolePermissions, SystemRole } from '@shared/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Image, BookOpen, Users, Building, Settings, PieChart, Key, Tag, Hash, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PermissionEditorProps {
  permissions: PermissionSet;
  onChange: (permissions: PermissionSet) => void;
  baseRole?: SystemRole;
}

// Iconos para cada recurso
const ResourceIcons: Record<Resource, React.ReactNode> = {
  [Resource.PAGE]: <FileText className="h-4 w-4 text-blue-500" />,
  [Resource.BLOG]: <FileText className="h-4 w-4 text-green-500" />,
  [Resource.MEDIA]: <Image className="h-4 w-4 text-purple-500" />,
  [Resource.COURSE]: <BookOpen className="h-4 w-4 text-amber-500" />,
  [Resource.USER]: <Users className="h-4 w-4 text-cyan-500" />,
  [Resource.ORGANIZATION]: <Building className="h-4 w-4 text-slate-500" />,
  [Resource.SETTING]: <Settings className="h-4 w-4 text-zinc-500" />,
  [Resource.ANALYTICS]: <PieChart className="h-4 w-4 text-orange-500" />,
  [Resource.API_KEY]: <Key className="h-4 w-4 text-rose-500" />,
  [Resource.CATEGORY]: <Tag className="h-4 w-4 text-emerald-500" />,
  [Resource.TAG]: <Hash className="h-4 w-4 text-indigo-500" />
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

// Agrupar recursos por categorías
const ResourceGroups = {
  'Contenido': [Resource.PAGE, Resource.BLOG, Resource.COURSE, Resource.CATEGORY, Resource.TAG, Resource.MEDIA],
  'Administración': [Resource.USER, Resource.ORGANIZATION, Resource.SETTING, Resource.API_KEY, Resource.ANALYTICS]
};

// Configuración de acciones disponibles para cada recurso
const ResourceActions: Record<Resource, Action[]> = {
  [Resource.PAGE]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.PUBLISH, Action.UNPUBLISH],
  [Resource.BLOG]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.PUBLISH, Action.UNPUBLISH],
  [Resource.MEDIA]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE],
  [Resource.COURSE]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.PUBLISH, Action.UNPUBLISH],
  [Resource.USER]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.INVITE],
  [Resource.ORGANIZATION]: [Action.READ, Action.UPDATE, Action.MANAGE],
  [Resource.SETTING]: [Action.READ, Action.UPDATE],
  [Resource.ANALYTICS]: [Action.READ],
  [Resource.API_KEY]: [Action.CREATE, Action.READ, Action.DELETE],
  [Resource.CATEGORY]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE],
  [Resource.TAG]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]
};

// Descripciones de acciones
const ActionDescriptions: Record<Action, string> = {
  [Action.CREATE]: 'Crear nuevos elementos',
  [Action.READ]: 'Ver elementos existentes',
  [Action.UPDATE]: 'Modificar elementos existentes',
  [Action.DELETE]: 'Eliminar elementos',
  [Action.PUBLISH]: 'Publicar elementos',
  [Action.UNPUBLISH]: 'Despublicar elementos',
  [Action.INVITE]: 'Invitar nuevos usuarios',
  [Action.MANAGE]: 'Gestionar configuraciones avanzadas',
  [Action.ADMIN]: 'Acceso total de administrador',
};

// Etiquetas de acción para mostrar
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

const PermissionEditor: React.FC<PermissionEditorProps> = ({ 
  permissions, 
  onChange,
  baseRole = 'viewer'
}) => {
  const [activeTab, setActiveTab] = useState<string>('Contenido');
  const [localPermissions, setLocalPermissions] = useState<PermissionSet>(permissions);
  const [baseRolePermissions, setBaseRolePermissions] = useState<PermissionSet>(
    RolePermissions[baseRole] || {}
  );
  
  // Actualizar permisos locales cuando cambien las props
  useEffect(() => {
    setLocalPermissions(permissions);
  }, [permissions]);
  
  // Actualizar permisos del rol base cuando cambie
  useEffect(() => {
    setBaseRolePermissions(RolePermissions[baseRole] || {});
  }, [baseRole]);

  // Manejar cambio de un permiso individual
  const handlePermissionChange = (resource: Resource, action: Action, checked: boolean) => {
    const permissionKey = `${resource}.${action}`;
    const newPermissions = { 
      ...localPermissions,
      [permissionKey]: checked
    };
    
    setLocalPermissions(newPermissions);
    onChange(newPermissions);
  };
  
  // Función para verificar si un permiso está activado
  const hasPermission = (resource: Resource, action: Action): boolean => {
    const permissionKey = `${resource}.${action}`;
    return !!localPermissions[permissionKey];
  };
  
  // Función para verificar si un permiso está en el rol base
  const isInBaseRole = (resource: Resource, action: Action): boolean => {
    const permissionKey = `${resource}.${action}`;
    return !!baseRolePermissions[permissionKey];
  };
  
  // Función para restablecer los permisos al rol base
  const resetToBaseRole = () => {
    setLocalPermissions({...baseRolePermissions});
    onChange({...baseRolePermissions});
  };
  
  // Función para obtener el color de fondo del checkbox según su estado
  const getCheckboxStyle = (resource: Resource, action: Action) => {
    const isChecked = hasPermission(resource, action);
    const isBasePermission = isInBaseRole(resource, action);
    
    if (isChecked && !isBasePermission) {
      return 'border-green-500 data-[state=checked]:bg-green-500';
    } else if (!isChecked && isBasePermission) {
      return 'border-red-500';
    }
    
    return '';
  };

  return (
    <div>
      {/* Pestañas para agrupar recursos */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4 grid grid-cols-2">
          {Object.keys(ResourceGroups).map((group) => (
            <TabsTrigger key={group} value={group}>
              {group}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* Contenido de cada pestaña */}
        {Object.entries(ResourceGroups).map(([group, resources]) => (
          <TabsContent key={group} value={group} className="mt-0">
            <div className="grid gap-4">
              {resources.map((resource) => (
                <Card key={resource}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {ResourceIcons[resource]}
                      {ResourceLabels[resource]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {ResourceActions[resource].map((action) => (
                        <div key={`${resource}-${action}`} className="flex items-start space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${resource}-${action}`}
                                    checked={hasPermission(resource, action)}
                                    onCheckedChange={(checked) => 
                                      handlePermissionChange(resource, action, !!checked)
                                    }
                                    className={getCheckboxStyle(resource, action)}
                                  />
                                  <Label
                                    htmlFor={`${resource}-${action}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {ActionLabels[action]}
                                  </Label>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs">
                                <p>{ActionDescriptions[action]}</p>
                                {isInBaseRole(resource, action) && (
                                  <Badge variant="outline" className="mt-1 text-xs bg-blue-50">
                                    Incluido en rol {baseRole}
                                  </Badge>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Sección para restablecer permisos */}
      <div className="flex justify-between items-center mt-4 p-3 bg-muted rounded-md">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Los permisos en <span className="font-medium">verde</span> son adicionales al rol base.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetToBaseRole}>
          Restablecer a rol base
        </Button>
      </div>
    </div>
  );
};

export default PermissionEditor;