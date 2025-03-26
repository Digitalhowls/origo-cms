import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Resource, Action } from '@shared/types';
import { usePermissions } from '@/hooks/use-permissions';
import { PlusCircle, Shield, Info } from 'lucide-react';

interface UserPermissionsManagerProps {
  userId: number;
}

export function UserPermissionsManager({ userId }: UserPermissionsManagerProps) {
  const { addPermission } = usePermissions(userId);
  
  const [formState, setFormState] = useState({
    resource: '',
    action: '',
    allowed: true,
    isSubmitting: false
  });
  
  // Un mapa simple para mantener las acciones disponibles para cada recurso
  // Esto podría expandirse o provenir de la API en una implementación más completa
  const resourceActions: Record<string, string[]> = {
    [Resource.PAGE]: [
      Action.CREATE,
      Action.READ,
      Action.UPDATE,
      Action.DELETE,
      Action.PUBLISH,
      Action.UNPUBLISH
    ],
    [Resource.BLOG]: [
      Action.CREATE,
      Action.READ,
      Action.UPDATE,
      Action.DELETE,
      Action.PUBLISH,
      Action.UNPUBLISH
    ],
    [Resource.MEDIA]: [
      Action.CREATE,
      Action.READ,
      Action.UPDATE,
      Action.DELETE
    ],
    [Resource.COURSE]: [
      Action.CREATE,
      Action.READ,
      Action.UPDATE,
      Action.DELETE,
      Action.PUBLISH,
      Action.UNPUBLISH
    ],
    [Resource.USER]: [
      Action.CREATE,
      Action.READ,
      Action.UPDATE,
      Action.DELETE,
      Action.INVITE
    ],
    [Resource.ORGANIZATION]: [
      Action.READ,
      Action.UPDATE,
      Action.MANAGE
    ],
    [Resource.SETTING]: [
      Action.READ,
      Action.UPDATE
    ],
    [Resource.ANALYTICS]: [
      Action.READ
    ],
    [Resource.API_KEY]: [
      Action.CREATE,
      Action.READ,
      Action.DELETE
    ],
    [Resource.CATEGORY]: [
      Action.CREATE,
      Action.READ,
      Action.UPDATE,
      Action.DELETE
    ],
    [Resource.TAG]: [
      Action.CREATE,
      Action.READ,
      Action.UPDATE,
      Action.DELETE
    ]
  };
  
  const handleAddPermission = async () => {
    if (!formState.resource || !formState.action) return;
    
    setFormState({ ...formState, isSubmitting: true });
    
    try {
      await addPermission({
        userId,
        resource: formState.resource,
        action: formState.action,
        allowed: formState.allowed
      });
      
      // Reinicia el formulario
      setFormState({
        resource: '',
        action: '',
        allowed: true,
        isSubmitting: false
      });
    } catch (error) {
      console.error('Error al añadir permiso:', error);
      setFormState({ ...formState, isSubmitting: false });
    }
  };
  
  // Obtener recursos disponibles (las claves del objeto resourceActions)
  const resources = Object.keys(resourceActions);
  
  // Obtener acciones disponibles para el recurso seleccionado
  const availableActions = formState.resource ? resourceActions[formState.resource] : [];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Añadir permiso personalizado
        </CardTitle>
        <CardDescription>
          Añade permisos personalizados para recursos y acciones específicas.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="resource">Recurso</Label>
            <Select
              value={formState.resource}
              onValueChange={(value) => setFormState({ ...formState, resource: value, action: '' })}
            >
              <SelectTrigger id="resource">
                <SelectValue placeholder="Seleccionar recurso" />
              </SelectTrigger>
              <SelectContent>
                {resources.map((resource) => (
                  <SelectItem key={resource} value={resource}>
                    {resource.charAt(0).toUpperCase() + resource.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="action">Acción</Label>
            <Select
              value={formState.action}
              onValueChange={(value) => setFormState({ ...formState, action: value })}
              disabled={!formState.resource || availableActions.length === 0}
            >
              <SelectTrigger id="action">
                <SelectValue placeholder="Seleccionar acción" />
              </SelectTrigger>
              <SelectContent>
                {availableActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="permission-allowed">Permiso permitido</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="permission-allowed"
                checked={formState.allowed}
                onCheckedChange={(checked) => setFormState({ ...formState, allowed: checked })}
              />
              <span className="text-sm text-gray-500">
                {formState.allowed ? 'Permitido' : 'Denegado'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between bg-gray-50 rounded-b-lg border-t p-4">
        <div className="flex items-start gap-2 text-sm text-gray-500">
          <Info className="h-5 w-5 flex-shrink-0 text-blue-500" />
          <p>
            Los permisos personalizados tienen prioridad sobre los permisos del rol.
          </p>
        </div>
        
        <Button
          onClick={handleAddPermission}
          disabled={!formState.resource || !formState.action || formState.isSubmitting}
        >
          {formState.isSubmitting ? 'Añadiendo...' : 'Añadir permiso'}
        </Button>
      </CardFooter>
    </Card>
  );
}