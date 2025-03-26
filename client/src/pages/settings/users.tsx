import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopNavbar from '@/components/layout/TopNavbar';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import UserPermissionsTab from '@/components/permissions/user-permissions-tab';
import CustomRolesTab from '@/components/settings/custom-roles-tab';
import UserPermissionsManager from '@/components/permissions/user-permissions-manager';
import { UserRole } from '@shared/types';
import { Plus, MoreVertical, Mail, Trash, PenSquare, Search, Copy, Users, Shield } from 'lucide-react';

const UsersSettings: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Form state for inviting new user
  const [inviteFormData, setInviteFormData] = useState({
    email: '',
    name: '',
    role: 'viewer',
  });
  
  // Form state for editing user
  const [editFormData, setEditFormData] = useState({
    id: 0,
    email: '',
    name: '',
    role: '',
  });
  
  // Fetch users data
  const { data, isLoading } = useQuery({
    queryKey: ['/api/users', searchTerm, roleFilter],
    queryFn: async () => {
      const response = await fetch(
        `/api/users?search=${searchTerm}&role=${roleFilter}`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });
  
  // Invite user mutation
  const inviteMutation = useMutation({
    mutationFn: async (userData: typeof inviteFormData) => {
      return apiRequest('POST', '/api/users/invite', userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsInviteDialogOpen(false);
      setInviteFormData({ email: '', name: '', role: 'viewer' });
      toast({
        title: "Invitación enviada",
        description: "Se ha enviado una invitación al usuario correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo enviar la invitación: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: async (userData: typeof editFormData) => {
      return apiRequest('PATCH', `/api/users/${userData.id}`, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el usuario: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest('DELETE', `/api/users/${userId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar el usuario: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate(inviteFormData);
  };
  
  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(editFormData);
  };
  
  const handleDeleteUser = (userId: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.')) {
      deleteMutation.mutate(userId);
    }
  };
  
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditFormData({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };
  
  const handleInviteFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setInviteFormData({
      ...inviteFormData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is triggered by the query key change
  };
  
  // Helper to display badge based on user role
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Badge className="bg-purple-100 text-purple-800">Super Admin</Badge>;
      case 'admin':
        return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
      case 'editor':
        return <Badge className="bg-blue-100 text-blue-800">Editor</Badge>;
      case 'reader':
        return <Badge className="bg-green-100 text-green-800">Lector</Badge>;
      case 'viewer':
        return <Badge className="bg-gray-100 text-gray-800">Viewer</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };
  
  // Helper for user initials
  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar 
          pageTitle="Gestión de Usuarios" 
          actions={
            <Button size="sm" onClick={() => setIsInviteDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Invitar usuario
            </Button>
          }
        />
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Pestañas para gestión de usuarios y roles */}
          <Tabs defaultValue="users" className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="users" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Usuarios
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Roles
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Usuarios de la organización</CardTitle>
                  <CardDescription>
                    Gestiona los usuarios que tienen acceso a tu organización y sus permisos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <form onSubmit={handleSearch} className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          type="text"
                          placeholder="Buscar por nombre o email..."
                          className="pl-9"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </form>
                    
                    <div className="flex gap-2">
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filtrar por rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los roles</SelectItem>
                          <SelectItem value="superadmin">Super Admin</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="reader">Lector</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Users Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Usuario</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead>Último Acceso</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          Array(5).fill(0).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                                  <div className="h-5 bg-gray-200 rounded animate-pulse w-2/3"></div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-5 bg-gray-200 rounded animate-pulse w-20"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-5 bg-gray-200 rounded animate-pulse w-24"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-5 bg-gray-200 rounded animate-pulse w-10 ml-auto"></div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : data?.items?.length > 0 ? (
                          data.items.map((user: any) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{getRoleBadge(user.role)}</TableCell>
                              <TableCell>
                                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Nunca'}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                      <PenSquare className="h-4 w-4 mr-2" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                      <div className="w-full px-2 py-1.5">
                                        <UserPermissionsManager 
                                          userId={user.id} 
                                          userName={user.name} 
                                          userRole={user.role}
                                        />
                                      </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      navigator.clipboard.writeText(user.email);
                                      toast({
                                        title: "Email copiado",
                                        description: "Email copiado al portapapeles.",
                                      });
                                    }}>
                                      <Copy className="h-4 w-4 mr-2" />
                                      Copiar email
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                      <a 
                                        href={`mailto:${user.email}`} 
                                        className="flex items-center"
                                      >
                                        <Mail className="h-4 w-4 mr-2" />
                                        Enviar email
                                      </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-800 focus:text-red-800">
                                      <Trash className="h-4 w-4 mr-2" />
                                      Eliminar
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              No se encontraron usuarios.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="roles" className="mt-0">
              <CustomRolesTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      {/* Invite User Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitar nuevo usuario</DialogTitle>
            <DialogDescription>
              Invita a un nuevo usuario a tu organización. Recibirá un email con instrucciones para unirse.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleInviteUser}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="usuario@ejemplo.com"
                  value={inviteFormData.email}
                  onChange={handleInviteFormChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Nombre y apellidos"
                  value={inviteFormData.name}
                  onChange={handleInviteFormChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  name="role"
                  value={inviteFormData.role}
                  onValueChange={(value) => setInviteFormData({...inviteFormData, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="reader">Lector</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? 'Enviando...' : 'Enviar invitación'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>
              Modifica la información y permisos del usuario.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="info">Información básica</TabsTrigger>
              <TabsTrigger value="permissions">Permisos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info">
              <form onSubmit={handleUpdateUser}>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      name="email"
                      type="email"
                      required
                      disabled
                      value={editFormData.email}
                      onChange={handleEditFormChange}
                    />
                    <p className="text-xs text-gray-500">El email no puede ser modificado.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nombre</Label>
                    <Input
                      id="edit-name"
                      name="name"
                      required
                      value={editFormData.name}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Rol</Label>
                    <Select
                      name="role"
                      value={editFormData.role}
                      onValueChange={(value) => setEditFormData({...editFormData, role: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="reader">Lector</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="permissions">
              {selectedUser && (
                <UserPermissionsTab 
                  userId={selectedUser.id}
                  userName={selectedUser.name}
                  userRole={selectedUser.role as UserRole}
                />
              )}
              
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersSettings;
