import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopNavbar from '@/components/layout/TopNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import MediaUpload from '@/components/media/MediaUpload';
import { Image, Search, Filter, SortAsc, Grid, List, MoreVertical, ExternalLink, Download, Edit, Trash, Upload } from 'lucide-react';

interface MediaFile {
  id: number;
  name: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  folder: string;
  uploadedById: number;
  createdAt: string;
}

const MediaIndex: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('all');
  
  // Fetch media files
  const { data, isLoading } = useQuery<{
    items: MediaFile[],
    totalItems: number,
    folders: { id: string, name: string }[]
  }>({
    queryKey: ['/api/media', searchTerm, fileTypeFilter, selectedFolder],
    queryFn: async () => {
      const response = await fetch(
        `/api/media?search=${searchTerm}&type=${fileTypeFilter}&folder=${selectedFolder}`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to fetch media');
      return response.json();
    }
  });
  
  // Delete media mutation
  const deleteMutation = useMutation({
    mutationFn: async (mediaId: number) => {
      return apiRequest('DELETE', `/api/media/${mediaId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      toast({
        title: "Archivo eliminado",
        description: "El archivo ha sido eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar el archivo: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  const handleDelete = (mediaId: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este archivo? Esta acción no se puede deshacer.')) {
      deleteMutation.mutate(mediaId);
    }
  };
  
  const handleEditMedia = (media: MediaFile) => {
    // In a real app, this would open an edit modal or navigate to edit page
    toast({
      title: "Editar medio",
      description: `Esta funcionalidad permitiría editar ${media.name}`,
    });
  };
  
  const handleUploadComplete = (uploadedMedia: any) => {
    queryClient.invalidateQueries({ queryKey: ['/api/media'] });
    setIsUploadModalOpen(false);
    toast({
      title: "Archivos subidos",
      description: `Se han subido ${uploadedMedia.length || 1} archivos correctamente.`,
    });
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is triggered by the query key change
  };
  
  // Helper to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Helper to get icon for file type
  const getFileTypeIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (fileType.startsWith('video/')) {
      return <Film className="h-5 w-5 text-purple-500" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const mediaItems = data?.items || [];
  const folders = data?.folders || [];
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar 
          pageTitle="Biblioteca de medios" 
          actions={
            <Button size="sm" onClick={() => setIsUploadModalOpen(true)}>
              <Upload className="h-4 w-4 mr-1" />
              Subir archivos
            </Button>
          }
        />
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Card>
            <CardContent className="p-6">
              {/* Filters and search */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Buscar archivos..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </form>
                
                <div className="flex gap-2">
                  <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="image">Imágenes</SelectItem>
                      <SelectItem value="video">Vídeos</SelectItem>
                      <SelectItem value="document">Documentos</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                    <SelectTrigger className="w-[180px]">
                      <Folder className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Carpeta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las carpetas</SelectItem>
                      {folders.map(folder => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex border rounded-md overflow-hidden">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-none border-0"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-none border-0"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Media type tabs */}
              <Tabs defaultValue="all" className="mb-6">
                <TabsList>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="images">Imágenes</TabsTrigger>
                  <TabsTrigger value="videos">Vídeos</TabsTrigger>
                  <TabsTrigger value="documents">Documentos</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Media Content */}
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array(10).fill(0).map((_, i) => (
                    <div key={i} className="bg-white rounded-md border border-gray-200 overflow-hidden animate-pulse">
                      <div className="aspect-square bg-gray-200"></div>
                      <div className="p-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : mediaItems.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {mediaItems.map((media) => (
                      <div key={media.id} className="bg-white rounded-md border border-gray-200 overflow-hidden group relative">
                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                          {media.fileType.startsWith('image/') ? (
                            <img 
                              src={media.thumbnailUrl || media.url} 
                              alt={media.alt || media.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-4">
                              {getFileTypeIcon(media.fileType)}
                              <span className="text-xs mt-1 text-gray-500">
                                {media.fileType.split('/')[1].toUpperCase()}
                              </span>
                            </div>
                          )}
                          
                          {/* Overlay actions */}
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex space-x-1">
                              <Button variant="secondary" size="sm" asChild>
                                <a href={media.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button variant="secondary" size="sm" asChild>
                                <a href={media.url} download>
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={() => handleEditMedia(media)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDelete(media.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-3">
                          <p className="text-sm font-medium truncate">{media.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(media.size)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Archivo
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tamaño
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Acciones</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {mediaItems.map((media) => (
                          <tr key={media.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                                  {media.fileType.startsWith('image/') ? (
                                    <img 
                                      src={media.thumbnailUrl || media.url} 
                                      alt={media.alt || media.name} 
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    getFileTypeIcon(media.fileType)
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                    {media.name}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate max-w-xs">
                                    {media.fileName}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-500">
                                {media.fileType.split('/')[1].toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatFileSize(media.size)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(media.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <a 
                                      href={media.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="flex items-center"
                                    >
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Ver
                                    </a>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <a 
                                      href={media.url} 
                                      download 
                                      className="flex items-center"
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Descargar
                                    </a>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditMedia(media)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDelete(media.id)} className="text-red-600">
                                    <Trash className="h-4 w-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No hay archivos</h3>
                  <p className="text-gray-500 mb-4 max-w-md mx-auto">
                    No se encontraron archivos con los filtros actuales. Prueba a cambiar los filtros o sube nuevos archivos.
                  </p>
                  <Button onClick={() => setIsUploadModalOpen(true)}>
                    <Upload className="h-4 w-4 mr-1" />
                    Subir archivos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      
      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Subir archivos</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsUploadModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <MediaUpload 
              onUploadComplete={handleUploadComplete}
              multiple={true}
              allowedTypes={['image/*', 'video/*', 'application/pdf']}
              maxFileSize={10}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaIndex;
