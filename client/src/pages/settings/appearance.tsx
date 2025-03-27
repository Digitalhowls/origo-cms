import React, { useState, useEffect } from 'react';
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
import BlockStylesPanel from '@/components/ui/page-builder/settings/BlockStylesPanel';
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Save,
  Undo,
  Palette,
  Layout,
  Settings,
  Monitor,
  Moon,
  Sun,
  ArrowRightLeft,
  Globe,
  Type,
  Image,
  LayoutGrid,
  Box,
  Columns
} from 'lucide-react';

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  layout: 'default' | 'compact' | 'spacious';
  radius: number;
  animations: boolean;
  menuPosition: 'left' | 'right';
  menuStyle: 'vertical' | 'horizontal';
  variantStyle: 'professional' | 'tint' | 'vibrant';
  // Configuraciones para páginas web
  webFontFamily: 'sans' | 'serif' | 'mono' | 'custom';
  webCustomFont: string;
  webHeadingFont: 'sans' | 'serif' | 'mono' | 'custom';
  webCustomHeadingFont: string;
  webColorPalette: 'default' | 'corporate' | 'creative' | 'elegant' | 'vibrant' | 'custom';
  webCustomColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  webSpacingScale: 'compact' | 'standard' | 'airy';
  webComponentStyle: 'flat' | 'soft' | 'neumorph' | 'glassmorphism';
  webAnimationsLevel: 'none' | 'minimal' | 'moderate' | 'playful';
  webLayoutType: 'responsive' | 'fixed' | 'fluid';
  webNavStyle: 'standard' | 'minimal' | 'prominent';
  webFooterStyle: 'simple' | 'detailed' | 'minimal';
}

const AppearanceSettings: React.FC = () => {
  const { toast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);
  
  // Form state
  const [settings, setSettings] = useState<AppearanceSettings>({
    theme: 'light',
    layout: 'default',
    radius: 0.5,
    animations: true,
    menuPosition: 'left',
    menuStyle: 'vertical',
    variantStyle: 'professional',
    // Valores por defecto para web
    webFontFamily: 'sans',
    webCustomFont: '',
    webHeadingFont: 'sans',
    webCustomHeadingFont: '',
    webColorPalette: 'default',
    webCustomColors: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      accent: '#f43f5e',
      background: '#ffffff',
      text: '#1f2937'
    },
    webSpacingScale: 'standard',
    webComponentStyle: 'flat',
    webAnimationsLevel: 'minimal',
    webLayoutType: 'responsive',
    webNavStyle: 'standard',
    webFooterStyle: 'simple'
  });
  
  // Fetch appearance settings
  const { data, isLoading } = useQuery({
    queryKey: ['/api/settings/appearance'],
    queryFn: async () => {
      const response = await fetch('/api/settings/appearance', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch appearance settings');
      return response.json();
    },
  });
  
  // Update settings from fetched data
  useEffect(() => {
    if (data) {
      setSettings(data);
    }
  }, [data]);
  
  // Save appearance settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsData: AppearanceSettings) => {
      return apiRequest('PATCH', '/api/settings/appearance', settingsData);
    },
    onSuccess: () => {
      setHasChanges(false);
      toast({
        title: "Cambios guardados",
        description: "La apariencia ha sido actualizada correctamente.",
      });
      
      // In a real app, you might need to reload some components to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudieron guardar los cambios: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  const handleSettingChange = <K extends keyof AppearanceSettings>(
    key: K, 
    value: AppearanceSettings[K]
  ) => {
    setSettings({
      ...settings,
      [key]: value,
    });
    setHasChanges(true);
  };
  
  const handleSaveChanges = () => {
    saveSettingsMutation.mutate(settings);
  };
  
  const handleResetChanges = () => {
    if (data) {
      setSettings(data);
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
          pageTitle="Configuración de Apariencia" 
          actions={
            <div className="flex space-x-2">
              {hasChanges && (
                <Button variant="outline" onClick={handleResetChanges}>
                  <Undo className="h-4 w-4 mr-1" />
                  Descartar
                </Button>
              )}
              <Button onClick={handleSaveChanges} disabled={!hasChanges || saveSettingsMutation.isPending}>
                <Save className="h-4 w-4 mr-1" />
                {saveSettingsMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
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
            <Tabs defaultValue="general">
              <TabsList className="mb-6">
                <TabsTrigger value="general">
                  <Settings className="h-4 w-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger value="theme">
                  <Palette className="h-4 w-4 mr-2" />
                  Tema
                </TabsTrigger>
                <TabsTrigger value="layout">
                  <Layout className="h-4 w-4 mr-2" />
                  Diseño
                </TabsTrigger>
                <TabsTrigger value="web">
                  <Globe className="h-4 w-4 mr-2" />
                  Web
                </TabsTrigger>
                <TabsTrigger value="blocks">
                  <Box className="h-4 w-4 mr-2" />
                  Bloques
                </TabsTrigger>
              </TabsList>
              
              {/* General Settings */}
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración general</CardTitle>
                    <CardDescription>
                      Personaliza la apariencia general de tu panel de administración.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="theme-mode">Modo de tema</Label>
                        <Select
                          value={settings.theme}
                          onValueChange={(value: 'light' | 'dark' | 'system') => handleSettingChange('theme', value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Seleccionar tema" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">
                              <div className="flex items-center">
                                <Sun className="h-4 w-4 mr-2" />
                                Claro
                              </div>
                            </SelectItem>
                            <SelectItem value="dark">
                              <div className="flex items-center">
                                <Moon className="h-4 w-4 mr-2" />
                                Oscuro
                              </div>
                            </SelectItem>
                            <SelectItem value="system">
                              <div className="flex items-center">
                                <Monitor className="h-4 w-4 mr-2" />
                                Sistema
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-sm text-gray-500">
                        Selecciona el modo de tema que prefieras para tu panel.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="animations">Animaciones</Label>
                        <Switch
                          id="animations"
                          checked={settings.animations}
                          onCheckedChange={(checked) => handleSettingChange('animations', checked)}
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Habilita o deshabilita las animaciones en la interfaz.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="border-radius">Redondeo de bordes</Label>
                      <div className="flex items-center space-x-2">
                        <RadioGroup
                          value={settings.radius.toString()}
                          onValueChange={(value: string) => handleSettingChange('radius', parseFloat(value))}
                          className="flex space-x-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="0" id="radius-none" />
                            <Label htmlFor="radius-none">Sin redondeo</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="0.25" id="radius-sm" />
                            <Label htmlFor="radius-sm">Pequeño</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="0.5" id="radius-md" />
                            <Label htmlFor="radius-md">Medio</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="1" id="radius-lg" />
                            <Label htmlFor="radius-lg">Grande</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="flex items-center space-x-4 mt-4">
                        <div className="h-10 w-10 bg-primary flex items-center justify-center text-white" style={{ borderRadius: '0px' }}>0</div>
                        <div className="h-10 w-10 bg-primary flex items-center justify-center text-white" style={{ borderRadius: '4px' }}>4px</div>
                        <div className="h-10 w-10 bg-primary flex items-center justify-center text-white" style={{ borderRadius: '8px' }}>8px</div>
                        <div className="h-10 w-10 bg-primary flex items-center justify-center text-white" style={{ borderRadius: '16px' }}>16px</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Theme Settings */}
              <TabsContent value="theme">
                <Card>
                  <CardHeader>
                    <CardTitle>Estilo del tema</CardTitle>
                    <CardDescription>
                      Personaliza el estilo de color y variantes del tema.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <Label>Estilo de variante</Label>
                      <RadioGroup
                        value={settings.variantStyle}
                        onValueChange={(value: 'professional' | 'tint' | 'vibrant') => handleSettingChange('variantStyle', value)}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        <Card className={`cursor-pointer ${settings.variantStyle === 'professional' ? 'ring-2 ring-primary' : ''}`}>
                          <CardContent className="p-4 flex flex-col items-center">
                            <div className="flex items-center justify-between w-full mb-2">
                              <h3 className="font-medium">Profesional</h3>
                              <RadioGroupItem value="professional" id="variant-professional" />
                            </div>
                            <div className="w-full h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-md"></div>
                            <p className="text-xs text-gray-500 mt-2">
                              Colores sutiles y profesionales para entornos empresariales.
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card className={`cursor-pointer ${settings.variantStyle === 'tint' ? 'ring-2 ring-primary' : ''}`}>
                          <CardContent className="p-4 flex flex-col items-center">
                            <div className="flex items-center justify-between w-full mb-2">
                              <h3 className="font-medium">Tinte</h3>
                              <RadioGroupItem value="tint" id="variant-tint" />
                            </div>
                            <div className="w-full h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-md"></div>
                            <p className="text-xs text-gray-500 mt-2">
                              Colores con tintes sutiles y elegantes.
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card className={`cursor-pointer ${settings.variantStyle === 'vibrant' ? 'ring-2 ring-primary' : ''}`}>
                          <CardContent className="p-4 flex flex-col items-center">
                            <div className="flex items-center justify-between w-full mb-2">
                              <h3 className="font-medium">Vibrante</h3>
                              <RadioGroupItem value="vibrant" id="variant-vibrant" />
                            </div>
                            <div className="w-full h-20 bg-gradient-to-r from-pink-500 to-orange-500 rounded-md"></div>
                            <p className="text-xs text-gray-500 mt-2">
                              Colores vibrantes y energéticos para destacar.
                            </p>
                          </CardContent>
                        </Card>
                      </RadioGroup>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-500 mb-4">
                        Vista previa de los componentes de la interfaz con el estilo seleccionado:
                      </p>
                      
                      <div className="space-y-6">
                        <div className="flex flex-wrap gap-3">
                          <Button>Botón primario</Button>
                          <Button variant="outline">Botón outline</Button>
                          <Button variant="secondary">Botón secundario</Button>
                          <Button variant="ghost">Botón ghost</Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm">Card de ejemplo</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-xs">Contenido de la tarjeta</p>
                            </CardContent>
                          </Card>
                          
                          <div className="flex items-center space-x-2">
                            <Switch id="example-switch" />
                            <Label htmlFor="example-switch">Switch</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded text-primary border-gray-300" />
                            <Label>Checkbox</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Layout Settings */}
              <TabsContent value="layout">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración de diseño</CardTitle>
                    <CardDescription>
                      Personaliza el diseño y la distribución de los elementos en el panel.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="layout-density">Densidad del diseño</Label>
                      <Select
                        value={settings.layout}
                        onValueChange={(value: 'default' | 'compact' | 'spacious') => handleSettingChange('layout', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar densidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">Compacto</SelectItem>
                          <SelectItem value="default">Predeterminado</SelectItem>
                          <SelectItem value="spacious">Espacioso</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500">
                        Ajusta la cantidad de espacio entre elementos.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="menu-position">Posición del menú</Label>
                      <div className="flex gap-4">
                        <Card className={`w-40 h-48 cursor-pointer ${settings.menuPosition === 'left' ? 'ring-2 ring-primary' : ''}`} onClick={() => handleSettingChange('menuPosition', 'left')}>
                          <CardContent className="p-3 h-full flex flex-col">
                            <div className="flex-1 flex">
                              <div className="w-1/4 bg-gray-200 h-full"></div>
                              <div className="w-3/4 p-2">
                                <div className="h-2 bg-gray-200 rounded w-3/4 mb-1"></div>
                                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                              </div>
                            </div>
                            <p className="text-center text-xs mt-2">Izquierda</p>
                          </CardContent>
                        </Card>
                        
                        <Card className={`w-40 h-48 cursor-pointer ${settings.menuPosition === 'right' ? 'ring-2 ring-primary' : ''}`} onClick={() => handleSettingChange('menuPosition', 'right')}>
                          <CardContent className="p-3 h-full flex flex-col">
                            <div className="flex-1 flex">
                              <div className="w-3/4 p-2">
                                <div className="h-2 bg-gray-200 rounded w-3/4 mb-1"></div>
                                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                              </div>
                              <div className="w-1/4 bg-gray-200 h-full"></div>
                            </div>
                            <p className="text-center text-xs mt-2">Derecha</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="menu-style">Estilo del menú</Label>
                      <div className="flex gap-4">
                        <Card className={`w-40 h-48 cursor-pointer ${settings.menuStyle === 'vertical' ? 'ring-2 ring-primary' : ''}`} onClick={() => handleSettingChange('menuStyle', 'vertical')}>
                          <CardContent className="p-3 h-full flex flex-col">
                            <div className="flex-1 flex">
                              <div className="w-1/4 bg-gray-200 h-full flex flex-col p-1 gap-1">
                                <div className="h-2 bg-gray-300 rounded w-full"></div>
                                <div className="h-2 bg-gray-300 rounded w-full"></div>
                                <div className="h-2 bg-gray-300 rounded w-full"></div>
                              </div>
                              <div className="w-3/4 p-2">
                                <div className="h-2 bg-gray-200 rounded w-3/4 mb-1"></div>
                                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                              </div>
                            </div>
                            <p className="text-center text-xs mt-2">Vertical</p>
                          </CardContent>
                        </Card>
                        
                        <Card className={`w-40 h-48 cursor-pointer ${settings.menuStyle === 'horizontal' ? 'ring-2 ring-primary' : ''}`} onClick={() => handleSettingChange('menuStyle', 'horizontal')}>
                          <CardContent className="p-3 h-full flex flex-col">
                            <div className="flex-1 flex flex-col">
                              <div className="h-6 bg-gray-200 w-full flex justify-start p-1 gap-1 mb-2">
                                <div className="h-2 bg-gray-300 rounded w-8"></div>
                                <div className="h-2 bg-gray-300 rounded w-8"></div>
                                <div className="h-2 bg-gray-300 rounded w-8"></div>
                              </div>
                              <div className="flex-1 p-2">
                                <div className="h-2 bg-gray-200 rounded w-3/4 mb-1"></div>
                                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                              </div>
                            </div>
                            <p className="text-center text-xs mt-2">Horizontal</p>
                          </CardContent>
                        </Card>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Nota: El estilo horizontal está en fase beta y puede no estar disponible en todas las páginas.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                      Los cambios en el diseño se aplicarán después de recargar la página.
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Web Settings */}
              <TabsContent value="web">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tipografía */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Type className="h-5 w-5 mr-2" />
                        Tipografía Web
                      </CardTitle>
                      <CardDescription>
                        Personaliza las fuentes para tus páginas web y contenido publicado.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Fuente Principal */}
                      <div className="space-y-2">
                        <Label htmlFor="web-font-family">Fuente Principal</Label>
                        <Select
                          value={settings.webFontFamily}
                          onValueChange={(value: 'sans' | 'serif' | 'mono' | 'custom') => handleSettingChange('webFontFamily', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar fuente" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sans">Sans-serif (Inter)</SelectItem>
                            <SelectItem value="serif">Serif (Merriweather)</SelectItem>
                            <SelectItem value="mono">Monospace (Roboto Mono)</SelectItem>
                            <SelectItem value="custom">Personalizada</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {settings.webFontFamily === 'custom' && (
                          <div className="mt-2">
                            <Label htmlFor="web-custom-font">Nombre de la fuente personalizada</Label>
                            <Input 
                              id="web-custom-font"
                              value={settings.webCustomFont}
                              onChange={(e) => handleSettingChange('webCustomFont', e.target.value)}
                              placeholder="ej. 'Nunito', sans-serif"
                              className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Asegúrate de incluir la fuente en tu proyecto o usar una fuente de Google Fonts.
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Fuente para Títulos */}
                      <div className="space-y-2">
                        <Label htmlFor="web-heading-font">Fuente para Títulos</Label>
                        <Select
                          value={settings.webHeadingFont}
                          onValueChange={(value: 'sans' | 'serif' | 'mono' | 'custom') => handleSettingChange('webHeadingFont', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar fuente" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sans">Sans-serif (Inter)</SelectItem>
                            <SelectItem value="serif">Serif (Merriweather)</SelectItem>
                            <SelectItem value="mono">Monospace (Roboto Mono)</SelectItem>
                            <SelectItem value="custom">Personalizada</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {settings.webHeadingFont === 'custom' && (
                          <div className="mt-2">
                            <Label htmlFor="web-custom-heading-font">Nombre de la fuente personalizada para títulos</Label>
                            <Input 
                              id="web-custom-heading-font"
                              value={settings.webCustomHeadingFont}
                              onChange={(e) => handleSettingChange('webCustomHeadingFont', e.target.value)}
                              placeholder="ej. 'Playfair Display', serif"
                              className="mt-1"
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Vista previa */}
                      <div className="border rounded-md p-4 mt-4">
                        <p className="text-sm font-medium text-gray-500">Vista previa</p>
                        <h3 className="text-xl font-bold mt-2" style={{ 
                          fontFamily: settings.webHeadingFont === 'custom' 
                            ? settings.webCustomHeadingFont 
                            : settings.webHeadingFont === 'sans' 
                              ? 'Inter, sans-serif' 
                              : settings.webHeadingFont === 'serif' 
                                ? 'Merriweather, serif' 
                                : 'Roboto Mono, monospace' 
                        }}>
                          Título de ejemplo
                        </h3>
                        <p className="mt-2" style={{ 
                          fontFamily: settings.webFontFamily === 'custom' 
                            ? settings.webCustomFont 
                            : settings.webFontFamily === 'sans' 
                              ? 'Inter, sans-serif' 
                              : settings.webFontFamily === 'serif' 
                                ? 'Merriweather, serif' 
                                : 'Roboto Mono, monospace' 
                        }}>
                          Este es un párrafo de ejemplo que muestra cómo se verá el texto en tu sitio web.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Colores */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Palette className="h-5 w-5 mr-2" />
                        Colores Web
                      </CardTitle>
                      <CardDescription>
                        Define la paleta de colores para tus páginas web.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="web-color-palette">Paleta de colores</Label>
                        <Select
                          value={settings.webColorPalette}
                          onValueChange={(value: 'default' | 'corporate' | 'creative' | 'elegant' | 'vibrant' | 'custom') => handleSettingChange('webColorPalette', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar paleta" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Por defecto</SelectItem>
                            <SelectItem value="corporate">Corporativa</SelectItem>
                            <SelectItem value="creative">Creativa</SelectItem>
                            <SelectItem value="elegant">Elegante</SelectItem>
                            <SelectItem value="vibrant">Vibrante</SelectItem>
                            <SelectItem value="custom">Personalizada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {settings.webColorPalette === 'custom' && (
                        <div className="space-y-4 mt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="web-color-primary">Color primario</Label>
                              <div className="flex mt-1">
                                <Input 
                                  id="web-color-primary"
                                  value={settings.webCustomColors.primary}
                                  onChange={(e) => handleSettingChange('webCustomColors', {
                                    ...settings.webCustomColors,
                                    primary: e.target.value
                                  })}
                                  className="rounded-r-none"
                                />
                                <div 
                                  className="w-10 border border-l-0 rounded-r-md flex items-center justify-center"
                                  style={{ backgroundColor: settings.webCustomColors.primary }}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="web-color-secondary">Color secundario</Label>
                              <div className="flex mt-1">
                                <Input 
                                  id="web-color-secondary"
                                  value={settings.webCustomColors.secondary}
                                  onChange={(e) => handleSettingChange('webCustomColors', {
                                    ...settings.webCustomColors,
                                    secondary: e.target.value
                                  })}
                                  className="rounded-r-none"
                                />
                                <div 
                                  className="w-10 border border-l-0 rounded-r-md flex items-center justify-center"
                                  style={{ backgroundColor: settings.webCustomColors.secondary }}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="web-color-accent">Color acento</Label>
                              <div className="flex mt-1">
                                <Input 
                                  id="web-color-accent"
                                  value={settings.webCustomColors.accent}
                                  onChange={(e) => handleSettingChange('webCustomColors', {
                                    ...settings.webCustomColors,
                                    accent: e.target.value
                                  })}
                                  className="rounded-r-none"
                                />
                                <div 
                                  className="w-10 border border-l-0 rounded-r-md flex items-center justify-center"
                                  style={{ backgroundColor: settings.webCustomColors.accent }}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="web-color-background">Color de fondo</Label>
                              <div className="flex mt-1">
                                <Input 
                                  id="web-color-background"
                                  value={settings.webCustomColors.background}
                                  onChange={(e) => handleSettingChange('webCustomColors', {
                                    ...settings.webCustomColors,
                                    background: e.target.value
                                  })}
                                  className="rounded-r-none"
                                />
                                <div 
                                  className="w-10 border border-l-0 rounded-r-md flex items-center justify-center"
                                  style={{ backgroundColor: settings.webCustomColors.background }}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="web-color-text">Color de texto</Label>
                            <div className="flex mt-1">
                              <Input 
                                id="web-color-text"
                                value={settings.webCustomColors.text}
                                onChange={(e) => handleSettingChange('webCustomColors', {
                                  ...settings.webCustomColors,
                                  text: e.target.value
                                })}
                                className="rounded-r-none"
                              />
                              <div 
                                className="w-10 border border-l-0 rounded-r-md flex items-center justify-center"
                                style={{ backgroundColor: settings.webCustomColors.text }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Vista previa de colores */}
                      <div className="border rounded-md p-4 mt-4 space-y-3">
                        <p className="text-sm font-medium text-gray-500">Vista previa de colores</p>
                        <div className="flex space-x-2">
                          <div className="h-8 w-8 rounded-full" style={{ 
                            backgroundColor: settings.webColorPalette === 'custom' 
                              ? settings.webCustomColors.primary 
                              : settings.webColorPalette === 'corporate' 
                                ? '#0284c7'
                                : settings.webColorPalette === 'creative'
                                  ? '#8b5cf6'
                                  : settings.webColorPalette === 'elegant'
                                    ? '#334155'
                                    : settings.webColorPalette === 'vibrant'
                                      ? '#f43f5e'
                                      : '#3b82f6'
                          }}></div>
                          <div className="h-8 w-8 rounded-full" style={{ 
                            backgroundColor: settings.webColorPalette === 'custom' 
                              ? settings.webCustomColors.secondary 
                              : settings.webColorPalette === 'corporate' 
                                ? '#0369a1'
                                : settings.webColorPalette === 'creative'
                                  ? '#a855f7'
                                  : settings.webColorPalette === 'elegant'
                                    ? '#475569'
                                    : settings.webColorPalette === 'vibrant'
                                      ? '#ec4899'
                                      : '#6366f1'
                          }}></div>
                          <div className="h-8 w-8 rounded-full" style={{ 
                            backgroundColor: settings.webColorPalette === 'custom' 
                              ? settings.webCustomColors.accent 
                              : settings.webColorPalette === 'corporate' 
                                ? '#ea580c'
                                : settings.webColorPalette === 'creative'
                                  ? '#ec4899'
                                  : settings.webColorPalette === 'elegant'
                                    ? '#ca8a04'
                                    : settings.webColorPalette === 'vibrant'
                                      ? '#8b5cf6'
                                      : '#f43f5e'
                          }}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Estilo de Componentes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Box className="h-5 w-5 mr-2" />
                        Estilo de Componentes
                      </CardTitle>
                      <CardDescription>
                        Personaliza el aspecto de los componentes en tus páginas web.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="web-component-style">Estilo visual</Label>
                        <Select
                          value={settings.webComponentStyle}
                          onValueChange={(value: 'flat' | 'soft' | 'neumorph' | 'glassmorphism') => handleSettingChange('webComponentStyle', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estilo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flat">Plano (Flat)</SelectItem>
                            <SelectItem value="soft">Suave (Soft UI)</SelectItem>
                            <SelectItem value="neumorph">Neumorfismo</SelectItem>
                            <SelectItem value="glassmorphism">Glassmorfismo</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Define el estilo visual de botones, tarjetas y otros componentes.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="web-spacing-scale">Espaciado</Label>
                        <Select
                          value={settings.webSpacingScale}
                          onValueChange={(value: 'compact' | 'standard' | 'airy') => handleSettingChange('webSpacingScale', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar espaciado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="compact">Compacto</SelectItem>
                            <SelectItem value="standard">Estándar</SelectItem>
                            <SelectItem value="airy">Espacioso</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Controla el espaciado entre componentes y secciones.
                        </p>
                      </div>
                      
                      {/* Vista previa de estilos */}
                      <div className="border rounded-md p-4 mt-4">
                        <p className="text-sm font-medium text-gray-500 mb-3">Vista previa de estilo</p>
                        <div className={`p-4 rounded-md w-full h-24 flex items-center justify-center mb-3 ${
                          settings.webComponentStyle === 'flat'
                            ? 'bg-gray-100 border border-gray-200'
                            : settings.webComponentStyle === 'soft'
                              ? 'bg-gray-100 shadow-[5px_5px_10px_rgba(0,0,0,0.05),-5px_-5px_10px_rgba(255,255,255,0.8)]'
                              : settings.webComponentStyle === 'neumorph'
                                ? 'bg-gray-100 shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.8)]'
                                : 'bg-white/20 backdrop-blur-sm border border-white/20'
                        }`}>
                          <div className="text-center">
                            <p className="text-sm">Estilo: {settings.webComponentStyle}</p>
                            <button className={`mt-2 px-3 py-1 text-sm rounded-md ${
                              settings.webComponentStyle === 'flat'
                                ? 'bg-blue-500 text-white'
                                : settings.webComponentStyle === 'soft'
                                  ? 'bg-blue-100 text-blue-700 shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.8)]'
                                  : settings.webComponentStyle === 'neumorph'
                                    ? 'bg-gray-100 text-blue-700 shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.8)]'
                                    : 'bg-white/10 backdrop-blur-sm border border-white/20 text-blue-600'
                            }`}>Botón de ejemplo</button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Animaciones y Layout */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <LayoutGrid className="h-5 w-5 mr-2" />
                        Animaciones y Layout
                      </CardTitle>
                      <CardDescription>
                        Configura las animaciones y el tipo de layout para tus páginas web.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="web-animations-level">Nivel de Animaciones</Label>
                        <Select
                          value={settings.webAnimationsLevel}
                          onValueChange={(value: 'none' | 'minimal' | 'moderate' | 'playful') => handleSettingChange('webAnimationsLevel', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar nivel" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sin animaciones</SelectItem>
                            <SelectItem value="minimal">Mínimas</SelectItem>
                            <SelectItem value="moderate">Moderadas</SelectItem>
                            <SelectItem value="playful">Dinámicas</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Define la cantidad y tipo de animaciones en tus páginas.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="web-layout-type">Tipo de Layout</Label>
                        <Select
                          value={settings.webLayoutType}
                          onValueChange={(value: 'responsive' | 'fixed' | 'fluid') => handleSettingChange('webLayoutType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar layout" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="responsive">Responsive</SelectItem>
                            <SelectItem value="fixed">Ancho fijo</SelectItem>
                            <SelectItem value="fluid">Fluido</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Define cómo se comportará el layout de tu página en diferentes tamaños de pantalla.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="web-nav-style">Estilo de Navegación</Label>
                          <Select
                            value={settings.webNavStyle}
                            onValueChange={(value: 'standard' | 'minimal' | 'prominent') => handleSettingChange('webNavStyle', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estilo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Estándar</SelectItem>
                              <SelectItem value="minimal">Minimalista</SelectItem>
                              <SelectItem value="prominent">Prominente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="web-footer-style">Estilo de Footer</Label>
                          <Select
                            value={settings.webFooterStyle}
                            onValueChange={(value: 'simple' | 'detailed' | 'minimal') => handleSettingChange('webFooterStyle', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estilo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="simple">Simple</SelectItem>
                              <SelectItem value="detailed">Detallado</SelectItem>
                              <SelectItem value="minimal">Minimalista</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {/* Vista previa de layout */}
                      <div className="border rounded-md p-4 mt-4">
                        <p className="text-sm font-medium text-gray-500 mb-3">Vista previa de layout</p>
                        <div className="w-full h-32 bg-gray-100 rounded-md flex flex-col">
                          <div className={`h-8 w-full ${
                            settings.webNavStyle === 'standard'
                              ? 'bg-gray-200'
                              : settings.webNavStyle === 'minimal'
                                ? 'bg-white border-b border-gray-200'
                                : 'bg-blue-500'
                          }`}></div>
                          <div className={`flex-1 ${
                            settings.webLayoutType === 'fixed'
                              ? 'px-8'
                              : settings.webLayoutType === 'fluid'
                                ? 'px-2'
                                : 'px-4'
                          }`}>
                            <div className="w-full h-4 bg-gray-200 rounded mt-2"></div>
                            <div className="w-2/3 h-4 bg-gray-200 rounded mt-1"></div>
                          </div>
                          <div className={`h-6 w-full ${
                            settings.webFooterStyle === 'simple'
                              ? 'bg-gray-200'
                              : settings.webFooterStyle === 'detailed'
                                ? 'bg-gray-700'
                                : 'bg-white border-t border-gray-200'
                          }`}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Block Styles Settings */}
              <TabsContent value="blocks">
                <Card>
                  <CardHeader>
                    <CardTitle>Estilos de bloques</CardTitle>
                    <CardDescription>
                      Personaliza el estilo global para los bloques del constructor de páginas.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BlockStylesPanel />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </div>
  );
};

export default AppearanceSettings;
