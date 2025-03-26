import { useState } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { Resource, Action } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, AlertCircle } from "lucide-react";
import { UserPermission } from "@shared/schema";

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
    'tag': 'Etiqueta'
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
    'admin': 'Administrar'
  };
  return actionMap[action] || action;
};

interface UserPermissionsManagerProps {
  userId: number;
  userName: string;
  userRole: string;
}

export function UserPermissionsManager({ userId, userName, userRole }: UserPermissionsManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newResource, setNewResource] = useState<Resource | ''>('');
  const [newAction, setNewAction] = useState<Action | ''>('');
  const [newAllowed, setNewAllowed] = useState(true);
  
  const {
    permissions,
    isLoadingPermissions,
    errorPermissions,
    addPermission,
    isAddingPermission,
    updatePermission,
    isUpdatingPermission,
    deletePermission,
    isDeletingPermission
  } = usePermissions(userId);

  const handleAddPermission = () => {
    if (!newResource || !newAction) return;
    
    addPermission({
      userId,
      resource: newResource,
      action: newAction,
      allowed: newAllowed,
      description: `Permiso personalizado para ${resourceToString(newResource)} - ${actionToString(newAction)}`
    });
    
    setIsAddDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewResource('');
    setNewAction('');
    setNewAllowed(true);
  };

  const handleTogglePermission = (permission: UserPermission) => {
    updatePermission({
      id: permission.id,
      allowed: !permission.allowed
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Permisos personalizados para {userName}</h3>
          <p className="text-sm text-muted-foreground">
            Estos permisos personalizados pueden anular los permisos predeterminados del rol "{userRole}".
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              <span>Añadir permiso</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir permiso personalizado</DialogTitle>
              <DialogDescription>
                Los permisos personalizados pueden anular los predeterminados del rol.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="resource">Recurso</Label>
                <Select value={newResource} onValueChange={(value) => setNewResource(value as Resource)}>
                  <SelectTrigger id="resource">
                    <SelectValue placeholder="Seleccionar recurso" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Resource).map((resource) => (
                      <SelectItem key={resource} value={resource}>
                        {resourceToString(resource)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="action">Acción</Label>
                <Select value={newAction} onValueChange={(value) => setNewAction(value as Action)}>
                  <SelectTrigger id="action">
                    <SelectValue placeholder="Seleccionar acción" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Action).map((action) => (
                      <SelectItem key={action} value={action}>
                        {actionToString(action)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="allowed">Permitido</Label>
                <Switch
                  id="allowed"
                  checked={newAllowed}
                  onCheckedChange={setNewAllowed}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddPermission} disabled={!newResource || !newAction || isAddingPermission}>
                {isAddingPermission && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingPermissions ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : errorPermissions ? (
        <div className="flex items-center justify-center p-4 text-red-500">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Error al cargar permisos: {(errorPermissions as Error).message}</span>
        </div>
      ) : permissions && permissions.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recurso</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((permission: UserPermission) => (
              <TableRow key={permission.id}>
                <TableCell>
                  {resourceToString(permission.resource)}
                </TableCell>
                <TableCell>
                  {actionToString(permission.action)}
                </TableCell>
                <TableCell>
                  <Badge variant={permission.allowed ? "default" : "destructive"}>
                    {permission.allowed ? "Permitido" : "Denegado"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Switch
                      checked={permission.allowed}
                      onCheckedChange={() => handleTogglePermission(permission)}
                      disabled={isUpdatingPermission}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deletePermission(permission.id)}
                      disabled={isDeletingPermission}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center p-4 border rounded-md bg-muted/20">
          <p>No hay permisos personalizados para este usuario.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Este usuario tiene los permisos predeterminados de su rol: {userRole}.
          </p>
        </div>
      )}
    </div>
  );
}