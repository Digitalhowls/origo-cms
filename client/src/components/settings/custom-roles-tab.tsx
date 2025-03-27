import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Check, Plus, Shield, Trash2, Edit, AlertTriangle, Settings } from 'lucide-react';
import PermissionEditor from '@/components/permissions/permission-editor';
import RolePermissionsInfo from '@/components/permissions/role-permissions-info';
import PermissionsDashboard from '@/components/permissions/permissions-dashboard';
import { useCustomRoles } from '@/hooks/use-custom-roles';
import { SystemRole, PermissionSet } from '@shared/types';

const CustomRolesTab: React.FC = () => {
  const { toast } = useToast();
  
  // Obtener custom roles con el hook
  const { 
    roles, 
    isLoading, 
    getRole, 
    isLoadingRole, 
    createRole, 
    updateRole, 
    deleteRole,
    isPending
  } = useCustomRoles();
  
  // Estado para los diálogos y formularios
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [currentRoleId, setCurrentRoleId] = useState<number | null>(null);
  
  // Estado para el formulario (usado tanto para crear como para editar)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basedOnRole: 'viewer' as SystemRole,
    permissions: {} as PermissionSet,
    isDefault: false
  });
  
  // Manejadores de eventos para los formularios
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleBaseRoleChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      basedOnRole: value as SystemRole
    }));
  };
  
  const handlePermissionsChange = (permissions: PermissionSet) => {
    setFormData(prev => ({ ...prev, permissions }));
  };
  
  // Manejadores para los diálogos
  const handleOpenCreateDialog = () => {
    setFormData({
      name: '',
      description: '',
      basedOnRole: 'viewer',
      permissions: {},
      isDefault: false
    });
    setIsCreateDialogOpen(true);
  };
  
  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };
  
  const handleOpenEditDialog = async (roleId: number) => {
    setCurrentRoleId(roleId);
    const role = await getRole(roleId);
    
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
        basedOnRole: role.basedOnRole as SystemRole,
        permissions: role.permissions || {},
        isDefault: role.isDefault
      });
      setIsEditDialogOpen(true);
    } else {
      toast({
        title: "Error",
        description: "No se pudo cargar la información del rol",
        variant: "destructive"
      });
    }
  };
  
  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setCurrentRoleId(null);
  };
  
  const handleOpenDeleteDialog = (roleId: number) => {
    setConfirmDeleteId(roleId);
  };
  
  // Manejadores para acciones CRUD
  const handleCreateRole = async () => {
    try {
      await createRole({
        name: formData.name,
        description: formData.description,
        basedOnRole: formData.basedOnRole,
        permissions: formData.permissions,
        isDefault: formData.isDefault
      });
      
      setIsCreateDialogOpen(false);
      toast({
        title: "Rol creado",
        description: "El rol personalizado ha sido creado correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el rol: " + (error as Error).message,
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateRole = async () => {
    if (!currentRoleId) return;
    
    try {
      await updateRole(currentRoleId, {
        name: formData.name,
        description: formData.description,
        basedOnRole: formData.basedOnRole,
        permissions: formData.permissions,
        isDefault: formData.isDefault
      });
      
      setIsEditDialogOpen(false);
      setCurrentRoleId(null);
      toast({
        title: "Rol actualizado",
        description: "El rol personalizado ha sido actualizado correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol: " + (error as Error).message,
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteRole = async () => {
    if (!confirmDeleteId) return;
    
    try {
      await deleteRole(confirmDeleteId);
      setConfirmDeleteId(null);
      toast({
        title: "Rol eliminado",
        description: "El rol personalizado ha sido eliminado correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el rol: " + (error as Error).message,
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="mb-6">
        <TabsList>
          <TabsTrigger value="dashboard" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Panel de Control
          </TabsTrigger>
          <TabsTrigger value="custom-roles" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Gestión de Roles
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <PermissionsDashboard />
        </TabsContent>
        
        <TabsContent value="custom-roles">
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Roles Personalizados</CardTitle>
                  <CardDescription>
                    Define roles personalizados con permisos específicos para tu organización.
                  </CardDescription>
                </div>
                <Button onClick={handleOpenCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo rol
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Los roles personalizados te permiten definir permisos específicos para cada función en tu organización.
                  Puedes basarlos en roles predefinidos y luego personalizarlos según tus necesidades.
                </p>
              </CardContent>
            </Card>
      
            {/* Lista de roles personalizados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : roles && roles.length > 0 ? (
                roles.map(role => (
                  <Card key={role.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <Shield className="h-5 w-5 mr-2" />
                          {role.name}
                          {role.isDefault && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                              Por defecto
                            </span>
                          )}
                        </CardTitle>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleOpenEditDialog(role.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleOpenDeleteDialog(role.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="info">
                        <TabsList className="w-full mb-4">
                          <TabsTrigger value="info" className="flex-1">Información</TabsTrigger>
                          <TabsTrigger value="permisos" className="flex-1">Permisos</TabsTrigger>
                        </TabsList>
                        <TabsContent value="info">
                          <div className="text-sm space-y-2 pt-2">
                            <div>
                              <span className="font-medium">ID:</span> {role.id}
                            </div>
                            <div>
                              <span className="font-medium">Fecha de creación:</span>{' '}
                              {role.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Última actualización:</span>{' '}
                              {role.updatedAt ? new Date(role.updatedAt).toLocaleDateString() : 'N/A'}
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
                            permissions={role.permissions || {}}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomRolesTab;