import { useState } from 'react';
import { useTemplates } from '@/hooks/use-templates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BlockTemplate } from '@shared/schema';
import { Block, BlockType } from '@shared/types';
import { AlertCircle, Clock, Search, Tag, Trash2, Edit, Plus, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TemplatesLibraryProps {
  onSelectTemplate: (block: Block) => void;
}

export function TemplatesLibrary({ onSelectTemplate }: TemplatesLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<BlockTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<BlockTemplate | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  const { getTemplates, deleteTemplate, useTemplate } = useTemplates();
  const { data, isLoading, error } = getTemplates({ search: searchTerm, category: selectedCategory === 'all' ? undefined : selectedCategory });
  
  const handleSelectTemplate = async (template: BlockTemplate) => {
    try {
      const block = await useTemplate(template.id);
      onSelectTemplate(block);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error al usar la plantilla:', error);
    }
  };
  
  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    
    try {
      await deleteTemplate(templateToDelete.id);
      setTemplateToDelete(null);
    } catch (error) {
      console.error('Error al eliminar la plantilla:', error);
    }
  };
  
  const showTemplateDetails = (template: BlockTemplate) => {
    setSelectedTemplate(template);
    setShowDetailsDialog(true);
  };
  
  const categories = [
    { value: 'all', label: 'Todas' },
    { value: 'header', label: 'Encabezados' },
    { value: 'content', label: 'Contenido' },
    { value: 'media', label: 'Medios' },
    { value: 'call-to-action', label: 'Llamadas a la acción' },
    { value: 'feature', label: 'Características' },
    { value: 'pricing', label: 'Precios' },
    { value: 'testimonial', label: 'Testimonios' },
    { value: 'layout', label: 'Disposición' },
    { value: 'interactive', label: 'Interactivos' },
    { value: 'form', label: 'Formularios' },
    { value: 'other', label: 'Otros' },
  ];
  
  // Función auxiliar para obtener un nombre legible del tipo de bloque
  const getBlockTypeName = (type: BlockType): string => {
    const typeMap: Record<BlockType, string> = {
      [BlockType.HEADER]: 'Encabezado',
      [BlockType.PARAGRAPH]: 'Párrafo',
      [BlockType.IMAGE]: 'Imagen',
      [BlockType.FEATURES]: 'Características',
      [BlockType.TEXT_MEDIA]: 'Texto con Medios',
      [BlockType.CTA]: 'Llamada a la acción',
      [BlockType.COLUMNS]: 'Columnas',
      [BlockType.VIDEO]: 'Video',
      [BlockType.TESTIMONIAL]: 'Testimonios',
      [BlockType.PRICING]: 'Precios',
      [BlockType.CONTACT]: 'Contacto',
      [BlockType.GALLERY]: 'Galería',
      [BlockType.FAQ]: 'Preguntas Frecuentes',
      [BlockType.HERO]: 'Hero',
      [BlockType.STATS]: 'Estadísticas',
      [BlockType.ACCORDION]: 'Acordeón',
      [BlockType.TABS]: 'Pestañas',
      [BlockType.TABLE]: 'Tabla',
    };
    
    return typeMap[type] || type;
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 pb-0">
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar plantillas..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <TabsList className="w-max">
              {categories.map((category) => (
                <TabsTrigger key={category.value} value={category.value}>
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </Tabs>
        <Separator className="mt-2" />
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2 mt-2" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6 mt-2" />
                </CardContent>
                <CardFooter className="p-4 pt-2 flex justify-between">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-lg font-semibold">Error al cargar las plantillas</h3>
            <p className="text-muted-foreground mt-2">
              Ha ocurrido un error al intentar cargar las plantillas. Por favor, intenta de nuevo más tarde.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </Button>
          </div>
        ) : data?.items?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Info className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No hay plantillas disponibles</h3>
            <p className="text-muted-foreground mt-2">
              {searchTerm || selectedCategory !== 'all'
                ? 'No se encontraron plantillas con los filtros seleccionados.'
                : 'Aún no hay plantillas guardadas. Guarda un bloque como plantilla para empezar.'}
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data?.items.map((template) => (
              <Card key={template.id} className="overflow-hidden transition-shadow hover:shadow-md">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base truncate">{template.name}</CardTitle>
                    <Badge variant="outline">{getBlockTypeName(template.block.type)}</Badge>
                  </div>
                  <CardDescription className="truncate">{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      {template.createdAt 
                        ? format(new Date(template.createdAt), 'PPP', { locale: es })
                        : 'Fecha desconocida'}
                    </span>
                    <Tag className="h-3 w-3 ml-3 mr-1" />
                    <span className="capitalize">{template.category || 'Sin categoría'}</span>
                  </div>
                  {template.usageCount !== undefined && template.usageCount > 0 && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      Usado {template.usageCount} {template.usageCount === 1 ? 'vez' : 'veces'}
                    </Badge>
                  )}
                </CardContent>
                <CardFooter className="p-4 pt-2 flex justify-between">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => showTemplateDetails(template)}
                      title="Ver detalles"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTemplateToDelete(template)}
                      title="Eliminar plantilla"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button onClick={() => handleSelectTemplate(template)} size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Usar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
      
      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La plantilla "{templateToDelete?.name}" será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Diálogo de detalles de la plantilla */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        {selectedTemplate && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                {selectedTemplate.name}
                <Badge variant="outline">{getBlockTypeName(selectedTemplate.block.type)}</Badge>
              </DialogTitle>
              <DialogDescription>{selectedTemplate.description}</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Detalles</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Categoría:</span>
                    <p className="capitalize">{selectedTemplate.category || 'Sin categoría'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fecha de creación:</span>
                    <p>
                      {selectedTemplate.createdAt 
                        ? format(new Date(selectedTemplate.createdAt), 'PPP', { locale: es })
                        : 'Desconocida'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Última actualización:</span>
                    <p>
                      {selectedTemplate.updatedAt 
                        ? format(new Date(selectedTemplate.updatedAt), 'PPP', { locale: es })
                        : 'No actualizada'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Veces utilizada:</span>
                    <p>{selectedTemplate.usageCount || 0}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Acciones</h4>
                <div className="flex space-x-2">
                  <Button onClick={() => handleSelectTemplate(selectedTemplate)} className="flex-1">
                    <Plus className="h-4 w-4 mr-1" /> Usar plantilla
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      setTimeout(() => setTemplateToDelete(selectedTemplate), 100);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}