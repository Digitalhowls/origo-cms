import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Search, Settings, Trash2, Globe, Users } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Tipo para organizaciones
interface Organization {
  id: number;
  name: string;
  slug: string;
  domain?: string;
  subdomain?: string;
  plan?: string;
  logo?: string;
  favicon?: string;
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  typography?: {
    fontFamily: string;
    headings: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function OrganizationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [orgToDelete, setOrgToDelete] = useState<Organization | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Consulta para obtener organizaciones
  const { data: organizations, isLoading, isError, error } = useQuery<Organization[]>({
    queryKey: ['/api/organizations'],
    enabled: true,
  });

  // Mutación para eliminar organización
  const deleteOrgMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/organizations/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Organización eliminada',
        description: 'La organización ha sido eliminada correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
      setOrgToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar la organización',
        variant: 'destructive',
      });
    },
  });

  // Mutación para cambiar de organización
  const switchOrgMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('POST', `/api/organizations/switch/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Organización cambiada',
        description: 'Se ha cambiado de organización correctamente.',
      });
      // Redirigir al dashboard después de cambiar
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo cambiar de organización',
        variant: 'destructive',
      });
    },
  });

  const filteredOrganizations = organizations?.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    org.slug.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDeleteOrg = (org: Organization) => {
    setOrgToDelete(org);
  };

  const confirmDelete = () => {
    if (orgToDelete) {
      deleteOrgMutation.mutate(orgToDelete.id);
    }
  };

  const handleSwitchOrg = (id: number) => {
    switchOrgMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-lg text-destructive">Error al cargar las organizaciones: {error.message}</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/organizations'] })}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizaciones</h1>
          <p className="text-muted-foreground mt-1">
            Administra tus organizaciones y cambia entre ellas
          </p>
        </div>
        <Link href="/settings/organizations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva organización
          </Button>
        </Link>
      </div>

      <div className="flex items-center py-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar organizaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {organizations && organizations.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Dominio</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrganizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {org.logo ? (
                        <img 
                          src={org.logo} 
                          alt={org.name} 
                          className="h-6 w-6 object-contain rounded-sm" 
                        />
                      ) : (
                        <div className="h-6 w-6 bg-muted rounded-sm flex items-center justify-center">
                          <span className="text-xs font-semibold">
                            {org.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {org.name}
                    </div>
                  </TableCell>
                  <TableCell>{org.slug}</TableCell>
                  <TableCell>
                    {org.domain ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Globe className="h-3 w-3" />
                        {org.domain}
                      </div>
                    ) : org.subdomain ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Globe className="h-3 w-3" />
                        {org.subdomain}.dominio.com
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No configurado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {org.plan ? (
                      <Badge variant="outline" className="capitalize">
                        {org.plan}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Gratuito</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(org.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSwitchOrg(org.id)}
                        disabled={switchOrgMutation.isPending}
                      >
                        {switchOrgMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Cambiar"
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/settings/organizations/${org.id}`}>
                          <Settings className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteOrg(org)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No hay organizaciones</CardTitle>
            <CardDescription>
              No se encontraron organizaciones. Crea una nueva para comenzar.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/settings/organizations/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva organización
              </Button>
            </Link>
          </CardFooter>
        </Card>
      )}

      {/* Diálogo de confirmación para eliminar organización */}
      <AlertDialog open={!!orgToDelete} onOpenChange={(open) => !open && setOrgToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la organización <strong>{orgToDelete?.name}</strong> y todo su contenido.
              No podrás recuperar esta información.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteOrgMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}