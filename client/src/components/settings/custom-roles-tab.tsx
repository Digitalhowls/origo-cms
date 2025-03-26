import { useState } from "react";
import { useCustomRoles } from "@/hooks/use-custom-roles";
import { useOrganizationStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomRoleDefinition, SystemRole } from "@shared/types";
import { Pencil, Trash2, Plus, UserCog, Shield } from "lucide-react";
import { PermissionsList } from "../permissions/permissions-list";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export function CustomRolesTab() {
  const { currentOrganization } = useOrganizationStore();
  const { roles, isLoadingRoles, createRoleMutation, updateRoleMutation, deleteRoleMutation } = useCustomRoles(currentOrganization?.id);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const { toast } = useToast();

  // Estado para el formulario de creación/edición
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basedOnRole: "editor" as SystemRole,
    isDefault: false,
    permissions: {} as Record<string, boolean>
  });

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      basedOnRole: "editor",
      isDefault: false,
      permissions: {}
    });
  };

  // Preparar para crear un nuevo rol
  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  // Preparar para editar un rol existente
  const handleEdit = (role: CustomRoleDefinition) => {
    setFormData({
      name: role.name,
      description: role.description || "",
      basedOnRole: role.basedOnRole as SystemRole,
      isDefault: role.isDefault,
      permissions: role.permissions || {}
    });
    setIsEditing(role.id);
  };

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar cambio en el switch de rol predeterminado
  const handleDefaultChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isDefault: checked }));
  };

  // Manejar cambio en permisos
  const handlePermissionChange = (permissionKey: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionKey]: value
      }
    }));
  };

  // Guardar rol (crear o actualizar)
  const handleSave = async () => {
    // Validar que tengamos al menos un nombre
    if (!formData.name.trim()) {
      toast({
        title: "Error en el formulario",
        description: "El nombre del rol es obligatorio",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isCreating) {
        // Crear nuevo rol
        await createRoleMutation.mutateAsync({
          name: formData.name,
          description: formData.description || undefined,
          organizationId: currentOrganization?.id as number,
          basedOnRole: formData.basedOnRole,
          isDefault: formData.isDefault,
          permissions: Object.keys(formData.permissions).length > 0 ? formData.permissions : undefined
        });
        setIsCreating(false);
      } else if (isEditing !== null) {
        // Actualizar rol existente
        await updateRoleMutation.mutateAsync({
          id: isEditing,
          data: {
            name: formData.name,
            description: formData.description || undefined,
            basedOnRole: formData.basedOnRole,
            isDefault: formData.isDefault,
            permissions: formData.permissions
          }
        });
        setIsEditing(null);
      }
      resetForm();
    } catch (error) {
      console.error("Error al guardar rol:", error);
    }
  };

  // Eliminar rol
  const handleDelete = async () => {
    if (showDeleteConfirm === null) return;
    
    try {
      await deleteRoleMutation.mutateAsync(showDeleteConfirm);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error al eliminar rol:", error);
    }
  };

  // Cancelar operación actual
  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Roles Personalizados</h2>
          <p className="text-muted-foreground">
            Crea y gestiona roles personalizados con permisos específicos para tu organización.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Rol
        </Button>
      </div>

      <Separator />

      {isLoadingRoles ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : roles.length === 0 ? (
        <Alert variant="default" className="bg-muted">
          <AlertDescription>
            No hay roles personalizados creados. Puedes crear tu primer rol personalizado usando el botón "Nuevo Rol".
          </AlertDescription>
        </Alert>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Basado en</TableHead>
              <TableHead>Predeterminado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{role.description || "-"}</TableCell>
                <TableCell>
                  <span className="capitalize">{role.basedOnRole}</span>
                </TableCell>
                <TableCell>{role.isDefault ? "Sí" : "No"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(role)} title="Editar">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDeleteConfirm(role.id)}
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modal de creación/edición de rol */}
      <Dialog open={isCreating || isEditing !== null} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Crear Nuevo Rol" : "Editar Rol"}</DialogTitle>
            <DialogDescription>
              {isCreating
                ? "Crea un nuevo rol personalizado con permisos específicos."
                : "Modifica los detalles y permisos de este rol personalizado."}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">
                <UserCog className="mr-2 h-4 w-4" />
                Información General
              </TabsTrigger>
              <TabsTrigger value="permissions">
                <Shield className="mr-2 h-4 w-4" />
                Permisos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="py-4 space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="col-span-3"
                  placeholder="Nombre del rol personalizado"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="col-span-3"
                  placeholder="Descripción opcional para el rol personalizado"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="basedOnRole" className="text-right">
                  Basado en
                </Label>
                <Select
                  value={formData.basedOnRole}
                  onValueChange={(value) => setFormData({ ...formData, basedOnRole: value as SystemRole })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar rol base" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="reader">Lector</SelectItem>
                    <SelectItem value="viewer">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isDefault" className="text-right">
                  Predeterminado
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Switch
                    id="isDefault"
                    checked={formData.isDefault}
                    onCheckedChange={handleDefaultChange}
                  />
                  <Label htmlFor="isDefault" className="font-normal">
                    Usar este rol como predeterminado para nuevos usuarios
                  </Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="py-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Configura los permisos específicos para este rol personalizado. Los permisos no especificados
                  heredarán el comportamiento del rol base seleccionado.
                </p>

                <PermissionsList
                  permissions={formData.permissions}
                  onChange={handlePermissionChange}
                  baseRole={formData.basedOnRole}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
            >
              {(createRoleMutation.isPending || updateRoleMutation.isPending) && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              )}
              {isCreating ? "Crear Rol" : "Actualizar Rol"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación de eliminación */}
      <Dialog open={showDeleteConfirm !== null} onOpenChange={(open) => !open && setShowDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este rol personalizado? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteRoleMutation.isPending}
            >
              {deleteRoleMutation.isPending && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              )}
              Eliminar Rol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}