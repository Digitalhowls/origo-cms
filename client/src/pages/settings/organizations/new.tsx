import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, Check, X } from 'lucide-react';

// Esquema para validar el formulario de nueva organización
const createOrganizationSchema = z.object({
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

type FormValues = z.infer<typeof createOrganizationSchema>;

export default function NewOrganizationPage() {
  const [slugAvailability, setSlugAvailability] = useState<'checking' | 'available' | 'unavailable' | null>(null);
  const [slugCheckTimeout, setSlugCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Configurar formulario con validación zod
  const form = useForm<FormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: '',
      slug: '',
      domain: '',
      subdomain: '',
      plan: 'free',
    },
  });

  // Mutación para crear organización
  const createOrgMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest('POST', '/api/organizations', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Organización creada',
        description: 'La organización ha sido creada correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
      setLocation('/settings/organizations');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear la organización',
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
    form.setValue('slug', value);
    
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
    form.setValue('name', value);
    
    // Generar slug solo si el usuario no ha modificado el slug manualmente
    if (!form.getValues('slug')) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/\s+/g, '-')  // Reemplazar espacios por guiones
        .replace(/[^a-z0-9-]/g, '')  // Eliminar caracteres no permitidos
        .substring(0, 50);  // Limitar longitud
      
      form.setValue('slug', generatedSlug);
      
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

  // Manejar envío del formulario
  const onSubmit = (data: FormValues) => {
    if (slugAvailability === 'unavailable') {
      toast({
        title: 'Slug no disponible',
        description: 'Por favor, elige otro identificador para tu organización.',
        variant: 'destructive',
      });
      return;
    }
    
    createOrgMutation.mutate(data);
  };

  // Renderizar indicador de disponibilidad del slug
  const renderSlugAvailability = () => {
    switch (slugAvailability) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case 'available':
        return (
          <div className="flex items-center text-green-600">
            <Check className="h-4 w-4 mr-1" />
            <span className="text-xs">Disponible</span>
          </div>
        );
      case 'unavailable':
        return (
          <div className="flex items-center text-destructive">
            <X className="h-4 w-4 mr-1" />
            <span className="text-xs">No disponible</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 rounded-full">
          <Link href="/settings/organizations">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Nueva organización</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información de la organización</CardTitle>
              <CardDescription>
                Proporciona los detalles básicos para tu nueva organización
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                  
                  <Tabs defaultValue="subdomain">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="subdomain">Subdominio</TabsTrigger>
                      <TabsTrigger value="custom-domain">Dominio personalizado</TabsTrigger>
                    </TabsList>
                    <TabsContent value="subdomain" className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
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
                        control={form.control}
                        name="domain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dominio personalizado</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="mi-organizacion.com" 
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Deberás configurar los registros DNS de tu dominio para apuntar a nuestros servidores.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" asChild>
                      <Link href="/settings/organizations">Cancelar</Link>
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createOrgMutation.isPending || slugAvailability === 'unavailable'}
                    >
                      {createOrgMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Crear organización
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Acerca de las organizaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                Las organizaciones te permiten organizar tu contenido y usuarios en espacios separados.
              </p>
              <p>
                Cada organización tiene:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Su propio contenido (páginas, blogs, cursos)</li>
                <li>Usuarios y permisos independientes</li>
                <li>Configuración de marca personalizada</li>
                <li>Estadísticas y analíticas separadas</li>
              </ul>
              <p>
                Puedes ser miembro de múltiples organizaciones y cambiar entre ellas fácilmente.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}