import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Wand, LayoutIcon, SlidersHorizontal } from 'lucide-react';
import { usePageStore } from '@/lib/store';
import { Block, BlockType } from '@shared/types';
import AnimationPanel from './AnimationPanel';

interface PropertiesPanelProps {
  blockId: string | null;
  onClose: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ blockId, onClose }) => {
  const { currentPage, updateBlock } = usePageStore();
  const [block, setBlock] = useState<Block | null>(null);
  const [localSettings, setLocalSettings] = useState<any>(null);
  const [localContent, setLocalContent] = useState<any>(null);

  // Find and load the selected block when blockId changes
  useEffect(() => {
    if (blockId && currentPage?.blocks) {
      const foundBlock = currentPage.blocks.find(b => b.id === blockId);
      if (foundBlock) {
        setBlock(foundBlock);
        setLocalSettings(JSON.parse(JSON.stringify(foundBlock.settings)));
        setLocalContent(JSON.parse(JSON.stringify(foundBlock.content)));
      }
    } else {
      setBlock(null);
      setLocalSettings(null);
      setLocalContent(null);
    }
  }, [blockId, currentPage]);

  const handleSettingChange = (path: string[], value: any) => {
    if (!localSettings) return;

    // Create a deep copy of the settings
    const newSettings = { ...localSettings };
    
    // Navigate to the nested property
    let current = newSettings;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {};
      current = current[path[i]];
    }
    
    // Set the value
    current[path[path.length - 1]] = value;
    
    setLocalSettings(newSettings);
  };

  const handleContentChange = (path: string[], value: any) => {
    if (!localContent) return;

    // Create a deep copy of the content
    const newContent = { ...localContent };
    
    // Navigate to the nested property
    let current = newContent;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {};
      current = current[path[i]];
    }
    
    // Set the value
    current[path[path.length - 1]] = value;
    
    setLocalContent(newContent);
  };
  
  // Manejar cambios en los datos del bloque
  const handleDataChange = (path: string[], value: any) => {
    if (!block || !block.data) return;
    
    // Crear una copia profunda de los datos
    const newData = { ...(block.data || {}) };
    
    // Navegar a la propiedad anidada
    let current = newData;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {};
      current = current[path[i]];
    }
    
    // Establecer el valor
    current[path[path.length - 1]] = value;
    
    // Actualizar el bloque en el store
    if (block) {
      const updatedBlock = { ...block, data: newData };
      updateBlock(updatedBlock.id, updatedBlock);
    }
  };

  const handleApply = () => {
    if (block && localSettings && localContent) {
      updateBlock({
        ...block,
        settings: localSettings,
        content: localContent
      });
    }
  };

  const handleReset = () => {
    if (block) {
      setLocalSettings(JSON.parse(JSON.stringify(block.settings)));
      setLocalContent(JSON.parse(JSON.stringify(block.content)));
    }
  };

  if (!block || !localSettings || !localContent) {
    return null;
  }

  // Renderizar propiedades de la galería
  const renderGalleryProperties = () => {
    return (
      <>
        <div>
          <Label htmlFor="gallery-title">Título de la galería</Label>
          <Input
            id="gallery-title"
            value={block.data?.title || ''}
            onChange={(e) => handleDataChange(['title'], e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="mt-4">
          <Label htmlFor="gallery-description">Descripción</Label>
          <Textarea
            id="gallery-description"
            value={block.data?.description || ''}
            onChange={(e) => handleDataChange(['description'], e.target.value)}
            className="mt-1"
          />
        </div>
        <Separator className="my-4" />
        <div className="mt-4">
          <Label htmlFor="gallery-style">Estilo</Label>
          <Select
            value={block.data?.settings?.style || 'basic'}
            onValueChange={(value) => handleDataChange(['settings', 'style'], value)}
          >
            <SelectTrigger id="gallery-style" className="mt-1">
              <SelectValue placeholder="Seleccionar estilo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Básico (Carrusel)</SelectItem>
              <SelectItem value="thumbnails">Con miniaturas</SelectItem>
              <SelectItem value="grid">Cuadrícula</SelectItem>
              <SelectItem value="masonry">Masonry</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <Label className="flex items-center">
              <input
                type="checkbox"
                checked={block.data?.settings?.autoplay || false}
                onChange={(e) => handleDataChange(['settings', 'autoplay'], e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              Reproducción automática
            </Label>
          </div>
          <div>
            <Label className="flex items-center">
              <input
                type="checkbox"
                checked={block.data?.settings?.showDots || false}
                onChange={(e) => handleDataChange(['settings', 'showDots'], e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              Mostrar puntos
            </Label>
          </div>
          <div>
            <Label className="flex items-center">
              <input
                type="checkbox"
                checked={block.data?.settings?.showArrows || false}
                onChange={(e) => handleDataChange(['settings', 'showArrows'], e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              Mostrar flechas
            </Label>
          </div>
          <div>
            <Label className="flex items-center">
              <input
                type="checkbox"
                checked={block.data?.settings?.infinite || false}
                onChange={(e) => handleDataChange(['settings', 'infinite'], e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              Carrusel infinito
            </Label>
          </div>
          <div>
            <Label className="flex items-center">
              <input
                type="checkbox"
                checked={block.data?.settings?.enableLightbox || false}
                onChange={(e) => handleDataChange(['settings', 'enableLightbox'], e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              Habilitar lightbox
            </Label>
          </div>
          <div>
            <Label className="flex items-center">
              <input
                type="checkbox"
                checked={block.data?.settings?.enableCaptions || false}
                onChange={(e) => handleDataChange(['settings', 'enableCaptions'], e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              Mostrar pies de foto
            </Label>
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="gallery-aspectratio">Relación de aspecto</Label>
          <Select
            value={block.data?.settings?.aspectRatio || '16:9'}
            onValueChange={(value) => handleDataChange(['settings', 'aspectRatio'], value)}
          >
            <SelectTrigger id="gallery-aspectratio" className="mt-1">
              <SelectValue placeholder="Seleccionar relación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1:1">Cuadrado (1:1)</SelectItem>
              <SelectItem value="4:3">Estándar (4:3)</SelectItem>
              <SelectItem value="16:9">Panorámico (16:9)</SelectItem>
              <SelectItem value="auto">Automático</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4">
          <Label htmlFor="gallery-animation">Tipo de animación</Label>
          <Select
            value={block.data?.settings?.animation || 'slide'}
            onValueChange={(value) => handleDataChange(['settings', 'animation'], value)}
          >
            <SelectTrigger id="gallery-animation" className="mt-1">
              <SelectValue placeholder="Seleccionar animación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="slide">Deslizar</SelectItem>
              <SelectItem value="fade">Desvanecer</SelectItem>
              <SelectItem value="zoom">Zoom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4">
          <Label htmlFor="gallery-imgfit">Ajuste de imagen</Label>
          <Select
            value={block.data?.settings?.imgFit || 'cover'}
            onValueChange={(value) => handleDataChange(['settings', 'imgFit'], value)}
          >
            <SelectTrigger id="gallery-imgfit" className="mt-1">
              <SelectValue placeholder="Seleccionar ajuste" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cover">Cubrir (recortar)</SelectItem>
              <SelectItem value="contain">Contener (completa)</SelectItem>
              <SelectItem value="fill">Llenar (estirar)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Separator className="my-4" />
        <div className="mt-4">
          <Label className="block mb-2">Imágenes de la galería</Label>
          <div className="space-y-4 max-h-60 overflow-y-auto p-2 border rounded">
            {block.data?.images?.map((image: any, index: number) => (
              <div key={image.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                {image.thumbnailUrl || image.url ? (
                  <img 
                    src={image.thumbnailUrl || image.url} 
                    alt={image.title} 
                    className="w-12 h-12 object-cover rounded" 
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-400">Sin imagen</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{image.title || `Imagen ${index + 1}`}</p>
                  <p className="text-xs text-gray-500 truncate">{image.caption || 'Sin descripción'}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-destructive" 
                  onClick={() => {
                    const updatedImages = [...(block.data?.images || [])];
                    updatedImages.splice(index, 1);
                    handleDataChange(['images'], updatedImages);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {(!block.data?.images || block.data.images.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">No hay imágenes en la galería</p>
            )}
          </div>
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => {
                const newImage = {
                  id: Math.random().toString(36).substring(2, 11),
                  url: 'https://images.unsplash.com/photo-1682685797507-d44d838b0ac7?q=80&w=1000',
                  thumbnailUrl: 'https://images.unsplash.com/photo-1682685797507-d44d838b0ac7?q=80&w=200',
                  title: `Nueva imagen ${(block.data?.images?.length || 0) + 1}`,
                  caption: '',
                  altText: ''
                };
                const updatedImages = [...(block.data?.images || []), newImage];
                handleDataChange(['images'], updatedImages);
              }}
            >
              Añadir imagen
            </Button>
          </div>
        </div>
      </>
    );
  };

  // Renderizar propiedades del bloque CTA
  const renderCTAProperties = () => {
    return (
      <>
        <div>
          <Label htmlFor="cta-title">Título</Label>
          <Input
            id="cta-title"
            value={block.data?.title || ''}
            onChange={(e) => handleDataChange(['title'], e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="mt-4">
          <Label htmlFor="cta-subtitle">Subtítulo</Label>
          <Input
            id="cta-subtitle"
            value={block.data?.subtitle || ''}
            onChange={(e) => handleDataChange(['subtitle'], e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="mt-4">
          <Label htmlFor="cta-description">Descripción</Label>
          <Textarea
            id="cta-description"
            value={block.data?.description || ''}
            onChange={(e) => handleDataChange(['description'], e.target.value)}
            className="mt-1"
          />
        </div>
        <Separator className="my-4" />
        <div className="mt-4">
          <Label htmlFor="cta-primary-text">Texto del botón principal</Label>
          <Input
            id="cta-primary-text"
            value={block.data?.primaryButtonText || 'Acción Principal'}
            onChange={(e) => handleDataChange(['primaryButtonText'], e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="mt-4">
          <Label htmlFor="cta-primary-url">URL del botón principal</Label>
          <Input
            id="cta-primary-url"
            value={block.data?.primaryButtonUrl || '#'}
            onChange={(e) => handleDataChange(['primaryButtonUrl'], e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="mt-4">
          <Label htmlFor="cta-primary-variant">Variante del botón principal</Label>
          <Select
            value={block.data?.primaryButtonVariant || 'default'}
            onValueChange={(value) => handleDataChange(['primaryButtonVariant'], value)}
          >
            <SelectTrigger id="cta-primary-variant" className="mt-1">
              <SelectValue placeholder="Seleccionar variante" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Por defecto</SelectItem>
              <SelectItem value="outline">Contorno</SelectItem>
              <SelectItem value="ghost">Fantasma</SelectItem>
              <SelectItem value="link">Enlace</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4">
          <Label htmlFor="cta-secondary-text">Texto del botón secundario</Label>
          <Input
            id="cta-secondary-text"
            value={block.data?.secondaryButtonText || ''}
            onChange={(e) => handleDataChange(['secondaryButtonText'], e.target.value)}
            className="mt-1"
            placeholder="Opcional"
          />
        </div>
        <div className="mt-4">
          <Label htmlFor="cta-secondary-url">URL del botón secundario</Label>
          <Input
            id="cta-secondary-url"
            value={block.data?.secondaryButtonUrl || '#'}
            onChange={(e) => handleDataChange(['secondaryButtonUrl'], e.target.value)}
            className="mt-1"
            placeholder="Opcional"
          />
        </div>
        <div className="mt-4">
          <Label htmlFor="cta-secondary-variant">Variante del botón secundario</Label>
          <Select
            value={block.data?.secondaryButtonVariant || 'outline'}
            onValueChange={(value) => handleDataChange(['secondaryButtonVariant'], value)}
          >
            <SelectTrigger id="cta-secondary-variant" className="mt-1">
              <SelectValue placeholder="Seleccionar variante" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Por defecto</SelectItem>
              <SelectItem value="outline">Contorno</SelectItem>
              <SelectItem value="ghost">Fantasma</SelectItem>
              <SelectItem value="link">Enlace</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Separator className="my-4" />
        <div className="mt-4">
          <Label htmlFor="cta-style">Estilo del CTA</Label>
          <Select
            value={block.data?.settings?.style || 'basic'}
            onValueChange={(value) => handleDataChange(['settings', 'style'], value)}
          >
            <SelectTrigger id="cta-style" className="mt-1">
              <SelectValue placeholder="Seleccionar estilo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Básico</SelectItem>
              <SelectItem value="outlined">Con borde</SelectItem>
              <SelectItem value="full-width">Ancho completo</SelectItem>
              <SelectItem value="card">Tarjeta</SelectItem>
              <SelectItem value="banner">Banner</SelectItem>
              <SelectItem value="split">Dividido</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4">
          <Label htmlFor="cta-position">Posición del contenido</Label>
          <Select
            value={block.data?.settings?.position || 'center'}
            onValueChange={(value) => handleDataChange(['settings', 'position'], value)}
          >
            <SelectTrigger id="cta-position" className="mt-1">
              <SelectValue placeholder="Seleccionar posición" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Izquierda</SelectItem>
              <SelectItem value="center">Centro</SelectItem>
              <SelectItem value="right">Derecha</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4">
          <Label htmlFor="cta-color">Esquema de color</Label>
          <Select
            value={block.data?.settings?.colorScheme || 'primary'}
            onValueChange={(value) => handleDataChange(['settings', 'colorScheme'], value)}
          >
            <SelectTrigger id="cta-color" className="mt-1">
              <SelectValue placeholder="Seleccionar color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Primario</SelectItem>
              <SelectItem value="secondary">Secundario</SelectItem>
              <SelectItem value="accent">Acento</SelectItem>
              <SelectItem value="neutral">Neutro</SelectItem>
              <SelectItem value="success">Éxito</SelectItem>
              <SelectItem value="warning">Advertencia</SelectItem>
              <SelectItem value="destructive">Destructivo</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {block.data?.settings?.colorScheme === 'custom' && (
          <>
            <div className="mt-4">
              <Label htmlFor="cta-custom-bg">Color de fondo personalizado</Label>
              <Input
                id="cta-custom-bg"
                type="color"
                value={block.data?.settings?.customBgColor || '#ffffff'}
                onChange={(e) => handleDataChange(['settings', 'customBgColor'], e.target.value)}
                className="mt-1 h-10 w-full"
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="cta-custom-text">Color de texto personalizado</Label>
              <Input
                id="cta-custom-text"
                type="color"
                value={block.data?.settings?.customTextColor || '#000000'}
                onChange={(e) => handleDataChange(['settings', 'customTextColor'], e.target.value)}
                className="mt-1 h-10 w-full"
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="cta-custom-button">Color del botón personalizado</Label>
              <Input
                id="cta-custom-button"
                type="color"
                value={block.data?.settings?.customButtonColor || '#0284c7'}
                onChange={(e) => handleDataChange(['settings', 'customButtonColor'], e.target.value)}
                className="mt-1 h-10 w-full"
              />
            </div>
          </>
        )}
        <div className="mt-4">
          <Label htmlFor="cta-size">Tamaño de botones</Label>
          <Select
            value={block.data?.settings?.size || 'medium'}
            onValueChange={(value) => handleDataChange(['settings', 'size'], value)}
          >
            <SelectTrigger id="cta-size" className="mt-1">
              <SelectValue placeholder="Seleccionar tamaño" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Pequeño</SelectItem>
              <SelectItem value="medium">Mediano</SelectItem>
              <SelectItem value="large">Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <Label className="flex items-center">
              <input
                type="checkbox"
                checked={block.data?.settings?.showIcon || false}
                onChange={(e) => handleDataChange(['settings', 'showIcon'], e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              Mostrar icono
            </Label>
          </div>
          <div>
            <Label className="flex items-center">
              <input
                type="checkbox"
                checked={block.data?.settings?.rounded || true}
                onChange={(e) => handleDataChange(['settings', 'rounded'], e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              Bordes redondeados
            </Label>
          </div>
          <div>
            <Label className="flex items-center">
              <input
                type="checkbox"
                checked={block.data?.settings?.shadow || false}
                onChange={(e) => handleDataChange(['settings', 'shadow'], e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              Sombra
            </Label>
          </div>
          <div>
            <Label className="flex items-center">
              <input
                type="checkbox"
                checked={block.data?.settings?.fullHeight || false}
                onChange={(e) => handleDataChange(['settings', 'fullHeight'], e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              Altura completa
            </Label>
          </div>
          <div>
            <Label className="flex items-center">
              <input
                type="checkbox"
                checked={block.data?.settings?.showBorder || false}
                onChange={(e) => handleDataChange(['settings', 'showBorder'], e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              Mostrar borde
            </Label>
          </div>
        </div>
        {block.data?.settings?.style === 'banner' || block.data?.settings?.style === 'split' ? (
          <div className="mt-4">
            <Label htmlFor="cta-bgimage">URL de imagen de fondo</Label>
            <Input
              id="cta-bgimage"
              value={block.data?.settings?.bgImage || ''}
              onChange={(e) => handleDataChange(['settings', 'bgImage'], e.target.value)}
              className="mt-1"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>
        ) : null}
        <div className="mt-4">
          <Label htmlFor="cta-animation">Animación</Label>
          <Select
            value={block.data?.settings?.animation || 'none'}
            onValueChange={(value) => handleDataChange(['settings', 'animation'], value)}
          >
            <SelectTrigger id="cta-animation" className="mt-1">
              <SelectValue placeholder="Seleccionar animación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Ninguna</SelectItem>
              <SelectItem value="fade">Desvanecer</SelectItem>
              <SelectItem value="slideUp">Deslizar hacia arriba</SelectItem>
              <SelectItem value="pulse">Pulso</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {['card', 'outlined', 'basic'].includes(block.data?.settings?.style || 'basic') && (
          <div className="mt-4">
            <Label htmlFor="cta-maxwidth">Ancho máximo</Label>
            <Input
              id="cta-maxwidth"
              value={block.data?.settings?.maxWidth || ''}
              onChange={(e) => handleDataChange(['settings', 'maxWidth'], e.target.value)}
              className="mt-1"
              placeholder="ej: 800px, 50%, etc."
            />
          </div>
        )}
        <div className="mt-4">
          <Label htmlFor="cta-spacing">Espaciado</Label>
          <Select
            value={block.data?.settings?.spacing || 'normal'}
            onValueChange={(value) => handleDataChange(['settings', 'spacing'], value)}
          >
            <SelectTrigger id="cta-spacing" className="mt-1">
              <SelectValue placeholder="Seleccionar espaciado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Compacto</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="loose">Amplio</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {block.data?.settings?.showIcon && (
          <div className="mt-4">
            <Label htmlFor="cta-icon-position">Posición del icono</Label>
            <Select
              value={block.data?.settings?.iconPosition || 'right'}
              onValueChange={(value) => handleDataChange(['settings', 'iconPosition'], value)}
            >
              <SelectTrigger id="cta-icon-position" className="mt-1">
                <SelectValue placeholder="Seleccionar posición" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Izquierda</SelectItem>
                <SelectItem value="right">Derecha</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </>
    );
  };

  // Render different property fields based on block type
  const renderBlockProperties = () => {
    switch (block.type) {
      case BlockType.CTA:
        return renderCTAProperties();
      case BlockType.GALLERY:
        return renderGalleryProperties();
      case BlockType.HEADER:
        return (
          <>
            <div>
              <Label htmlFor="heading-title">Título</Label>
              <Input
                id="heading-title"
                value={localContent.title || ''}
                onChange={(e) => handleContentChange(['title'], e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="heading-subtitle">Subtítulo</Label>
              <Input
                id="heading-subtitle"
                value={localContent.subtitle || ''}
                onChange={(e) => handleContentChange(['subtitle'], e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="heading-alignment">Alineación</Label>
              <Select 
                value={localContent.alignment || 'center'}
                onValueChange={(value) => handleContentChange(['alignment'], value)}
              >
                <SelectTrigger id="heading-alignment" className="mt-1">
                  <SelectValue placeholder="Seleccionar alineación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Izquierda</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="right">Derecha</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case BlockType.FEATURES:
        return (
          <>
            <div>
              <Label htmlFor="features-title">Título de la sección</Label>
              <Input
                id="features-title"
                value={localContent.title || ''}
                onChange={(e) => handleContentChange(['title'], e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="mt-4">
              <Label>Características</Label>
              {localContent.features && localContent.features.map((feature: any, index: number) => (
                <div key={feature.id} className="mt-2 p-3 border border-gray-200 rounded-md">
                  <Label htmlFor={`feature-title-${index}`}>Título</Label>
                  <Input
                    id={`feature-title-${index}`}
                    value={feature.title || ''}
                    onChange={(e) => {
                      const newFeatures = [...localContent.features];
                      newFeatures[index].title = e.target.value;
                      handleContentChange(['features'], newFeatures);
                    }}
                    className="mt-1"
                  />
                  <Label htmlFor={`feature-description-${index}`} className="mt-2 block">Descripción</Label>
                  <Textarea
                    id={`feature-description-${index}`}
                    value={feature.description || ''}
                    onChange={(e) => {
                      const newFeatures = [...localContent.features];
                      newFeatures[index].description = e.target.value;
                      handleContentChange(['features'], newFeatures);
                    }}
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
          </>
        );

      case BlockType.TEXT_MEDIA:
        return (
          <>
            <div>
              <Label htmlFor="text-media-title">Título</Label>
              <Input
                id="text-media-title"
                value={localContent.title || ''}
                onChange={(e) => handleContentChange(['title'], e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="text-media-text">Texto</Label>
              <Textarea
                id="text-media-text"
                value={localContent.text || ''}
                onChange={(e) => handleContentChange(['text'], e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="text-media-layout">Diseño</Label>
              <Select 
                value={localSettings.appearance.layout || 'image-left'}
                onValueChange={(value) => handleSettingChange(['appearance', 'layout'], value)}
              >
                <SelectTrigger id="text-media-layout" className="mt-1">
                  <SelectValue placeholder="Seleccionar diseño" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image-left">Imagen a la izquierda</SelectItem>
                  <SelectItem value="image-right">Imagen a la derecha</SelectItem>
                  <SelectItem value="image-top">Imagen arriba</SelectItem>
                  <SelectItem value="image-bottom">Imagen abajo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4">
              <Label htmlFor="text-media-cta">Texto del botón</Label>
              <Input
                id="text-media-cta"
                value={localContent.ctaText || ''}
                onChange={(e) => handleContentChange(['ctaText'], e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="text-media-url">URL del botón</Label>
              <Input
                id="text-media-url"
                value={localContent.ctaUrl || ''}
                onChange={(e) => handleContentChange(['ctaUrl'], e.target.value)}
                className="mt-1"
              />
            </div>
          </>
        );

      default:
        return <div>No hay propiedades disponibles para este tipo de bloque.</div>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Propiedades</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {/* Block type */}
        <div className="mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
            {block.type}
          </span>
        </div>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="content">
              <LayoutIcon className="h-4 w-4 mr-1" />
              Contenido
            </TabsTrigger>
            <TabsTrigger value="style">
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              Estilo
            </TabsTrigger>
            <TabsTrigger value="animation">
              <Wand className="h-4 w-4 mr-1" />
              Animación
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-6">
            {/* Block specific properties */}
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Contenido</h3>
              <div className="space-y-4">
                {renderBlockProperties()}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="style" className="space-y-6">
            {/* Spacing */}
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Espaciado</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="margin-top">Margen superior</Label>
                  <Input
                    type="number"
                    id="margin-top"
                    value={localSettings.spacing?.marginTop || 0}
                    onChange={(e) => handleSettingChange(['spacing', 'marginTop'], parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="margin-bottom">Margen inferior</Label>
                  <Input
                    type="number"
                    id="margin-bottom"
                    value={localSettings.spacing?.marginBottom || 0}
                    onChange={(e) => handleSettingChange(['spacing', 'marginBottom'], parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="animation" className="space-y-6">
            {/* Animación */}
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Configuración de animación</h3>
              <div className="space-y-4">
                {blockId && <AnimationPanel blockId={blockId} />}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Background settings */}
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Fondo</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="background-color">Color de fondo</Label>
              <div className="flex space-x-2 mt-2">
                <div 
                  className={`w-8 h-8 rounded-md cursor-pointer ${localSettings.appearance?.backgroundColor === 'white' ? 'ring-2 ring-primary' : ''} bg-white border border-gray-300`}
                  onClick={() => handleSettingChange(['appearance', 'backgroundColor'], 'white')}
                ></div>
                <div 
                  className={`w-8 h-8 rounded-md cursor-pointer ${localSettings.appearance?.backgroundColor === '#F3F4F6' ? 'ring-2 ring-primary' : ''} bg-gray-100 border border-transparent`}
                  onClick={() => handleSettingChange(['appearance', 'backgroundColor'], '#F3F4F6')}
                ></div>
                <div 
                  className={`w-8 h-8 rounded-md cursor-pointer ${localSettings.appearance?.backgroundColor === '#EFF6FF' ? 'ring-2 ring-primary' : ''} bg-blue-50 border border-transparent`}
                  onClick={() => handleSettingChange(['appearance', 'backgroundColor'], '#EFF6FF')}
                ></div>
                <div 
                  className={`w-8 h-8 rounded-md cursor-pointer ${localSettings.appearance?.backgroundColor === '#ECFDF5' ? 'ring-2 ring-primary' : ''} bg-green-50 border border-transparent`}
                  onClick={() => handleSettingChange(['appearance', 'backgroundColor'], '#ECFDF5')}
                ></div>
                <div 
                  className={`w-8 h-8 rounded-md cursor-pointer ${localSettings.appearance?.backgroundColor === '#FFFBEB' ? 'ring-2 ring-primary' : ''} bg-yellow-50 border border-transparent`}
                  onClick={() => handleSettingChange(['appearance', 'backgroundColor'], '#FFFBEB')}
                ></div>
                <div 
                  className={`w-8 h-8 rounded-md cursor-pointer ${localSettings.appearance?.backgroundColor === '#FEF2F2' ? 'ring-2 ring-primary' : ''} bg-red-50 border border-transparent`}
                  onClick={() => handleSettingChange(['appearance', 'backgroundColor'], '#FEF2F2')}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 flex items-center justify-end space-x-3">
        <Button variant="outline" onClick={handleReset}>
          Reiniciar
        </Button>
        <Button onClick={handleApply}>
          Aplicar
        </Button>
      </div>
    </div>
  );
};

export default PropertiesPanel;
