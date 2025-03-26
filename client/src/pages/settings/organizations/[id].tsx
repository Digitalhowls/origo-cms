import { useState, useEffect } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from '@/lib/queryClient';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, Save, Trash2, Globe, Users, Building, Brush } from 'lucide-react';

// Esquema para validar el formulario de organización
const organizationSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  slug: z
    .string()
    .min(1, 'El slug es obligatorio')
    .regex(/^[a-z0-9-]+$/, 'Solo se permiten letras minúsculas, números y guiones')
    .max(50, 'Máximo 50 caracteres'),
  domain: z.string().optional(),
  subdomain: z.string().optional(),
  plan: z.string().optional(),
});

// Esquema para branding
const brandingSchema = z.object({
  logo: z.string().optional(),
  favicon: z.string().optional(),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
  }),
  typography: z.object({
    fontFamily: z.string(),
    headings: z.string(),
  }),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;
type BrandingFormValues = z.infer<typeof brandingSchema>;

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

export default function OrganizationDetailsPage() {
  const [, params] = useRoute('/settings/organizations/:id');
  const organizationId = params?.id;
  const [slugAvailability, setSlugAvailability] = useState<'checking' | 'available' | 'unavailable' | null>(null);
  const [slugCheckTimeout, setSlugCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [domainStatus, setDomainStatus] = useState<'pending' | 'verified' | 'failed' | null>(null);
  const [domainVerificationToken, setDomainVerificationToken] = useState<string | null>(null);

  // Obtener datos de la organización
  const { 
    data: organization, 
    isLoading, 
    isError, 
    error 
  } = useQuery<Organization>({
    queryKey: [`/api/organizations/${organizationId}`],
    enabled: !!organizationId,
  });

  // Configurar formulario general con validación zod
  const generalForm = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      slug: '',
      domain: '',
      subdomain: '',
      plan: 'free',
    },
  });

  // Configurar formulario de branding
  const brandingForm = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      logo: '',
      favicon: '',
      colors: {
        primary: '#3b82f6',
        secondary: '#6366f1',
        accent: '#f97316',
      },
      typography: {
        fontFamily: 'sans',
        headings: 'sans',
      },
    },
  });

  // Actualizar formularios cuando se carguen los datos
  useEffect(() => {
    if (organization) {
      generalForm.reset({
        name: organization.name,
        slug: organization.slug,
        domain: organization.domain || '',
        subdomain: organization.subdomain || '',
        plan: organization.plan || 'free',
      });
      
      brandingForm.reset({
        logo: organization.logo || '',
        favicon: organization.favicon || '',
        colors: organization.colors || {
          primary: '#3b82f6',
          secondary: '#6366f1',
          accent: '#f97316',
        },
        typography: organization.typography || {
          fontFamily: 'sans',
          headings: 'sans',
        },
      });
    }
  }, [organization, generalForm, brandingForm]);

  // Mutación para actualizar la organización
  const updateOrgMutation = useMutation({
    mutationFn: async (data: OrganizationFormValues) => {
      const response = await apiRequest('PUT', `/api/organizations/${organizationId}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Organización actualizada',
        description: 'La organización ha sido actualizada correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/organizations/${organizationId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar la organización',
        variant: 'destructive',
      });
    },
  });

  // Mutación para actualizar el branding
  const updateBrandingMutation = useMutation({
    mutationFn: async (data: BrandingFormValues) => {
      const response = await apiRequest('PUT', `/api/organizations/${organizationId}/branding`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Branding actualizado',
        description: 'La configuración de marca ha sido actualizada correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/organizations/${organizationId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar la configuración de marca',
        variant: 'destructive',
      });
    },
  });

  // Mutación para eliminar organización
  const deleteOrgMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/organizations/${organizationId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Organización eliminada',
        description: 'La organización ha sido eliminada correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
      setLocation('/settings/organizations');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar la organización',
        variant: 'destructive',
      });
    },
  });
  
  // Mutación para configurar dominio personalizado
  const configureDomainMutation = useMutation({
    mutationFn: async (domain: string) => {
      const response = await apiRequest('POST', '/api/organizations/configure-domain', { 
        domain,
        organizationId: Number(organizationId)
      });
      return response.json();
    },
    onSuccess: (data) => {
      setDomainVerificationToken(data.verificationToken);
      
      if (data.verified) {
        setDomainStatus('verified');
        toast({
          title: 'Dominio verificado',
          description: data.message || 'El dominio ha sido verificado y configurado correctamente.',
        });
      } else {
        setDomainStatus('pending');
        toast({
          title: 'Verificación pendiente',
          description: 'Sigue las instrucciones para verificar tu dominio.',
        });
      }
      
      // Almacenar instrucciones si existen
      if (data.instructions) {
        // En caso de que se proporcionen instrucciones específicas, las podríamos almacenar
        // en un estado para mostrarlas
        console.log('Instrucciones de verificación:', data.instructions);
      }
      
      queryClient.invalidateQueries({ queryKey: [`/api/organizations/${organizationId}`] });
    },
    onError: (error: Error) => {
      setDomainStatus('failed');
      toast({
        title: 'Error',
        description: error.message || 'No se pudo configurar el dominio personalizado',
        variant: 'destructive',
      });
    },
  });

  // Verificar disponibilidad del slug cuando cambia
  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 1) {
      setSlugAvailability(null);
      return;
    }

    // No verificar si el slug es el mismo que ya tiene la organización
    if (organization && slug === organization.slug) {
      setSlugAvailability('available');
      return;
    }

    setSlugAvailability('checking');
    
    try {
      const response = await apiRequest('POST', '/api/organizations/check-domain', { domain: slug });
      const data = await response.json();
      
      setSlugAvailability(data.available ? 'available' : 'unavailable');
    } catch (error) {
      console.error('Error checking slug availability:', error);
      setSlugAvailability(null);
    }
  };

  // Manejar cambios en el campo slug con debounce
  const handleSlugChange = (value: string) => {
    generalForm.setValue('slug', value);
    
    // Cancelar timeout anterior si existe
    if (slugCheckTimeout) {
      clearTimeout(slugCheckTimeout);
    }
    
    // Establecer nuevo timeout para verificar disponibilidad
    const timeout = setTimeout(() => {
      checkSlugAvailability(value);
    }, 500);
    
    setSlugCheckTimeout(timeout);
  };

  // Auto-generar slug a partir del nombre
  const handleNameChange = (value: string) => {
    generalForm.setValue('name', value);
    
    // Generar slug solo si el usuario no ha modificado el slug manualmente
    if (!generalForm.getValues('slug') || generalForm.getValues('slug') === organization?.slug) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/\s+/g, '-')  // Reemplazar espacios por guiones
        .replace(/[^a-z0-9-]/g, '')  // Eliminar caracteres no permitidos
        .substring(0, 50);  // Limitar longitud
      
      generalForm.setValue('slug', generatedSlug);
      
      // Verificar disponibilidad del slug generado
      if (slugCheckTimeout) {
        clearTimeout(slugCheckTimeout);
      }
      
      const timeout = setTimeout(() => {
        checkSlugAvailability(generatedSlug);
      }, 500);
      
      setSlugCheckTimeout(timeout);
    }
  };

  // Manejar envío del formulario general
  const onSubmitGeneral = (data: OrganizationFormValues) => {
    if (slugAvailability === 'unavailable' && data.slug !== organization?.slug) {
      toast({
        title: 'Slug no disponible',
        description: 'Por favor, elige otro identificador para tu organización.',
        variant: 'destructive',
      });
      return;
    }
    
    updateOrgMutation.mutate(data);
  };

  // Manejar envío del formulario de branding
  const onSubmitBranding = (data: BrandingFormValues) => {
    updateBrandingMutation.mutate(data);
  };

  // Manejar eliminación de organización
  const handleDelete = () => {
    deleteOrgMutation.mutate();
  };
  
  // Manejar verificación de dominio personalizado
  const handleVerifyDomain = (domain: string) => {
    if (!domain) {
      toast({
        title: 'Dominio requerido',
        description: 'Por favor, ingresa un dominio para verificar.',
        variant: 'destructive',
      });
      return;
    }
    
    // Validar formato del dominio
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      toast({
        title: 'Formato de dominio inválido',
        description: 'Por favor, ingresa un dominio válido (ej: mi-dominio.com).',
        variant: 'destructive',
      });
      return;
    }
    
    configureDomainMutation.mutate(domain);
  };

  // Renderizar indicador de disponibilidad del slug
  const renderSlugAvailability = () => {
    if (organization && generalForm.getValues('slug') === organization.slug) {
      return null;
    }
    
    switch (slugAvailability) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case 'available':
        return (
          <div className="flex items-center text-green-600 text-xs">
            Disponible
          </div>
        );
      case 'unavailable':
        return (
          <div className="flex items-center text-destructive text-xs">
            No disponible
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 rounded-full">
            <Link href="/settings/organizations">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        
        <div className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 rounded-full">
            <Link href="/settings/organizations">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Error</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">No se pudo cargar la organización</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'Ha ocurrido un error al cargar la información de la organización.'}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: [`/api/organizations/${organizationId}`] })}
            >
              Reintentar
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 rounded-full">
            <Link href="/settings/organizations">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Organización no encontrada</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Organización no encontrada</CardTitle>
            <CardDescription>
              No se encontró la organización solicitada.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/settings/organizations">Volver a organizaciones</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 rounded-full">
            <Link href="/settings/organizations">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{organization.name}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setConfirmDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar organización
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="general">
            <Building className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="branding">
            <Brush className="h-4 w-4 mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Usuarios
          </TabsTrigger>
        </TabsList>
        
        {/* Pestaña General */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <Form {...generalForm}>
              <form onSubmit={generalForm.handleSubmit(onSubmitGeneral)}>
                <CardHeader>
                  <CardTitle>Información general</CardTitle>
                  <CardDescription>
                    Configura la información básica de tu organización
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={generalForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la organización</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Mi organización" 
                            {...field}
                            onChange={(e) => handleNameChange(e.target.value)}
                          />
                        </FormControl>
                        <FormDescription>
                          Este es el nombre que se mostrará en toda la interfaz.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={generalForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Identificador (slug)</FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input 
                              placeholder="mi-organizacion" 
                              {...field}
                              onChange={(e) => handleSlugChange(e.target.value)}
                            />
                          </FormControl>
                          {renderSlugAvailability()}
                        </div>
                        <FormDescription>
                          Este identificador único se utilizará en URLs y APIs.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Separator />
                  
                  <Tabs defaultValue="subdomain">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="subdomain">Subdominio</TabsTrigger>
                      <TabsTrigger value="custom-domain">Dominio personalizado</TabsTrigger>
                    </TabsList>
                    <TabsContent value="subdomain" className="space-y-4 pt-4">
                      <FormField
                        control={generalForm.control}
                        name="subdomain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subdominio</FormLabel>
                            <div className="flex items-center">
                              <FormControl>
                                <Input 
                                  placeholder="mi-organizacion" 
                                  {...field}
                                />
                              </FormControl>
                              <span className="ml-2 text-muted-foreground">.origo.app</span>
                            </div>
                            <FormDescription>
                              Tu sitio estará disponible en este subdominio.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    <TabsContent value="custom-domain" className="space-y-4 pt-4">
                      <FormField
                        control={generalForm.control}
                        name="domain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dominio personalizado</FormLabel>
                            <div className="flex items-center gap-2">
                              <FormControl>
                                <Input 
                                  placeholder="mi-organizacion.com" 
                                  {...field}
                                />
                              </FormControl>
                              <Button 
                                type="button" 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleVerifyDomain(field.value)}
                                disabled={!field.value || configureDomainMutation.isPending}
                              >
                                {configureDomainMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <Globe className="h-4 w-4 mr-2" />
                                )}
                                Verificar
                              </Button>
                            </div>
                            <FormDescription>
                              Deberás configurar los registros DNS de tu dominio para apuntar a nuestros servidores.
                            </FormDescription>
                            {domainStatus === 'verified' && (
                              <div className="mt-2 text-sm text-green-600 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                Dominio verificado correctamente
                              </div>
                            )}
                            {domainStatus === 'pending' && (
                              <div className="mt-2 text-sm text-orange-500 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                Verificación pendiente. Configura tus registros DNS.
                              </div>
                            )}
                            {domainStatus === 'failed' && (
                              <div className="mt-2 text-sm text-destructive flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                Verificación fallida. Revisa la configuración DNS.
                              </div>
                            )}
                            {domainVerificationToken && (
                              <div className="mt-3 p-3 bg-muted rounded-md">
                                <div className="text-sm font-medium mb-2">Instrucciones de verificación:</div>
                                <p className="text-xs mb-3">
                                  Para verificar la propiedad de tu dominio, añade uno de los siguientes registros TXT en tu proveedor de DNS.
                                  Después de agregar el registro, espera unos minutos y haz clic en "Verificar" nuevamente.
                                </p>
                                
                                <div className="mb-3">
                                  <div className="text-xs font-medium mb-1">Opción 1: Registro TXT en el dominio principal</div>
                                  <div className="grid grid-cols-2 gap-2 text-xs bg-background p-2 rounded-md">
                                    <div className="font-medium">Tipo:</div>
                                    <div>TXT</div>
                                    <div className="font-medium">Nombre/Host:</div>
                                    <div>@</div>
                                    <div className="font-medium">Valor:</div>
                                    <div className="break-all font-mono text-xs">{domainVerificationToken}</div>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="text-xs font-medium mb-1">Opción 2: Registro TXT en subdominio especial</div>
                                  <div className="grid grid-cols-2 gap-2 text-xs bg-background p-2 rounded-md">
                                    <div className="font-medium">Tipo:</div>
                                    <div>TXT</div>
                                    <div className="font-medium">Nombre/Host:</div>
                                    <div>_origo-verify</div>
                                    <div className="font-medium">Valor:</div>
                                    <div className="break-all font-mono text-xs">{domainVerificationToken}</div>
                                  </div>
                                </div>
                                
                                <div className="mt-3 text-xs">
                                  <div className="font-medium mb-1">Ayuda para proveedores DNS comunes:</div>
                                  <ul className="list-disc list-inside space-y-1">
                                    <li><span className="font-medium">Cloudflare:</span> DNS → Añadir registro → Selecciona TXT</li>
                                    <li><span className="font-medium">GoDaddy:</span> DNS Management → Add → Type: TXT</li>
                                    <li><span className="font-medium">Namecheap:</span> Advanced DNS → Add New Record → TXT Record</li>
                                    <li><span className="font-medium">Google Domains:</span> DNS → Manage Custom Records → Create new record → TXT</li>
                                  </ul>
                                </div>
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    disabled={updateOrgMutation.isPending || slugAvailability === 'unavailable'}
                  >
                    {updateOrgMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Save className="mr-2 h-4 w-4" />
                    Guardar cambios
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
        
        {/* Pestaña Branding */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <Form {...brandingForm}>
              <form onSubmit={brandingForm.handleSubmit(onSubmitBranding)}>
                <CardHeader>
                  <CardTitle>Configuración de marca</CardTitle>
                  <CardDescription>
                    Personaliza la apariencia de tu organización
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={brandingForm.control}
                      name="logo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL del logotipo</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://ejemplo.com/logo.png" 
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>
                            URL de la imagen del logotipo de tu organización.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={brandingForm.control}
                      name="favicon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL del favicon</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://ejemplo.com/favicon.ico" 
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>
                            URL del icono que se muestra en las pestañas del navegador.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <h3 className="text-lg font-medium">Colores</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={brandingForm.control}
                      name="colors.primary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color primario</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input 
                                type="color"
                                {...field}
                                className="w-12 h-10 p-1"
                              />
                            </FormControl>
                            <FormControl>
                              <Input 
                                {...field}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                          </div>
                          <FormDescription>
                            Color principal de la marca.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={brandingForm.control}
                      name="colors.secondary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color secundario</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input 
                                type="color"
                                {...field}
                                className="w-12 h-10 p-1"
                              />
                            </FormControl>
                            <FormControl>
                              <Input 
                                {...field}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                          </div>
                          <FormDescription>
                            Color secundario de la marca.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={brandingForm.control}
                      name="colors.accent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color de acento</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input 
                                type="color"
                                {...field}
                                className="w-12 h-10 p-1"
                              />
                            </FormControl>
                            <FormControl>
                              <Input 
                                {...field}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                          </div>
                          <FormDescription>
                            Color para destacar elementos.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <h3 className="text-lg font-medium">Tipografía</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={brandingForm.control}
                      name="typography.fontFamily"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fuente principal</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Nombre de la fuente o familia" 
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Fuente utilizada para el texto general.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={brandingForm.control}
                      name="typography.headings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fuente para títulos</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Nombre de la fuente para títulos" 
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Fuente utilizada para los títulos y encabezados.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    disabled={updateBrandingMutation.isPending}
                  >
                    {updateBrandingMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Save className="mr-2 h-4 w-4" />
                    Guardar configuración
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
        
        {/* Pestaña Usuarios */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios de la organización</CardTitle>
              <CardDescription>
                Gestiona los usuarios que tienen acceso a esta organización
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Implementación pendiente. Esta sección permitirá gestionar los usuarios que tienen acceso a la organización.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Diálogo de confirmación para eliminar organización */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la organización <strong>{organization?.name}</strong> y todo su contenido.
              No podrás recuperar esta información.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
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