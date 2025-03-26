import { useState } from "react";
import { Action, Resource, RolePermissions, SystemRole } from "@shared/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { SearchIcon, InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Definir nombres legibles para los recursos
const resourceLabels: Record<Resource, string> = {
  [Resource.PAGE]: "Páginas",
  [Resource.BLOG]: "Blog",
  [Resource.MEDIA]: "Media",
  [Resource.COURSE]: "Cursos",
  [Resource.USER]: "Usuarios",
  [Resource.ORGANIZATION]: "Organización",
  [Resource.SETTING]: "Configuración",
  [Resource.ANALYTICS]: "Analíticas",
  [Resource.API_KEY]: "Claves API",
  [Resource.CATEGORY]: "Categorías",
  [Resource.TAG]: "Etiquetas"
};

// Definir nombres legibles para las acciones
const actionLabels: Record<Action, string> = {
  [Action.CREATE]: "Crear",
  [Action.READ]: "Leer",
  [Action.UPDATE]: "Actualizar",
  [Action.DELETE]: "Eliminar",
  [Action.PUBLISH]: "Publicar",
  [Action.UNPUBLISH]: "Despublicar",
  [Action.INVITE]: "Invitar",
  [Action.MANAGE]: "Gestionar",
  [Action.ADMIN]: "Administrar"
};

// Descripciones para cada recurso
const resourceDescriptions: Record<Resource, string> = {
  [Resource.PAGE]: "Control sobre la creación y gestión de páginas.",
  [Resource.BLOG]: "Control sobre la creación y gestión de entradas del blog.",
  [Resource.MEDIA]: "Control sobre la biblioteca de medios y archivos.",
  [Resource.COURSE]: "Control sobre la creación y gestión de cursos.",
  [Resource.USER]: "Control sobre la gestión de usuarios y accesos.",
  [Resource.ORGANIZATION]: "Control sobre la configuración de la organización.",
  [Resource.SETTING]: "Control sobre ajustes y configuraciones del sistema.",
  [Resource.ANALYTICS]: "Control sobre acceso a datos de análisis y métricas.",
  [Resource.API_KEY]: "Control sobre claves API y accesos programáticos.",
  [Resource.CATEGORY]: "Control sobre la gestión de categorías.",
  [Resource.TAG]: "Control sobre la gestión de etiquetas."
};

// Descripciones para las acciones en cada recurso
const actionDescriptions: Record<string, string> = {
  "page.create": "Permite crear nuevas páginas.",
  "page.read": "Permite ver el contenido de las páginas.",
  "page.update": "Permite editar páginas existentes.",
  "page.delete": "Permite eliminar páginas.",
  "page.publish": "Permite publicar páginas.",
  "page.unpublish": "Permite despublicar páginas.",
  
  "blog.create": "Permite crear nuevas entradas del blog.",
  "blog.read": "Permite ver el contenido de las entradas del blog.",
  "blog.update": "Permite editar entradas del blog existentes.",
  "blog.delete": "Permite eliminar entradas del blog.",
  "blog.publish": "Permite publicar entradas del blog.",
  "blog.unpublish": "Permite despublicar entradas del blog.",
  
  "media.create": "Permite subir archivos multimedia.",
  "media.read": "Permite ver la biblioteca de medios.",
  "media.update": "Permite actualizar información de archivos multimedia.",
  "media.delete": "Permite eliminar archivos multimedia.",
  
  "course.create": "Permite crear nuevos cursos.",
  "course.read": "Permite ver el contenido de los cursos.",
  "course.update": "Permite editar cursos existentes.",
  "course.delete": "Permite eliminar cursos.",
  "course.publish": "Permite publicar cursos.",
  "course.unpublish": "Permite despublicar cursos.",
  
  "user.create": "Permite crear nuevos usuarios.",
  "user.read": "Permite ver información de usuarios.",
  "user.update": "Permite editar información de usuarios.",
  "user.delete": "Permite eliminar usuarios.",
  "user.invite": "Permite enviar invitaciones a nuevos usuarios.",
  
  "organization.read": "Permite ver información de la organización.",
  "organization.update": "Permite actualizar detalles de la organización.",
  "organization.manage": "Permite gestionar configuraciones avanzadas de la organización.",
  
  "setting.read": "Permite ver configuraciones del sistema.",
  "setting.update": "Permite modificar configuraciones del sistema.",
  
  "analytics.read": "Permite acceder a informes y analíticas.",
  
  "api_key.create": "Permite crear nuevas claves API.",
  "api_key.read": "Permite ver claves API existentes.",
  "api_key.delete": "Permite eliminar claves API.",
  
  "category.create": "Permite crear nuevas categorías.",
  "category.read": "Permite ver categorías existentes.",
  "category.update": "Permite actualizar categorías.",
  "category.delete": "Permite eliminar categorías.",
  
  "tag.create": "Permite crear nuevas etiquetas.",
  "tag.read": "Permite ver etiquetas existentes.",
  "tag.update": "Permite actualizar etiquetas.",
  "tag.delete": "Permite eliminar etiquetas.",
};

interface PermissionsListProps {
  permissions: Record<string, boolean>;
  onChange: (key: string, value: boolean) => void;
  baseRole?: SystemRole;
}

export function PermissionsList({ permissions, onChange, baseRole = "editor" }: PermissionsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const basePermissions = baseRole ? RolePermissions[baseRole] : {};

  // Filtrar recursos por el término de búsqueda
  const filteredResources = Object.values(Resource).filter(resource => 
    resourceLabels[resource].toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Comprobar si un permiso está activado (en permisos personalizados o heredado del rol base)
  const isPermissionEnabled = (key: string): boolean => {
    // Si el permiso está definido explícitamente en los permisos personalizados, usar ese valor
    if (key in permissions) {
      return permissions[key];
    }
    
    // Si no está definido, heredar del rol base si existe
    if (basePermissions && key in basePermissions) {
      return basePermissions[key];
    }
    
    // Por defecto, permiso denegado
    return false;
  };

  // Comprobar si un permiso está heredado del rol base
  const isPermissionInherited = (key: string): boolean => {
    return !(key in permissions) && basePermissions && key in basePermissions;
  };

  // Lista de acciones aplicables para cada recurso
  const getActionsForResource = (resource: Resource): Action[] => {
    switch (resource) {
      case Resource.PAGE:
      case Resource.BLOG:
      case Resource.COURSE:
        return [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.PUBLISH, Action.UNPUBLISH];
      case Resource.MEDIA:
      case Resource.CATEGORY:
      case Resource.TAG:
      case Resource.API_KEY:
        return [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE];
      case Resource.USER:
        return [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.INVITE];
      case Resource.ORGANIZATION:
        return [Action.READ, Action.UPDATE, Action.MANAGE];
      case Resource.SETTING:
        return [Action.READ, Action.UPDATE];
      case Resource.ANALYTICS:
        return [Action.READ];
      default:
        return [Action.READ];
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar permisos..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Accordion type="multiple" defaultValue={[Resource.PAGE, Resource.BLOG]}>
        {filteredResources.map((resource) => (
          <AccordionItem key={resource} value={resource}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center">
                <span>{resourceLabels[resource]}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="ml-2 h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{resourceDescriptions[resource]}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-2 pt-2">
                {getActionsForResource(resource).map((action) => {
                  const permissionKey = `${resource}.${action}`;
                  const isEnabled = isPermissionEnabled(permissionKey);
                  const isInherited = isPermissionInherited(permissionKey);
                  
                  return (
                    <div key={permissionKey} className="flex items-center space-x-2">
                      <Checkbox
                        id={permissionKey}
                        checked={isEnabled}
                        onCheckedChange={(checked) => onChange(permissionKey, !!checked)}
                      />
                      <label
                        htmlFor={permissionKey}
                        className="flex flex-1 items-center justify-between text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <div className="flex items-center gap-2">
                          <span>{actionLabels[action]}</span>
                          {isInherited && (
                            <span className="text-xs text-muted-foreground italic">
                              (heredado de {baseRole})
                            </span>
                          )}
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{actionDescriptions[permissionKey] || `Permite ${actionLabels[action].toLowerCase()} ${resourceLabels[resource].toLowerCase()}.`}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </label>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}