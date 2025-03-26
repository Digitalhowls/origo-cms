import { RolePermissions, Resource, Action, type Permission, type UserRole } from "@shared/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

interface RolePermissionsInfoProps {
  role: UserRole;
}

// Función para convertir los valores de recurso y acción a texto legible
const resourceToString = (resource: string): string => {
  const resourceMap: Record<string, string> = {
    'page': 'Página',
    'blog': 'Blog',
    'media': 'Medios',
    'course': 'Curso',
    'user': 'Usuario',
    'organization': 'Organización',
    'setting': 'Configuración',
    'analytics': 'Analítica',
    'api_key': 'API Key',
    'category': 'Categoría',
    'tag': 'Etiqueta',
    '*': 'Todos los recursos'
  };
  return resourceMap[resource] || resource;
};

const actionToString = (action: string): string => {
  const actionMap: Record<string, string> = {
    'create': 'Crear',
    'read': 'Leer',
    'update': 'Actualizar',
    'delete': 'Eliminar',
    'publish': 'Publicar',
    'unpublish': 'Despublicar',
    'invite': 'Invitar',
    'manage': 'Gestionar',
    'admin': 'Administrar',
    '*': 'Todas las acciones'
  };
  return actionMap[action] || action;
};

// Función para obtener el color de badge según el recurso
const getResourceColor = (resource: string): string => {
  const resourceColorMap: Record<string, string> = {
    'page': 'bg-blue-100 text-blue-800',
    'blog': 'bg-purple-100 text-purple-800',
    'media': 'bg-amber-100 text-amber-800',
    'course': 'bg-emerald-100 text-emerald-800',
    'user': 'bg-red-100 text-red-800',
    'organization': 'bg-indigo-100 text-indigo-800',
    'setting': 'bg-gray-100 text-gray-800',
    'analytics': 'bg-cyan-100 text-cyan-800',
    'api_key': 'bg-lime-100 text-lime-800',
    'category': 'bg-orange-100 text-orange-800',
    'tag': 'bg-teal-100 text-teal-800',
    '*': 'bg-black text-white'
  };
  return resourceColorMap[resource] || 'bg-gray-100 text-gray-800';
};

export function RolePermissionsInfo({ role }: RolePermissionsInfoProps) {
  const permissions = RolePermissions[role];
  
  // Agrupar permisos por recurso
  const groupedPermissions: Record<string, { action: string; allowed: boolean }[]> = {};
  
  Object.entries(permissions).forEach(([key, allowed]) => {
    if (key === '*') {
      // Maneja el comodín global
      groupedPermissions['*'] = [{ action: '*', allowed }];
    } else {
      const [resource, action] = key.split('.');
      if (!groupedPermissions[resource]) {
        groupedPermissions[resource] = [];
      }
      groupedPermissions[resource].push({ action, allowed });
    }
  });

  // Obtener la descripción del rol
  const getRoleDescription = (role: UserRole): string => {
    const descriptions: Record<UserRole, string> = {
      'superadmin': 'Control total sobre todos los recursos y acciones del sistema. No puede ser restringido.',
      'admin': 'Acceso total a la gestión de la organización, con capacidad para administrar usuarios y configuraciones.',
      'editor': 'Puede crear, editar y publicar contenido, pero no tiene acceso a configuraciones de la organización.',
      'reader': 'Puede ver y editar contenido, pero no puede publicar ni eliminar.',
      'viewer': 'Solo puede ver contenido, sin capacidad de edición.'
    };
    return descriptions[role];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Permisos del rol: {role}</CardTitle>
        <CardDescription>{getRoleDescription(role)}</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {Object.entries(groupedPermissions).map(([resource, actions]) => (
            <AccordionItem key={resource} value={resource}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex gap-2 items-center">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getResourceColor(resource)}`}>
                    {resourceToString(resource)}
                  </span>
                  <span className="text-sm font-normal">
                    {resource === '*' 
                      ? 'Acceso completo a todos los recursos'
                      : `${actions.filter(a => a.allowed).length} permisos disponibles`}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {actions.map((action, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-2 rounded-md ${
                        action.allowed 
                          ? 'bg-green-50 border border-green-100' 
                          : 'bg-red-50 border border-red-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {action.allowed 
                          ? <CheckCircle2 className="h-4 w-4 text-green-600" /> 
                          : <XCircle className="h-4 w-4 text-red-600" />}
                        <span>{actionToString(action.action)}</span>
                      </div>
                      <Badge variant={action.allowed ? "default" : "destructive"} className="text-xs">
                        {action.allowed ? "Permitido" : "Denegado"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="mt-4 p-4 border rounded-md bg-amber-50 border-amber-200">
          <h4 className="font-medium text-amber-800">Nota sobre los permisos</h4>
          <p className="text-sm text-amber-700 mt-1">
            Los permisos personalizados tienen prioridad sobre los permisos del rol.
            Si se asigna explícitamente un permiso a un usuario, este anulará el permiso predeterminado del rol.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}