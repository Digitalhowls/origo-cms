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
                          onValueChange={(value) => handleSettingChange('radius', parseFloat(value))}
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
            </Tabs>
          )}
        </main>
      </div>
    </div>
  );
};

export default AppearanceSettings;
