import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Check, Globe, Database, RefreshCw, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardShell } from '@/components/dashboard-shell';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export default function ImportPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('wordpress');
  const [siteUrl, setSiteUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [siteInfo, setSiteInfo] = useState<any>(null);
  const [options, setOptions] = useState({
    importPages: true,
    importPosts: true,
    importMedia: true,
    importCategories: true,
    importTags: true
  });

  // Estado de la importación
  const [importStarted, setImportStarted] = useState(false);

  // Consulta para verificar el estado de la importación
  const { data: importStatus, isLoading: isStatusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/wordpress/import/status'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/wordpress/import/status');
      return response.json();
    },
    enabled: importStarted,
    refetchInterval: importStarted ? 5000 : false,
  });

  // Mutación para verificar la conexión con WordPress
  const checkConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/wordpress/import/check-connection', {
        siteUrl,
        username: username || undefined,
        password: password || undefined
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Conexión exitosa",
          description: "Se ha verificado la conexión con el sitio WordPress.",
          variant: "default",
        });
        setSiteInfo(data.siteInfo);
      } else {
        toast({
          title: "Error de conexión",
          description: data.message || "No se pudo conectar al sitio WordPress.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al verificar la conexión: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutación para iniciar la importación
  const startImportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/wordpress/import/start', {
        siteUrl,
        username: username || undefined,
        password: password || undefined,
        options
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Importación iniciada",
        description: "La importación de WordPress ha comenzado en segundo plano.",
        variant: "default",
      });
      setImportStarted(true);
      refetchStatus();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al iniciar la importación: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleCheckConnection = () => {
    if (!siteUrl) {
      toast({
        title: "URL requerida",
        description: "Por favor, ingrese la URL del sitio WordPress.",
        variant: "destructive",
      });
      return;
    }
    checkConnectionMutation.mutate();
  };

  const handleStartImport = () => {
    if (!siteUrl) {
      toast({
        title: "URL requerida",
        description: "Por favor, ingrese la URL del sitio WordPress.",
        variant: "destructive",
      });
      return;
    }
    startImportMutation.mutate();
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Importar Contenido"
        text="Importa contenido de fuentes externas como WordPress"
      />

      <Tabs defaultValue="wordpress" className="w-full" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="wordpress">WordPress</TabsTrigger>
          <TabsTrigger value="other" disabled>Otras fuentes</TabsTrigger>
        </TabsList>

        <TabsContent value="wordpress" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Importador de WordPress
                </CardTitle>
                <CardDescription>
                  Importa contenido desde un sitio WordPress existente utilizando la API REST de WordPress.
                  Se pueden importar páginas, posts, medios, categorías y etiquetas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="site-url">URL del sitio WordPress</Label>
                    <Input
                      id="site-url"
                      placeholder="https://misitio.com"
                      value={siteUrl}
                      onChange={(e) => setSiteUrl(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Introduce la URL completa de tu sitio WordPress.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="username">Usuario (opcional)</Label>
                      <Input
                        id="username"
                        placeholder="admin"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña (opcional)</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Atención</AlertTitle>
                    <AlertDescription>
                      Las credenciales solo son necesarias si tu contenido está protegido. Si tu sitio WordPress tiene
                      contenido público, puedes dejarlo en blanco.
                    </AlertDescription>
                  </Alert>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleCheckConnection}
                      disabled={checkConnectionMutation.isPending || !siteUrl}
                    >
                      {checkConnectionMutation.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        "Verificar conexión"
                      )}
                    </Button>
                  </div>

                  {siteInfo && (
                    <div className="mt-6 space-y-4">
                      <div className="rounded-md bg-muted p-4">
                        <h3 className="font-medium">Información del sitio</h3>
                        <p className="text-sm text-muted-foreground">{siteInfo.name}</p>
                        <p className="text-sm text-muted-foreground">{siteInfo.description}</p>
                        <p className="text-sm text-muted-foreground">{siteInfo.url}</p>

                        <Separator className="my-4" />

                        <h4 className="mb-2 font-medium">Contenido disponible</h4>
                        <ul className="grid gap-2 sm:grid-cols-2">
                          <li className="flex items-center">
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            <span>{siteInfo.resources?.posts || 0} Entradas</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            <span>{siteInfo.resources?.pages || 0} Páginas</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            <span>{siteInfo.resources?.media || 0} Archivos multimedia</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            <span>{siteInfo.resources?.categories || 0} Categorías</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            <span>{siteInfo.resources?.tags || 0} Etiquetas</span>
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium">Opciones de importación</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="import-pages"
                              checked={options.importPages}
                              onCheckedChange={(checked) =>
                                setOptions({ ...options, importPages: !!checked })
                              }
                            />
                            <Label htmlFor="import-pages">Importar páginas</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="import-posts"
                              checked={options.importPosts}
                              onCheckedChange={(checked) =>
                                setOptions({ ...options, importPosts: !!checked })
                              }
                            />
                            <Label htmlFor="import-posts">Importar entradas</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="import-media"
                              checked={options.importMedia}
                              onCheckedChange={(checked) =>
                                setOptions({ ...options, importMedia: !!checked })
                              }
                            />
                            <Label htmlFor="import-media">Importar medios</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="import-categories"
                              checked={options.importCategories}
                              onCheckedChange={(checked) =>
                                setOptions({ ...options, importCategories: !!checked })
                              }
                            />
                            <Label htmlFor="import-categories">Importar categorías</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="import-tags"
                              checked={options.importTags}
                              onCheckedChange={(checked) =>
                                setOptions({ ...options, importTags: !!checked })
                              }
                            />
                            <Label htmlFor="import-tags">Importar etiquetas</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {importStarted && importStatus && (
                    <div className="mt-6 space-y-4">
                      <Alert variant={importStatus.status === 'completed' ? 'default' : 'destructive'}>
                        {importStatus.status === 'completed' ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        )}
                        <AlertTitle>
                          {importStatus.status === 'completed'
                            ? 'Importación completada'
                            : 'Importación en progreso'}
                        </AlertTitle>
                        <AlertDescription>
                          {importStatus.message || 'Procesando contenido de WordPress...'}
                        </AlertDescription>
                      </Alert>

                      {importStatus.status === 'completed' && importStatus.stats && (
                        <div className="rounded-md bg-muted p-4">
                          <h3 className="font-medium">Resumen de importación</h3>
                          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                            <li className="flex items-center">
                              <Check className="mr-2 h-4 w-4 text-green-500" />
                              <span>{importStatus.stats.pages} Páginas importadas</span>
                            </li>
                            <li className="flex items-center">
                              <Check className="mr-2 h-4 w-4 text-green-500" />
                              <span>{importStatus.stats.posts} Entradas importadas</span>
                            </li>
                            <li className="flex items-center">
                              <Check className="mr-2 h-4 w-4 text-green-500" />
                              <span>{importStatus.stats.media} Archivos multimedia importados</span>
                            </li>
                            <li className="flex items-center">
                              <Check className="mr-2 h-4 w-4 text-green-500" />
                              <span>{importStatus.stats.categories} Categorías importadas</span>
                            </li>
                            <li className="flex items-center">
                              <Check className="mr-2 h-4 w-4 text-green-500" />
                              <span>{importStatus.stats.tags} Etiquetas importadas</span>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                {siteInfo && !importStarted && (
                  <Button 
                    onClick={handleStartImport} 
                    disabled={startImportMutation.isPending}
                  >
                    {startImportMutation.isPending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Iniciando...
                      </>
                    ) : (
                      <>
                        <FileDown className="mr-2 h-4 w-4" />
                        Iniciar importación
                      </>
                    )}
                  </Button>
                )}
                {importStatus && importStatus.status === 'completed' && (
                  <Button variant="outline" onClick={() => {
                    setImportStarted(false);
                    setSiteInfo(null);
                    setSiteUrl('');
                    setUsername('');
                    setPassword('');
                    queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
                    queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
                    queryClient.invalidateQueries({ queryKey: ['/api/media'] });
                  }}>
                    Importar otro sitio
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}