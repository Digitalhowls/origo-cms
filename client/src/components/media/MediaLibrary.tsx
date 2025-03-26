import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { X, Upload, Edit, Trash2, Search, Filter, SortAsc } from 'lucide-react';
import { MediaFile } from '@shared/types';

interface MediaLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia?: (media: MediaFile) => void;
  selectedMedia?: MediaFile | null;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ 
  isOpen, 
  onClose, 
  onSelectMedia, 
  selectedMedia 
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaType, setMediaType] = useState('all');
  
  // Mock data - this would be fetched from API in a real implementation
  const mediaItems: MediaFile[] = [
    {
      id: 1,
      name: 'equipo-trabajo.jpg',
      fileName: 'equipo-trabajo.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      size: 245000,
      url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80',
      alt: 'Equipo trabajando',
      folder: '',
      uploadedById: 1,
      createdAt: '2023-01-15T00:00:00.000Z',
    },
    {
      id: 2,
      name: 'oficina-moderna.jpg',
      fileName: 'oficina-moderna.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      size: 180000,
      url: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80',
      alt: 'Oficina moderna',
      folder: '',
      uploadedById: 1,
      createdAt: '2023-01-10T00:00:00.000Z',
    },
  ];
  
  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = mediaType === 'all' || item.fileType === mediaType;
    return matchesSearch && matchesType;
  });
  
  const handleSelectMedia = (media: MediaFile) => {
    if (onSelectMedia) {
      onSelectMedia(media);
      toast({
        title: "Medio seleccionado",
        description: `${media.name} ha sido seleccionado.`,
      });
      onClose();
    }
  };
  
  const handleDeleteMedia = (media: MediaFile, e: React.MouseEvent) => {
    e.stopPropagation();
    // API call to delete media would go here
    toast({
      title: "Medio eliminado",
      description: `${media.name} ha sido eliminado.`,
    });
  };
  
  const handleEditMedia = (media: MediaFile, e: React.MouseEvent) => {
    e.stopPropagation();
    // Open edit dialog or navigate to edit page
    toast({
      title: "Editar medio",
      description: `Editando ${media.name}.`,
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-full">
        <DialogHeader>
          <DialogTitle>Biblioteca de medios</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar archivos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" />
              Filtrar
            </Button>
            <Button variant="outline" size="sm">
              <SortAsc className="h-4 w-4 mr-1" />
              Ordenar
            </Button>
            <Button size="sm">
              <Upload className="h-4 w-4 mr-1" />
              Subir archivo
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" value={mediaType} onValueChange={setMediaType}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="image">Imágenes</TabsTrigger>
            <TabsTrigger value="video">Vídeos</TabsTrigger>
            <TabsTrigger value="document">Documentos</TabsTrigger>
          </TabsList>
          
          <TabsContent value={mediaType} className="mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMedia.length > 0 ? (
                filteredMedia.map((media) => (
                  <div 
                    key={media.id} 
                    className={`relative group cursor-pointer ${selectedMedia?.id === media.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleSelectMedia(media)}
                  >
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-100">
                      {media.fileType === 'image' ? (
                        <img 
                          src={media.thumbnailUrl || media.url} 
                          alt={media.alt || media.name} 
                          className="object-cover"
                        />
                      ) : media.fileType === 'video' ? (
                        <div className="flex items-center justify-center bg-gray-800 text-white h-full">
                          <span>Video</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center bg-gray-100 text-gray-500 h-full">
                          <span>Documento</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="mx-1"
                          onClick={(e) => handleSelectMedia(media)}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="mx-1"
                          onClick={(e) => handleEditMedia(media, e)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="mx-1"
                          onClick={(e) => handleDeleteMedia(media, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-700 truncate">{media.name}</p>
                    <p className="text-xs text-gray-500">
                      {media.fileType === 'image' ? '800 x 600' : ''} • {Math.round(media.size / 1024)} KB
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-gray-500">
                  No se encontraron archivos.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MediaLibrary;
