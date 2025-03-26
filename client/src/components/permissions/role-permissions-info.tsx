import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  PermissionSet, 
  Resource, 
  Action, 
  RolePermissions, 
  SystemRole, 
  isSystemRole 
} from '@shared/types';

interface RolePermissionsInfoProps {
  role: string;
  permissions?: PermissionSet;
  condensed?: boolean;
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

// Mapeo de roles del sistema a nombres legibles
const roleLabels: Record<SystemRole, string> = {
  superadmin: 'Super Administrador',
  admin: 'Administrador',
  editor: 'Editor',
  reader: 'Lector',
  viewer: 'Visitante',
};

// Descripción breve de los roles del sistema
const roleDescriptions: Record<SystemRole, string> = {
  superadmin: 'Acceso completo a todas las funciones del sistema',
  admin: 'Administración de la organización y sus recursos',
  editor: 'Creación y edición de contenido',
  reader: 'Lectura y visualización de contenido',
  viewer: 'Solo visualización limitada de contenido',
};

const RolePermissionsInfo: React.FC<RolePermissionsInfoProps> = ({ 
  role, 
  permissions,
  condensed = false
}) => {
  // Determinar si es un rol del sistema o personalizado
  const isSystem = isSystemRole(role);
  
  // Obtener el nombre legible del rol
  let roleName = role;
  let description = '';
  let permissionsToShow: PermissionSet = {};
  
  if (isSystem) {
    roleName = roleLabels[role as SystemRole] || role;
    description = roleDescriptions[role as SystemRole] || '';
    permissionsToShow = RolePermissions[role as SystemRole] || {};
  } else if (role.startsWith('custom:')) {
    roleName = 'Rol Personalizado';
    permissionsToShow = permissions || {};
  }

  // Agrupar permisos por recurso
  const groupedPermissions: Record<Resource, Action[]> = {} as Record<Resource, Action[]>;
  
  Object.entries(permissionsToShow).forEach(([key, enabled]) => {
    if (enabled) {
      const [resource, action] = key.split('.') as [Resource, Action];
      if (!groupedPermissions[resource]) {
        groupedPermissions[resource] = [];
      }
      groupedPermissions[resource].push(action);
    }
  });

  if (condensed) {
    // Versión condensada: solo mostrar recursos accesibles
    return (
      <div className="flex flex-wrap gap-1">
        {Object.keys(groupedPermissions).map((resource) => (
          <Badge key={resource} variant="outline" className="text-xs">
            {resourceLabels[resource as Resource]}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <Card className="border rounded-lg">
      <CardContent className="pt-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{roleName}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        
        {Object.entries(groupedPermissions).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([resource, actions]) => (
              <div key={resource} className="border-b pb-2 last:border-b-0">
                <h4 className="font-medium mb-1">
                  {resourceLabels[resource as Resource]}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {actions.map((action) => (
                    <Badge key={action} variant="secondary" className="text-xs">
                      {actionLabels[action]}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sin permisos definidos</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RolePermissionsInfo;