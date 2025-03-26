import React, { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useOrganizationStore } from '@/lib/store';
import MediaLibrary from '@/components/media/MediaLibrary';
import { 
  Globe, 
  Palette, 
  Type, 
  Image, 
  Save,
  Undo,
  PlusCircle,
  XCircle,
  Check
} from 'lucide-react';

interface BrandingFormData {
  name: string;
  domain: string;
  subdomain: string;
  logo: string;
  favicon: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  typography: {
    fontFamily: string;
    headings: string;
  };
}

const BrandingSettings: React.FC = () => {
  const { toast } = useToast();
  const { organizationBranding, setOrganizationBranding } = useOrganizationStore();
  const [activeTab, setActiveTab] = useState('general');
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'logo' | 'favicon'>('logo');
  const [hasChanges, setHasChanges] = useState(false);
  
  // Google fonts options
  const googleFonts = [
    "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", 
    "Poppins", "Raleway", "Oswald", "Merriweather", "Playfair Display"
  ];
  
  // Form state
  const [formData, setFormData] = useState<BrandingFormData>({
    name: '',
    domain: '',
    subdomain: '',
    logo: '',
    favicon: '',
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#8B5CF6',
    },
    typography: {
      fontFamily: 'Inter',
      headings: 'Inter',
    },
  });
  
  // Fetch organization branding
  const { data, isLoading } = useQuery({
    queryKey: ['/api/organizations/branding'],
    queryFn: async () => {
      const response = await fetch('/api/organizations/branding', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch branding data');
      return response.json();
    },
  });
  
  // Update branding from fetched data
  useEffect(() => {
    if (data) {
      setFormData(data);
      setOrganizationBranding(data);
    }
  }, [data, setOrganizationBranding]);
  
  // Save branding mutation
  const saveBrandingMutation = useMutation({
    mutationFn: async (brandingData: BrandingFormData) => {
      return apiRequest('PATCH', '/api/organizations/branding', brandingData);
    },
    onSuccess: (data) => {
      setOrganizationBranding(data);
      setHasChanges(false);
      toast({
        title: "Cambios guardados",
        description: "La configuración de marca ha sido actualizada correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudieron guardar los cambios: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  // Check domain availability mutation
  const checkDomainMutation = useMutation({
    mutationFn: async (domain: string) => {
      return apiRequest('POST', '/api/organizations/check-domain', { domain });
    },
    onSuccess: (data) => {
      if (data.available) {
        toast({
          title: "Dominio disponible",
          description: "El subdominio está disponible para su uso.",
        });
      } else {
        toast({
          title: "Dominio no disponible",
          description: "Este subdominio ya está en uso. Por favor, elija otro.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo verificar el subdominio: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setHasChanges(true);
  };
  
  const handleColorChange = (key: keyof typeof formData.colors, value: string) => {
    setFormData({
      ...formData,
      colors: { ...formData.colors, [key]: value },
    });
    setHasChanges(true);
  };
  
  const handleTypographyChange = (key: keyof typeof formData.typography, value: string) => {
    setFormData({
      ...formData,
      typography: { ...formData.typography, [key]: value },
    });
    setHasChanges(true);
  };
  
  const handleMediaSelect = (media: any) => {
    if (mediaType === 'logo') {
      setFormData({ ...formData, logo: media.url });
    } else {
      setFormData({ ...formData, favicon: media.url });
    }
    setIsMediaLibraryOpen(false);
    setHasChanges(true);
  };
  
  const openMediaLibrary = (type: 'logo' | 'favicon') => {
    setMediaType(type);
    setIsMediaLibraryOpen(true);
  };
  
  const handleCheckDomain = () => {
    if (formData.subdomain.trim() !== '') {
      checkDomainMutation.mutate(formData.subdomain);
    }
  };
  
  const handleSaveChanges = () => {
    saveBrandingMutation.mutate(formData);
  };
  
  const handleResetChanges = () => {
    if (data) {
      setFormData(data);
      setHasChanges(false);
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar 
          pageTitle="Configuración de Marca" 
          actions={
            <div className="flex space-x-2">
              {hasChanges && (
                <Button variant="outline" onClick={handleResetChanges}>
                  <Undo className="h-4 w-4 mr-1" />
                  Descartar
                </Button>
              )}
              <Button onClick={handleSaveChanges} disabled={!hasChanges || saveBrandingMutation.isPending}>
                <Save className="h-4 w-4 mr-1" />
                {saveBrandingMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          }
        />
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="general">
                  <Globe className="h-4 w-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger value="appearance">
                  <Palette className="h-4 w-4 mr-2" />
                  Apariencia
                </TabsTrigger>
                <TabsTrigger value="typography">
                  <Type className="h-4 w-4 mr-2" />
                  Tipografía
                </TabsTrigger>
              </TabsList>
              
              {/* General Settings */}
              <TabsContent value="general">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Información general</CardTitle>
                      <CardDescription>
                        Configura la información básica de tu organización.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre de la organización</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="domain">Dominio personalizado</Label>
                        <Input
                          id="domain"
                          name="domain"
                          value={formData.domain}
                          onChange={handleInputChange}
                          placeholder="ejemplo.com"
                        />
                        <p className="text-xs text-gray-500">
                          Para usar un dominio personalizado, deberás configurar tus DNS.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subdomain">Subdominio</Label>
                        <div className="flex space-x-2">
                          <div className="flex-1">
                            <div className="flex rounded-md shadow-sm">
                              <Input
                                id="subdomain"
                                name="subdomain"
                                value={formData.subdomain}
                                onChange={handleInputChange}
                                className="rounded-none rounded-l-md"
                              />
                              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                .origo.app
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={handleCheckDomain}
                            disabled={checkDomainMutation.isPending}
                          >
                            {checkDomainMutation.isPending ? 'Verificando...' : 'Verificar'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Identidad visual</CardTitle>
                      <CardDescription>
                        Configura el logo y favicon para tu organización.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Logo</Label>
                        <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 h-40">
                          {formData.logo ? (
                            <div className="relative w-full h-full">
                              <img 
                                src={formData.logo} 
                                alt="Logo" 
                                className="max-h-full max-w-full mx-auto object-contain"
                              />
                              <div className="absolute top-2 right-2 flex space-x-1">
                                <Button 
                                  size="sm" 
                                  variant="secondary" 
                                  className="h-8 w-8 p-0" 
                                  onClick={() => openMediaLibrary('logo')}
                                >
                                  <PlusCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  className="h-8 w-8 p-0" 
                                  onClick={() => {
                                    setFormData({ ...formData, logo: '' });
                                    setHasChanges(true);
                                  }}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button 
                              variant="outline" 
                              onClick={() => openMediaLibrary('logo')}
                            >
                              <Image className="h-4 w-4 mr-1" />
                              Seleccionar logo
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Recomendado: SVG o PNG transparente, altura mínima 80px.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Favicon</Label>
                        <div className="flex items-center gap-4">
                          <div className="border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center h-16 w-16">
                            {formData.favicon ? (
                              <div className="relative w-full h-full">
                                <img 
                                  src={formData.favicon} 
                                  alt="Favicon" 
                                  className="max-h-full max-w-full mx-auto object-contain"
                                />
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  className="absolute -top-2 -right-2 h-5 w-5 p-0" 
                                  onClick={() => {
                                    setFormData({ ...formData, favicon: '' });
                                    setHasChanges(true);
                                  }}
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <Image className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          
                          <Button 
                            variant="outline" 
                            onClick={() => openMediaLibrary('favicon')}
                          >
                            {formData.favicon ? 'Cambiar favicon' : 'Seleccionar favicon'}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Recomendado: Imagen cuadrada (32x32px o 64x64px) en formato PNG o ICO.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Appearance Settings */}
              <TabsContent value="appearance">
                <Card>
                  <CardHeader>
                    <CardTitle>Colores de marca</CardTitle>
                    <CardDescription>
                      Configura los colores principales de tu marca.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="color-primary">Color primario</Label>
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-10 w-10 rounded-md border"
                            style={{ backgroundColor: formData.colors.primary }}
                          />
                          <Input
                            id="color-primary"
                            type="text"
                            value={formData.colors.primary}
                            onChange={(e) => handleColorChange('primary', e.target.value)}
                          />
                          <input
                            type="color"
                            value={formData.colors.primary}
                            onChange={(e) => handleColorChange('primary', e.target.value)}
                            className="h-10 w-10 rounded overflow-hidden cursor-pointer"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Usado para botones, enlaces y elementos de acción.
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="color-secondary">Color secundario</Label>
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-10 w-10 rounded-md border"
                            style={{ backgroundColor: formData.colors.secondary }}
                          />
                          <Input
                            id="color-secondary"
                            type="text"
                            value={formData.colors.secondary}
                            onChange={(e) => handleColorChange('secondary', e.target.value)}
                          />
                          <input
                            type="color"
                            value={formData.colors.secondary}
                            onChange={(e) => handleColorChange('secondary', e.target.value)}
                            className="h-10 w-10 rounded overflow-hidden cursor-pointer"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Usado para elementos complementarios y estados secundarios.
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="color-accent">Color de acento</Label>
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-10 w-10 rounded-md border"
                            style={{ backgroundColor: formData.colors.accent }}
                          />
                          <Input
                            id="color-accent"
                            type="text"
                            value={formData.colors.accent}
                            onChange={(e) => handleColorChange('accent', e.target.value)}
                          />
                          <input
                            type="color"
                            value={formData.colors.accent}
                            onChange={(e) => handleColorChange('accent', e.target.value)}
                            className="h-10 w-10 rounded overflow-hidden cursor-pointer"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Usado para elementos destacados y acentos visuales.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-8 border rounded-md p-6">
                      <h3 className="text-lg font-medium mb-4">Vista previa</h3>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                          <Button style={{ backgroundColor: formData.colors.primary }}>
                            Botón primario
                          </Button>
                          <Button variant="outline" style={{ borderColor: formData.colors.primary, color: formData.colors.primary }}>
                            Botón outline
                          </Button>
                          <Button variant="ghost" style={{ color: formData.colors.primary }}>
                            Botón ghost
                          </Button>
                        </div>
                        
                        <div className="py-3 border-t border-b flex gap-6">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full" style={{ backgroundColor: formData.colors.primary }}></div>
                            <span>Primario</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full" style={{ backgroundColor: formData.colors.secondary }}></div>
                            <span>Secundario</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full" style={{ backgroundColor: formData.colors.accent }}></div>
                            <span>Acento</span>
                          </div>
                        </div>
                        
                        <div>
                          <p>Texto normal y <a href="#" style={{ color: formData.colors.primary }}>enlaces</a> con el color primario.</p>
                          <div className="mt-2 p-3 rounded" style={{ backgroundColor: formData.colors.primary, color: "white" }}>
                            Fondo con color primario
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Typography Settings */}
              <TabsContent value="typography">
                <Card>
                  <CardHeader>
                    <CardTitle>Tipografía</CardTitle>
                    <CardDescription>
                      Selecciona las fuentes para tu contenido.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="font-family">Fuente principal</Label>
                        <Select
                          value={formData.typography.fontFamily}
                          onValueChange={(value) => handleTypographyChange('fontFamily', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar fuente" />
                          </SelectTrigger>
                          <SelectContent>
                            {googleFonts.map((font) => (
                              <SelectItem key={font} value={font}>
                                {font}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Fuente utilizada para el texto general del sitio.
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="headings-font">Fuente para títulos</Label>
                        <Select
                          value={formData.typography.headings}
                          onValueChange={(value) => handleTypographyChange('headings', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar fuente" />
                          </SelectTrigger>
                          <SelectContent>
                            {googleFonts.map((font) => (
                              <SelectItem key={font} value={font}>
                                {font}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Fuente utilizada para los títulos y encabezados.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-8 border rounded-md p-6">
                      <h3 className="text-lg font-medium mb-4">Vista previa de tipografía</h3>
                      <div className="space-y-4">
                        <div 
                          style={{ fontFamily: formData.typography.headings || 'Inter' }}
                          className="space-y-2"
                        >
                          <h1 className="text-3xl font-bold">Título principal (H1)</h1>
                          <h2 className="text-2xl font-semibold">Subtítulo (H2)</h2>
                          <h3 className="text-xl font-medium">Encabezado (H3)</h3>
                        </div>
                        
                        <div 
                          style={{ fontFamily: formData.typography.fontFamily || 'Inter' }}
                          className="mt-4"
                        >
                          <p className="mb-2">Texto normal en párrafo con la fuente principal seleccionada. Este es un ejemplo de cómo se verá el contenido en tu sitio web.</p>
                          <p><strong>Texto en negrita</strong> y <em>texto en cursiva</em> para ver diferentes estilos.</p>
                          <p className="mt-2">
                            <a href="#" style={{ color: formData.colors.primary }}>Este es un ejemplo de enlace</a> con el color primario seleccionado.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
      
      {/* Media Library Modal */}
      <MediaLibrary 
        isOpen={isMediaLibraryOpen} 
        onClose={() => setIsMediaLibraryOpen(false)}
        onSelectMedia={handleMediaSelect}
        selectedMedia={null}
      />
    </div>
  );
};

export default BrandingSettings;
