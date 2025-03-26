import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';
import { usePageStore } from '@/lib/store';
import { Block, BlockType } from '@shared/types';

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

  // Render different property fields based on block type
  const renderBlockProperties = () => {
    switch (block.type) {
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

      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
        {/* Block type */}
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Tipo de bloque</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
            {block.type}
          </span>
        </div>

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

        {/* Block specific properties */}
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Contenido</h3>
          <div className="space-y-4">
            {renderBlockProperties()}
          </div>
        </div>

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
