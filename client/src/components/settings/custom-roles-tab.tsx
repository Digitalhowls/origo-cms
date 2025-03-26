import { useState } from 'react';
import { useCustomRoles } from '@/hooks/use-custom-roles';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { SystemRole } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PermissionEditor from '@/components/permissions/permission-editor';
import RolePermissionsInfo from '@/components/permissions/role-permissions-info';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Pencil, Trash2, UserPlus, AlertCircle, Check } from 'lucide-react';

export default function CustomRolesTab() {
  const { roles, isLoading, error, createRole, updateRole, deleteRole, useRoleQuery, isPending } = useCustomRoles();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estado local para la gestión de diálogos y formularios
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  
  // Estado del formulario para crear o editar un rol
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    basedOnRole: SystemRole;
    permissions: Record<string, boolean>;
  }>({
    name: '',
    description: '',
    basedOnRole: 'editor',
    permissions: {},
  });
  
  // Consulta para obtener los detalles del rol seleccionado para editar
  const { data: selectedRoleData, isLoading: isLoadingRole } = useRoleQuery(selectedRoleId || undefined);
  
  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      basedOnRole: 'editor',
      permissions: {},
    });
  };
  
  // Abrir el diálogo de edición con los datos del rol
  const handleEditRole = (roleId: number) => {
    setSelectedRoleId(roleId);
    setIsEditDialogOpen(true);
  };
  
  // Cargar datos del rol seleccionado cuando estén disponibles
  if (selectedRoleData && isEditDialogOpen && formData.name === '') {
    setFormData({
      name: selectedRoleData.name,
      description: selectedRoleData.description || '',
      basedOnRole: selectedRoleData.basedOnRole as SystemRole,
      permissions: selectedRoleData.permissions || {},
    });
  }
  
  // Manejar cambios en el formulario
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Manejar cambio de rol base
  const handleBaseRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, basedOnRole: value as SystemRole }));
  };
  
  // Manejar cambios en los permisos
  const handlePermissionsChange = (permissions: Record<string, boolean>) => {
    setFormData((prev) => ({ ...prev, permissions }));
  };
  
  // Crear un nuevo rol
  const handleCreateRole = () => {
    if (!formData.name) {
      toast({
        title: 'Error',
        description: 'El nombre del rol es obligatorio',
        variant: 'destructive',
      });
      return;
    }
    
    createRole(formData);
    resetForm();
    setIsCreateDialogOpen(false);
  };
  
  // Actualizar un rol existente
  const handleUpdateRole = () => {
    if (!selectedRoleId) return;
    
    if (!formData.name) {
      toast({
        title: 'Error',
        description: 'El nombre del rol es obligatorio',
        variant: 'destructive',
      });
      return;
    }
    
    updateRole({
      roleId: selectedRoleId,
      data: formData,
    });
    
    resetForm();
    setSelectedRoleId(null);
    setIsEditDialogOpen(false);
  };
  
  // Confirmar y eliminar un rol
  const confirmDelete = (roleId: number) => {
    setConfirmDeleteId(roleId);
  };
  
  const handleDeleteRole = () => {
    if (!confirmDeleteId) return;
    
    deleteRole(confirmDeleteId);
    setConfirmDeleteId(null);
  };
  
  // Cerrar diálogos y resetear estados
  const handleCloseCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(false);
  };
  
  const handleCloseEditDialog = () => {
    resetForm();
    setSelectedRoleId(null);
    setIsEditDialogOpen(false);
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center py-10">Cargando roles...</div>;
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <AlertCircle className="h-10 w-10 text-destructive mb-2" />
        <h3 className="text-lg font-medium">Error al cargar roles</h3>
        <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Roles Personalizados</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)} disabled={isPending}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Rol
        </Button>
      </div>
      
      <p className="text-muted-foreground">
        Los roles personalizados te permiten definir permisos específicos para distintos
        usuarios de tu organización, adaptados a sus responsabilidades.
      </p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles && roles.length > 0 ? (
          roles.map((role) => (
            <Card key={role.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{role.name}</CardTitle>
                    <CardDescription>
                      Basado en: {role.basedOnRole.charAt(0).toUpperCase() + role.basedOnRole.slice(1)}
                    </CardDescription>
                  </div>
                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditRole(role.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(role.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {role.description && (
                  <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
                )}
                <Tabs defaultValue="info">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="info">Información</TabsTrigger>
                    <TabsTrigger value="permisos">Permisos</TabsTrigger>
                  </TabsList>
                  <TabsContent value="info" className="h-[150px] overflow-auto">
                    <div className="text-sm space-y-2 pt-2">
                      <div>
                        <span className="font-medium">ID:</span> {role.id}
                      </div>
                      <div>
                        <span className="font-medium">Fecha de creación:</span>{' '}
                        {new Date(role.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Última actualización:</span>{' '}
                        {new Date(role.updatedAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Por defecto:</span>{' '}
                        {role.isDefault ? <Check className="inline h-4 w-4 text-green-500" /> : 'No'}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="permisos" className="h-[150px] overflow-auto">
                    <RolePermissionsInfo
                      role={`custom:${role.id}`}
                      permissions={role.permissions}
                      condensed
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">
              No hay roles personalizados definidos todavía.
            </p>
          </div>
        )}
      </div>
      
      {/* Diálogo para crear un nuevo rol */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Rol</DialogTitle>
            <DialogDescription>
              Define un nuevo rol personalizado para tu organización.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">Nombre del Rol</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej: Editor de Blog"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe brevemente las responsabilidades de este rol"
                className="min-h-[80px]"
              />
            </div>
            
            <div>
              <Label htmlFor="baseRole">Basado en Rol</Label>
              <Select
                value={formData.basedOnRole}
                onValueChange={handleBaseRoleChange}
              >
                <SelectTrigger id="baseRole">
                  <SelectValue placeholder="Selecciona un rol base" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="reader">Lector</SelectItem>
                  <SelectItem value="viewer">Visitante</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                El rol base define los permisos predeterminados que luego puedes personalizar.
              </p>
            </div>
            
            <div>
              <Label>Permisos</Label>
              <div className="mt-2">
                <PermissionEditor
                  permissions={formData.permissions}
                  onChange={handlePermissionsChange}
                  baseRole={formData.basedOnRole}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCreateDialog}>
              Cancelar
            </Button>
            <Button onClick={handleCreateRole} disabled={isPending}>
              Crear Rol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para editar un rol existente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Rol</DialogTitle>
            <DialogDescription>
              Modifica la configuración y permisos de este rol.
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingRole ? (
            <div className="py-6 text-center">Cargando información del rol...</div>
          ) : (
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="edit-name">Nombre del Rol</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="min-h-[80px]"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-baseRole">Basado en Rol</Label>
                <Select
                  value={formData.basedOnRole}
                  onValueChange={handleBaseRoleChange}
                >
                  <SelectTrigger id="edit-baseRole">
                    <SelectValue placeholder="Selecciona un rol base" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="reader">Lector</SelectItem>
                    <SelectItem value="viewer">Visitante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Permisos</Label>
                <div className="mt-2">
                  <PermissionEditor
                    permissions={formData.permissions}
                    onChange={handlePermissionsChange}
                    baseRole={formData.basedOnRole}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditDialog}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateRole} disabled={isPending || isLoadingRole}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de confirmación para eliminar un rol */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El rol será eliminado permanentemente.
              <br /><br />
              <strong>Nota:</strong> Si hay usuarios con este rol asignado, la eliminación no será posible.
              Primero deberás reasignar esos usuarios a otros roles.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}