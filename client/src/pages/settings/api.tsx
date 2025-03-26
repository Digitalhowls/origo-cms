import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopNavbar from '@/components/layout/TopNavbar';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Key, Plus, Copy, Trash, AlertCircle, Clock } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

interface ApiKey {
  id: number;
  key: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
}

const ApiSettings: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  
  // Fetch API keys
  const { data: apiKeys, isLoading } = useQuery<ApiKey[]>({
    queryKey: ['/api/api-keys'],
    queryFn: async () => {
      const response = await fetch('/api/api-keys', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch API keys');
      return response.json();
    },
  });
  
  // Create API key mutation
  const createKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest('POST', '/api/api-keys', { name });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/api-keys'] });
      setIsCreateDialogOpen(false);
      setNewKeyName('');
      setShowNewKey(data.key);
      
      toast({
        title: "Clave API creada",
        description: "La clave API ha sido creada correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo crear la clave API: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete API key mutation
  const deleteKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/api-keys/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/api-keys'] });
      
      toast({
        title: "Clave API eliminada",
        description: "La clave API ha sido eliminada correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar la clave API: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Por favor, introduce un nombre para la clave API.",
        variant: "destructive",
      });
      return;
    }
    
    createKeyMutation.mutate(newKeyName);
  };
  
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    
    toast({
      title: "Clave copiada",
      description: "La clave API ha sido copiada al portapapeles.",
    });
  };
  
  const handleDeleteKey = (id: number) => {
    deleteKeyMutation.mutate(id);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar 
          pageTitle="API Keys" 
          actions={
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Nueva clave API
            </Button>
          }
        />
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Show new API key alert */}
          {showNewKey && (
            <Card className="mb-6 border-primary">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Key className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-2">Nueva clave API creada</h3>
                    <p className="text-gray-600 mb-3">
                      Esta es tu clave API. Por seguridad, no la mostraremos de nuevo.
                    </p>
                    <div className="flex mt-2">
                      <Input 
                        value={showNewKey} 
                        readOnly 
                        className="font-mono text-sm bg-gray-50"
                      />
                      <Button 
                        variant="outline" 
                        className="ml-2" 
                        onClick={() => handleCopyKey(showNewKey)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar
                      </Button>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-1" 
                    onClick={() => setShowNewKey(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Claves API</CardTitle>
              <CardDescription>
                Gestiona las claves API para acceder a los endpoints de la API de Origo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-10 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-500">Cargando claves API...</p>
                </div>
              ) : apiKeys && apiKeys.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Última vez usada</TableHead>
                        <TableHead>Creada</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apiKeys.map((apiKey) => (
                        <TableRow key={apiKey.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <Key className="h-4 w-4 text-gray-400 mr-2" />
                              {apiKey.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-gray-500 text-sm">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDate(apiKey.lastUsedAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(apiKey.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleCopyKey(apiKey.key)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar clave API?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer. Cualquier aplicación o servicio 
                                      que utilice esta clave dejará de funcionar inmediatamente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteKey(apiKey.id)}
                                      className="bg-destructive text-destructive-foreground"
                                    >
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 border rounded-md">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <Key className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="mt-4 text-sm font-medium text-gray-900">No hay claves API</h3>
                  <p className="mt-1 text-sm text-gray-500">Crea una clave API para empezar a usar la API.</p>
                  <div className="mt-6">
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Nueva clave API
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-gray-50 border-t flex-col items-start">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Importante sobre la seguridad</p>
                  <p className="mt-1">
                    Las claves API tienen acceso completo a tu cuenta. Mantenlas seguras y nunca las compartas públicamente.
                    Si sospechas que una clave ha sido comprometida, elimínala y crea una nueva inmediatamente.
                  </p>
                </div>
              </div>
            </CardFooter>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Uso de la API</CardTitle>
              <CardDescription>
                Información sobre cómo utilizar la API de Origo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Autenticación</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Todas las solicitudes a la API deben incluir tu clave API en el header de la petición:
                  </p>
                  <div className="bg-gray-50 p-3 rounded-md font-mono text-sm">
                    <pre>X-API-Key: tu_clave_api</pre>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Ejemplos de uso</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Ejemplo de consulta para obtener páginas:
                  </p>
                  <div className="bg-gray-50 p-3 rounded-md font-mono text-sm overflow-x-auto">
                    <pre>{`curl -X GET \\
  https://api.origo.app/api/pages \\
  -H "X-API-Key: tu_clave_api" \\
  -H "Content-Type: application/json"`}</pre>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t flex justify-between">
              <p className="text-sm text-gray-500">¿Necesitas ayuda con la API?</p>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-medium">
                Ver documentación completa
              </a>
            </CardFooter>
          </Card>
        </main>
      </div>
      
      {/* Create API Key Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nueva clave API</DialogTitle>
            <DialogDescription>
              Esta clave tendrá acceso a todos los recursos de tu organización.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="key-name">Nombre de la clave</Label>
            <Input
              id="key-name"
              placeholder="ej. Integración con sitio web"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-2">
              Usa un nombre descriptivo para recordar dónde se usa esta clave.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateKey} 
              disabled={createKeyMutation.isPending || !newKeyName.trim()}
            >
              {createKeyMutation.isPending ? 'Creando...' : 'Crear clave API'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiSettings;
