import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBlockStyles, GlobalBlockStyles } from '@/hooks/use-block-styles';
import { Input } from '@/components/ui/input';

export default function BlockStylesPanel() {
  const { styles, updateStyles, resetStyles, applyTheme } = useBlockStyles();

  const handleUpdateBlockStyle = (value: string) => {
    updateStyles({ defaultBlockStyle: value as any });
  };

  const handleUpdateAccordionStyle = (value: string) => {
    updateStyles({ defaultAccordionStyle: value as any });
  };

  const handleUpdateTabsStyle = (value: string) => {
    updateStyles({ defaultTabsStyle: value as any });
  };

  const handleUpdateTableStyle = (value: string) => {
    updateStyles({ defaultTableStyle: value as any });
  };

  const handleUpdateButtonStyle = (value: string) => {
    updateStyles({ defaultButtonStyle: value as any });
  };

  const handleSpacingChange = (key: keyof GlobalBlockStyles['spacing'], value: number) => {
    updateStyles({
      spacing: {
        ...styles.spacing,
        [key]: value
      }
    });
  };

  const handleBorderRadiusChange = (value: number[]) => {
    updateStyles({ borderRadius: value[0] });
  };

  const handleColorChange = (key: keyof GlobalBlockStyles['colors'], value: string) => {
    updateStyles({
      colors: {
        ...styles.colors,
        [key]: value
      }
    });
  };

  const handleDarkModeChange = (checked: boolean) => {
    updateStyles({ darkMode: checked });
  };

  const handleSystemDarkModeChange = (checked: boolean) => {
    if (checked) {
      updateStyles({ darkMode: 'system' });
    } else if (styles.darkMode === 'system') {
      updateStyles({ darkMode: false });
    }
  };

  const handleFontScaleChange = (value: number[]) => {
    updateStyles({ fontScale: value[0] });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Estilos globales de bloques</h2>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => resetStyles()}>
            Restablecer
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Aplica un tema predefinido para cambiar rápidamente el estilo global de todos los bloques.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => applyTheme('default')}
              className={styles.defaultBlockStyle === 'default' ? 'border-primary' : ''}
            >
              Predeterminado
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => applyTheme('modern')}
              className={styles.defaultBlockStyle === 'card' ? 'border-primary' : ''}
            >
              Moderno
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => applyTheme('minimal')}
              className={styles.defaultBlockStyle === 'minimal' ? 'border-primary' : ''}
            >
              Minimalista
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => applyTheme('bold')}
              className={styles.defaultBlockStyle === 'highlight' ? 'border-primary' : ''}
            >
              Destacado
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => applyTheme('elegant')}
              className={styles.defaultBlockStyle === 'bordered' ? 'border-primary' : ''}
            >
              Elegante
            </Button>
          </div>
        </div>

        <Tabs defaultValue="estilos">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="estilos">Estilos</TabsTrigger>
            <TabsTrigger value="espaciado">Espaciado</TabsTrigger>
            <TabsTrigger value="colores">Colores</TabsTrigger>
            <TabsTrigger value="tipografia">Tipografía</TabsTrigger>
          </TabsList>
          
          <TabsContent value="estilos" className="space-y-4">
            <div className="grid gap-2">
              <Label>Estilo predeterminado de bloques</Label>
              <Select value={styles.defaultBlockStyle} onValueChange={handleUpdateBlockStyle}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar estilo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Predeterminado</SelectItem>
                  <SelectItem value="bordered">Con bordes</SelectItem>
                  <SelectItem value="shadowed">Con sombras</SelectItem>
                  <SelectItem value="card">Tarjeta</SelectItem>
                  <SelectItem value="boxed">Cuadro</SelectItem>
                  <SelectItem value="underline">Subrayado</SelectItem>
                  <SelectItem value="highlight">Destacado</SelectItem>
                  <SelectItem value="minimal">Minimalista</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>Estilo predeterminado de acordeón</Label>
              <Select value={styles.defaultAccordionStyle} onValueChange={handleUpdateAccordionStyle}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar estilo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Predeterminado</SelectItem>
                  <SelectItem value="bordered">Con bordes</SelectItem>
                  <SelectItem value="minimal">Minimalista</SelectItem>
                  <SelectItem value="boxed">Cuadro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>Estilo predeterminado de pestañas</Label>
              <Select value={styles.defaultTabsStyle} onValueChange={handleUpdateTabsStyle}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar estilo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Predeterminado</SelectItem>
                  <SelectItem value="pills">Píldoras</SelectItem>
                  <SelectItem value="boxed">Cuadro</SelectItem>
                  <SelectItem value="underline">Subrayado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>Estilo predeterminado de tablas</Label>
              <Select value={styles.defaultTableStyle} onValueChange={handleUpdateTableStyle}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar estilo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Predeterminado</SelectItem>
                  <SelectItem value="striped">Alternado</SelectItem>
                  <SelectItem value="bordered">Con bordes</SelectItem>
                  <SelectItem value="compact">Compacto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>Estilo predeterminado de botones</Label>
              <Select value={styles.defaultButtonStyle} onValueChange={handleUpdateButtonStyle}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar estilo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primario</SelectItem>
                  <SelectItem value="secondary">Secundario</SelectItem>
                  <SelectItem value="accent">Acento</SelectItem>
                  <SelectItem value="outline">Contorno</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>Radio de bordes</Label>
              <div className="pt-2 px-1">
                <Slider 
                  value={[styles.borderRadius]} 
                  min={0} 
                  max={1} 
                  step={0.05} 
                  onValueChange={handleBorderRadiusChange}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Cuadrado</span>
                <span>Redondeado</span>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Modo oscuro</Label>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={styles.darkMode === true} 
                    onCheckedChange={handleDarkModeChange}
                    id="dark-mode"
                  />
                  <Label htmlFor="dark-mode" className="cursor-pointer">Activar modo oscuro</Label>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={styles.darkMode === 'system'} 
                  onCheckedChange={handleSystemDarkModeChange}
                  id="system-mode"
                />
                <Label htmlFor="system-mode" className="cursor-pointer">Usar configuración del sistema</Label>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="espaciado" className="space-y-4">
            <div className="grid gap-2">
              <Label>Espaciado interior de bloques</Label>
              <div className="pt-2 px-1">
                <Slider
                  value={[styles.spacing.block]}
                  min={2}
                  max={12}
                  step={1}
                  onValueChange={(value) => handleSpacingChange('block', value[0])}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Compacto</span>
                <span>Amplio</span>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Espaciado entre elementos</Label>
              <div className="pt-2 px-1">
                <Slider
                  value={[styles.spacing.elements]}
                  min={1}
                  max={8}
                  step={1}
                  onValueChange={(value) => handleSpacingChange('elements', value[0])}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Compacto</span>
                <span>Amplio</span>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Espaciado entre bloques</Label>
              <div className="pt-2 px-1">
                <Slider
                  value={[styles.spacing.blocks]}
                  min={2}
                  max={16}
                  step={1}
                  onValueChange={(value) => handleSpacingChange('blocks', value[0])}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Compacto</span>
                <span>Amplio</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="colores" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Color primario</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-8 h-8 rounded-full border"
                    style={{ backgroundColor: styles.colors.primary }}
                  />
                  <Input
                    type="text"
                    value={styles.colors.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Color secundario</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-8 h-8 rounded-full border"
                    style={{ backgroundColor: styles.colors.secondary }}
                  />
                  <Input
                    type="text"
                    value={styles.colors.secondary}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Color de acento</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-8 h-8 rounded-full border"
                    style={{ backgroundColor: styles.colors.accent }}
                  />
                  <Input
                    type="text"
                    value={styles.colors.accent}
                    onChange={(e) => handleColorChange('accent', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Color de fondo</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-8 h-8 rounded-full border"
                    style={{ backgroundColor: styles.colors.background }}
                  />
                  <Input
                    type="text"
                    value={styles.colors.background}
                    onChange={(e) => handleColorChange('background', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Color de texto</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-8 h-8 rounded-full border"
                    style={{ backgroundColor: styles.colors.foreground }}
                  />
                  <Input
                    type="text"
                    value={styles.colors.foreground}
                    onChange={(e) => handleColorChange('foreground', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Color atenuado</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-8 h-8 rounded-full border"
                    style={{ backgroundColor: styles.colors.muted }}
                  />
                  <Input
                    type="text"
                    value={styles.colors.muted}
                    onChange={(e) => handleColorChange('muted', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Color de borde</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-8 h-8 rounded-full border"
                    style={{ backgroundColor: styles.colors.border }}
                  />
                  <Input
                    type="text"
                    value={styles.colors.border}
                    onChange={(e) => handleColorChange('border', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tipografia" className="space-y-4">
            <div className="grid gap-2">
              <Label>Escala de fuente</Label>
              <div className="pt-2 px-1">
                <Slider
                  value={[styles.fontScale]}
                  min={0.8}
                  max={1.2}
                  step={0.05}
                  onValueChange={handleFontScaleChange}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Pequeño</span>
                <span>Grande</span>
              </div>
              <div className="mt-2">
                <p className="text-sm" style={{ fontSize: `${styles.fontScale}rem` }}>
                  Texto de ejemplo a escala {styles.fontScale}x
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}