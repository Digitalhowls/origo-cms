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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Save, 
  BarChart3, 
  Mail, 
  CreditCard, 
  LifeBuoy, 
  Share2, 
  Check,
  X
} from 'lucide-react';

interface IntegrationSettings {
  analytics: {
    googleAnalyticsId: string;
    enabled: boolean;
  };
  email: {
    provider: 'mailchimp' | 'brevo' | 'none';
    apiKey: string;
    enabled: boolean;
  };
  payment: {
    provider: 'stripe' | 'paypal' | 'none';
    apiKey: string;
    enabled: boolean;
  };
  social: {
    facebook: boolean;
    twitter: boolean;
    instagram: boolean;
    youtube: boolean;
  };
  automation: {
    zapier: boolean;
    make: boolean;
  };
}

const IntegrationsSettings: React.FC = () => {
  const { toast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);
  
  // Form state
  const [settings, setSettings] = useState<IntegrationSettings>({
    analytics: {
      googleAnalyticsId: '',
      enabled: false,
    },
    email: {
      provider: 'none',
      apiKey: '',
      enabled: false,
    },
    payment: {
      provider: 'none',
      apiKey: '',
      enabled: false,
    },
    social: {
      facebook: false,
      twitter: false,
      instagram: false,
      youtube: false,
    },
    automation: {
      zapier: false,
      make: false,
    },
  });
  
  // Fetch integrations settings
  const { data, isLoading } = useQuery({
    queryKey: ['/api/settings/integrations'],
    queryFn: async () => {
      const response = await fetch('/api/settings/integrations', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch integrations settings');
      return response.json();
    },
  });
  
  // Update settings from fetched data
  useEffect(() => {
    if (data) {
      setSettings(data);
    }
  }, [data]);
  
  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsData: IntegrationSettings) => {
      return apiRequest('PATCH', '/api/settings/integrations', settingsData);
    },
    onSuccess: () => {
      setHasChanges(false);
      toast({
        title: "Cambios guardados",
        description: "Las integraciones han sido actualizadas correctamente.",
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
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [category, field] = name.split('.');
    
    setSettings({
      ...settings,
      [category]: {
        ...settings[category as keyof IntegrationSettings],
        [field]: value,
      },
    });
    setHasChanges(true);
  };
  
  const handleSwitchChange = (category: string, field: string, checked: boolean) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category as keyof IntegrationSettings],
        [field]: checked,
      },
    });
    setHasChanges(true);
  };
  
  const handleProviderChange = (category: 'email' | 'payment', value: string) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        provider: value as any,
      },
    });
    setHasChanges(true);
  };
  
  const handleSaveChanges = () => {
    saveSettingsMutation.mutate(settings);
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar 
          pageTitle="Integraciones" 
          actions={
            <Button 
              onClick={handleSaveChanges} 
              disabled={!hasChanges || saveSettingsMutation.isPending}
            >
              <Save className="h-4 w-4 mr-1" />
              {saveSettingsMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          }
        />
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Tabs defaultValue="analytics">
              <TabsList className="mb-6">
                <TabsTrigger value="analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="email">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="payment">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pagos
                </TabsTrigger>
                <TabsTrigger value="social">
                  <Share2 className="h-4 w-4 mr-2" />
                  Social
                </TabsTrigger>
                <TabsTrigger value="automation">
                  <LifeBuoy className="h-4 w-4 mr-2" />
                  Automatización
                </TabsTrigger>
              </TabsList>
              
              {/* Analytics Integration */}
              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Google Analytics</CardTitle>
                        <CardDescription>
                          Agrega Google Analytics para obtener estadísticas de tráfico y comportamiento.
                        </CardDescription>
                      </div>
                      <Switch
                        checked={settings.analytics.enabled}
                        onCheckedChange={(checked) => handleSwitchChange('analytics', 'enabled', checked)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="googleAnalyticsId">ID de Google Analytics (GA4)</Label>
                        <Input
                          id="googleAnalyticsId"
                          name="analytics.googleAnalyticsId"
                          placeholder="G-XXXXXXXXXX"
                          value={settings.analytics.googleAnalyticsId}
                          onChange={handleInputChange}
                          disabled={!settings.analytics.enabled}
                        />
                        <p className="text-sm text-gray-500">
                          Ejemplo: G-XXXXXXXXXX para GA4 o UA-XXXXXXXX-X para Analytics Universal.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t">
                    <div className="text-sm text-gray-500">
                      <p className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        Se recopilan las vistas de página, eventos y datos demográficos.
                      </p>
                      <p className="flex items-center mt-1">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        Resumen básico de estadísticas disponible en el panel.
                      </p>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Email Integration */}
              <TabsContent value="email">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Integración de Email Marketing</CardTitle>
                        <CardDescription>
                          Conecta con servicios de email marketing para gestionar suscriptores.
                        </CardDescription>
                      </div>
                      <Switch
                        checked={settings.email.enabled}
                        onCheckedChange={(checked) => handleSwitchChange('email', 'enabled', checked)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-provider">Proveedor</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Card className={`cursor-pointer ${settings.email.provider === 'mailchimp' ? 'ring-2 ring-primary' : ''}`} onClick={() => handleProviderChange('email', 'mailchimp')}>
                            <CardContent className="p-4 flex flex-col items-center justify-center h-24">
                              <img src="https://cdn.worldvectorlogo.com/logos/mailchimp-freddie-icon.svg" alt="Mailchimp" className="h-8 mb-2" />
                              <span className="text-sm font-medium">Mailchimp</span>
                            </CardContent>
                          </Card>
                          
                          <Card className={`cursor-pointer ${settings.email.provider === 'brevo' ? 'ring-2 ring-primary' : ''}`} onClick={() => handleProviderChange('email', 'brevo')}>
                            <CardContent className="p-4 flex flex-col items-center justify-center h-24">
                              <img src="https://www.svgrepo.com/show/354452/sendinblue.svg" alt="Brevo (Sendinblue)" className="h-8 mb-2" />
                              <span className="text-sm font-medium">Brevo</span>
                            </CardContent>
                          </Card>
                          
                          <Card className={`cursor-pointer ${settings.email.provider === 'none' ? 'ring-2 ring-primary' : ''}`} onClick={() => handleProviderChange('email', 'none')}>
                            <CardContent className="p-4 flex flex-col items-center justify-center h-24">
                              <X className="h-8 w-8 text-gray-400 mb-2" />
                              <span className="text-sm font-medium">Ninguno</span>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                      
                      {settings.email.provider !== 'none' && (
                        <div className="space-y-2 mt-4">
                          <Label htmlFor="email-apiKey">Clave API</Label>
                          <Input
                            id="email-apiKey"
                            name="email.apiKey"
                            type="password"
                            placeholder="Introduce tu clave API"
                            value={settings.email.apiKey}
                            onChange={handleInputChange}
                            disabled={!settings.email.enabled || settings.email.provider === 'none'}
                          />
                          <p className="text-sm text-gray-500">
                            Encuentra tu clave API en la configuración de tu cuenta de {settings.email.provider === 'mailchimp' ? 'Mailchimp' : 'Brevo'}.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Payment Integration */}
              <TabsContent value="payment">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Procesadores de Pago</CardTitle>
                        <CardDescription>
                          Integra procesadores de pago para vender cursos o contenido premium.
                        </CardDescription>
                      </div>
                      <Switch
                        checked={settings.payment.enabled}
                        onCheckedChange={(checked) => handleSwitchChange('payment', 'enabled', checked)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="payment-provider">Proveedor</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Card className={`cursor-pointer ${settings.payment.provider === 'stripe' ? 'ring-2 ring-primary' : ''}`} onClick={() => handleProviderChange('payment', 'stripe')}>
                            <CardContent className="p-4 flex flex-col items-center justify-center h-24">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-8 mb-2" />
                              <span className="text-sm font-medium">Stripe</span>
                            </CardContent>
                          </Card>
                          
                          <Card className={`cursor-pointer ${settings.payment.provider === 'paypal' ? 'ring-2 ring-primary' : ''}`} onClick={() => handleProviderChange('payment', 'paypal')}>
                            <CardContent className="p-4 flex flex-col items-center justify-center h-24">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png" alt="PayPal" className="h-8 mb-2" />
                              <span className="text-sm font-medium">PayPal</span>
                            </CardContent>
                          </Card>
                          
                          <Card className={`cursor-pointer ${settings.payment.provider === 'none' ? 'ring-2 ring-primary' : ''}`} onClick={() => handleProviderChange('payment', 'none')}>
                            <CardContent className="p-4 flex flex-col items-center justify-center h-24">
                              <X className="h-8 w-8 text-gray-400 mb-2" />
                              <span className="text-sm font-medium">Ninguno</span>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                      
                      {settings.payment.provider !== 'none' && (
                        <div className="space-y-2 mt-4">
                          <Label htmlFor="payment-apiKey">{settings.payment.provider === 'stripe' ? 'Clave secreta de Stripe' : 'Client ID de PayPal'}</Label>
                          <Input
                            id="payment-apiKey"
                            name="payment.apiKey"
                            type="password"
                            placeholder={`Introduce tu ${settings.payment.provider === 'stripe' ? 'clave secreta' : 'client ID'}`}
                            value={settings.payment.apiKey}
                            onChange={handleInputChange}
                            disabled={!settings.payment.enabled || settings.payment.provider === 'none'}
                          />
                          <p className="text-sm text-gray-500">
                            {settings.payment.provider === 'stripe'
                              ? 'Comienza con sk_... Encuéntralo en el panel de desarrollador de Stripe.'
                              : 'Encuéntralo en tu cuenta de desarrollador de PayPal.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t">
                    <p className="text-sm text-gray-500">
                      Esta integración permite procesar pagos para cursos premium. Las funciones avanzadas estarán disponibles próximamente.
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Social Integration */}
              <TabsContent value="social">
                <Card>
                  <CardHeader>
                    <CardTitle>Redes Sociales</CardTitle>
                    <CardDescription>
                      Habilita integraciones con redes sociales para compartir contenido y embeds.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b">
                        <div className="flex items-center">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1200px-Facebook_Logo_%282019%29.png" alt="Facebook" className="h-8 w-8 mr-3" />
                          <div>
                            <h3 className="font-medium">Facebook</h3>
                            <p className="text-sm text-gray-500">Embeds y botones para compartir</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.social.facebook}
                          onCheckedChange={(checked) => handleSwitchChange('social', 'facebook', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between py-3 border-b">
                        <div className="flex items-center">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/512px-Logo_of_Twitter.svg.png?20220821125553" alt="Twitter" className="h-8 w-8 mr-3" />
                          <div>
                            <h3 className="font-medium">Twitter</h3>
                            <p className="text-sm text-gray-500">Embeds de tweets y botones para compartir</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.social.twitter}
                          onCheckedChange={(checked) => handleSwitchChange('social', 'twitter', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between py-3 border-b">
                        <div className="flex items-center">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png" alt="Instagram" className="h-8 w-8 mr-3" />
                          <div>
                            <h3 className="font-medium">Instagram</h3>
                            <p className="text-sm text-gray-500">Embeds de posts y reels</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.social.instagram}
                          onCheckedChange={(checked) => handleSwitchChange('social', 'instagram', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png" alt="YouTube" className="h-8 w-8 mr-3" />
                          <div>
                            <h3 className="font-medium">YouTube</h3>
                            <p className="text-sm text-gray-500">Embeds de videos</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.social.youtube}
                          onCheckedChange={(checked) => handleSwitchChange('social', 'youtube', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Automation Integration */}
              <TabsContent value="automation">
                <Card>
                  <CardHeader>
                    <CardTitle>Herramientas de Automatización</CardTitle>
                    <CardDescription>
                      Conecta con plataformas de automatización para crear flujos de trabajo.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b">
                        <div className="flex items-center">
                          <img src="https://cdn.worldvectorlogo.com/logos/zapier-2.svg" alt="Zapier" className="h-8 w-8 mr-3" />
                          <div>
                            <h3 className="font-medium">Zapier</h3>
                            <p className="text-sm text-gray-500">Conecta Origo con más de 5,000 aplicaciones</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.automation.zapier}
                          onCheckedChange={(checked) => handleSwitchChange('automation', 'zapier', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center">
                          <img src="https://assets-global.website-files.com/605783bff9d4006fc559a043/634915951d6b5a92f2628892_make-icon.svg" alt="Make (Integromat)" className="h-8 w-8 mr-3" />
                          <div>
                            <h3 className="font-medium">Make (Integromat)</h3>
                            <p className="text-sm text-gray-500">Crea flujos de trabajo visuales complejos</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.automation.make}
                          onCheckedChange={(checked) => handleSwitchChange('automation', 'make', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t">
                    <p className="text-sm text-gray-500">
                      Las integraciones de automatización permiten disparar eventos cuando se crean o actualizan contenidos en Origo, facilitando la creación de flujos de trabajo automatizados.
                    </p>
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

export default IntegrationsSettings;
