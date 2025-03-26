import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopNavbar from '@/components/layout/TopNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Check, 
  Eye, 
  Calendar as CalendarIcon, 
  Clock, 
  XCircle,
  ImageIcon,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import MediaLibrary from '@/components/media/MediaLibrary';
import { es } from 'date-fns/locale';

interface BlogPostData {
  id?: number;
  title: string;
  slug: string;
  summary?: string;
  content: any; // This would be JSON or a rich content structure
  featuredImage?: string;
  status: 'draft' | 'published' | 'archived';
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
  categories?: number[];
  tags?: string[];
  publishedAt?: string;
}

const BlogEditor: React.FC = () => {
  const params = useParams<{ id: string }>();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('editor');
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('12:00');
  const [isScheduled, setIsScheduled] = useState(false);
  
  const postId = params.id ? parseInt(params.id) : undefined;
  
  // Form state
  const [formData, setFormData] = useState<BlogPostData>({
    title: '',
    slug: '',
    summary: '',
    content: {},
    status: 'draft',
    categories: [],
    tags: [],
  });
  
  // Fetch post data if editing an existing post
  const { data: postData, isLoading: isPostLoading } = useQuery({
    queryKey: postId ? [`/api/blog/${postId}`] : null,
    enabled: !!postId,
  });
  
  // Fetch categories
  const { data: categories, isLoading: areCategoriesLoading } = useQuery({
    queryKey: ['/api/blog/categories'],
  });
  
  // Fetch tags
  const { data: tags, isLoading: areTagsLoading } = useQuery({
    queryKey: ['/api/blog/tags'],
  });
  
  // Set form data from fetched post
  useEffect(() => {
    if (postData) {
      setFormData(postData);
      if (postData.publishedAt) {
        const publishedDate = new Date(postData.publishedAt);
        setSelectedDate(publishedDate);
        setSelectedTime(format(publishedDate, 'HH:mm'));
        setIsScheduled(true);
      }
    }
  }, [postData]);
  
  // Handle auto-slug generation
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  };
  
  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'title' && !formData.slug) {
      // Auto-generate slug from title if slug is empty
      setFormData({
        ...formData,
        title: value,
        slug: generateSlug(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  // Handle category selection
  const handleCategoryChange = (selectedIds: string[]) => {
    setFormData({
      ...formData,
      categories: selectedIds.map(id => parseInt(id)),
    });
  };
  
  // Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (newTag && !formData.tags?.includes(newTag)) {
        setFormData({
          ...formData,
          tags: [...(formData.tags || []), newTag],
        });
        e.currentTarget.value = '';
      }
    }
  };
  
  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove),
    });
  };
  
  // Handle media selection
  const handleMediaSelect = (media: any) => {
    setFormData({
      ...formData,
      featuredImage: media.url,
    });
    setIsMediaLibraryOpen(false);
  };
  
  // Handle scheduled publishing
  const handleScheduleToggle = (enabled: boolean) => {
    setIsScheduled(enabled);
    if (!enabled) {
      setSelectedDate(undefined);
    }
  };
  
  // Create combined datetime from date and time
  const getScheduledDateTime = () => {
    if (!selectedDate) return null;
    
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledDate = new Date(selectedDate);
    scheduledDate.setHours(hours, minutes, 0, 0);
    
    return scheduledDate;
  };
  
  // Save/publish post mutation
  const saveMutation = useMutation({
    mutationFn: async (action: 'save' | 'publish' | 'schedule') => {
      let postPayload = { ...formData };
      
      if (action === 'publish') {
        postPayload.status = 'published';
        postPayload.publishedAt = new Date().toISOString();
      } else if (action === 'schedule' && isScheduled) {
        const scheduledDateTime = getScheduledDateTime();
        if (scheduledDateTime) {
          postPayload.status = 'draft'; // Will be published automatically later
          postPayload.publishedAt = scheduledDateTime.toISOString();
        }
      }
      
      const method = postId ? 'PATCH' : 'POST';
      const url = postId ? `/api/blog/${postId}` : '/api/blog';
      
      const response = await apiRequest(method, url, postPayload);
      return await response.json();
    },
    onSuccess: (data, variables) => {
      const action = variables;
      let message = "El artículo ha sido guardado como borrador.";
      
      if (action === 'publish') {
        message = "El artículo ha sido publicado.";
      } else if (action === 'schedule' && isScheduled) {
        message = "El artículo ha sido programado para publicación.";
      }
      
      toast({
        title: "Éxito",
        description: message,
      });
      
      // Redirect to edit page if this was a new post
      if (!postId && data.id) {
        setLocation(`/blog/edit/${data.id}`);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo guardar el artículo: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  const handleSaveDraft = () => {
    saveMutation.mutate('save');
  };
  
  const handlePublish = () => {
    saveMutation.mutate('publish');
  };
  
  const handleSchedule = () => {
    if (isScheduled && !selectedDate) {
      toast({
        title: "Error",
        description: "Por favor, selecciona una fecha para programar la publicación.",
        variant: "destructive",
      });
      return;
    }
    
    saveMutation.mutate('schedule');
  };
  
  const handlePreview = () => {
    // Handle preview - could be API call to generate temporary preview
    window.open(`/api/preview/blog/${formData.slug}`, '_blank');
  };
  
  // Selectors for rendering the multi-select components
  const selectedCategories = formData.categories || [];
  const selectedCategoryItems = categories?.filter(
    (cat: any) => selectedCategories.includes(cat.id)
  ) || [];
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar 
          pageTitle={postId ? "Editar artículo" : "Nuevo artículo"}
          actions={
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={handleSaveDraft} 
                disabled={saveMutation.isPending}
              >
                Guardar borrador
              </Button>
              <Button 
                variant="outline" 
                onClick={handlePreview} 
                className="text-primary"
              >
                <Eye className="h-4 w-4 mr-1" />
                Vista previa
              </Button>
              <Button 
                onClick={handlePublish} 
                disabled={saveMutation.isPending}
              >
                <Check className="h-4 w-4 mr-1" />
                Publicar
              </Button>
            </div>
          }
        />
        
        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {isPostLoading ? (
              <div className="flex justify-center p-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {/* Title and Slug */}
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Título</Label>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="mt-1"
                          placeholder="Ingresa el título del artículo"
                        />
                      </div>
                      <div>
                        <Label htmlFor="slug">URL amigable</Label>
                        <div className="flex rounded-md shadow-sm mt-1">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                            /blog/
                          </span>
                          <Input
                            id="slug"
                            name="slug"
                            value={formData.slug}
                            onChange={handleInputChange}
                            className="rounded-none rounded-r-md"
                            placeholder="url-amigable"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Editor and Settings Tabs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Main Editor Area */}
                  <div className="md:col-span-2">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="mb-4">
                        <TabsTrigger value="editor">
                          <FileText className="h-4 w-4 mr-2" />
                          Editor
                        </TabsTrigger>
                        <TabsTrigger value="settings">
                          <FileText className="h-4 w-4 mr-2" />
                          SEO
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="editor" className="space-y-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="summary">Resumen</Label>
                                <Textarea
                                  id="summary"
                                  name="summary"
                                  value={formData.summary || ''}
                                  onChange={handleInputChange}
                                  className="mt-1 h-24"
                                  placeholder="Breve resumen del artículo (opcional)"
                                />
                              </div>
                              
                              <div>
                                <Label>Contenido del artículo</Label>
                                <div className="border rounded-md p-4 mt-1 min-h-[300px] bg-white">
                                  {/* Simple content textarea for now - in production would use rich text editor */}
                                  <Textarea
                                    name="content"
                                    className="min-h-[280px] border-none focus-visible:ring-0 resize-none"
                                    placeholder="Escribe el contenido del artículo aquí..."
                                    value={typeof formData.content === 'string' ? formData.content : JSON.stringify(formData.content)}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                  />
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                  Nota: En la implementación real, aquí iría un editor enriquecido como TipTap o Editor.js
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="settings" className="space-y-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="seo-title">Título SEO</Label>
                                <Input
                                  id="seo-title"
                                  name="seo.metaTitle"
                                  value={formData.seo?.metaTitle || ''}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    seo: { ...(formData.seo || {}), metaTitle: e.target.value }
                                  })}
                                  className="mt-1"
                                  placeholder="Título optimizado para SEO (si es diferente del título principal)"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="seo-description">Descripción meta</Label>
                                <Textarea
                                  id="seo-description"
                                  name="seo.metaDescription"
                                  value={formData.seo?.metaDescription || ''}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    seo: { ...(formData.seo || {}), metaDescription: e.target.value }
                                  })}
                                  className="mt-1"
                                  placeholder="Descripción breve para resultados de búsqueda"
                                />
                              </div>
                              
                              <div>
                                <Label>Imagen para redes sociales</Label>
                                <div className="mt-1">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setIsMediaLibraryOpen(true)}
                                    className="w-full"
                                  >
                                    {formData.seo?.ogImage ? 'Cambiar imagen OG' : 'Seleccionar imagen OG'}
                                  </Button>
                                  
                                  {formData.seo?.ogImage && (
                                    <div className="mt-2 relative rounded-md overflow-hidden">
                                      <img 
                                        src={formData.seo.ogImage} 
                                        alt="OG Preview" 
                                        className="w-full object-cover h-40"
                                      />
                                      <Button 
                                        variant="destructive" 
                                        size="sm" 
                                        className="absolute top-2 right-2"
                                        onClick={() => setFormData({
                                          ...formData,
                                          seo: { ...(formData.seo || {}), ogImage: '' }
                                        })}
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>
                  
                  {/* Sidebar Settings */}
                  <div className="space-y-6">
                    {/* Featured Image */}
                    <Card>
                      <CardContent className="pt-6">
                        <Label>Imagen destacada</Label>
                        <div className="mt-2">
                          {formData.featuredImage ? (
                            <div className="relative rounded-md overflow-hidden">
                              <img 
                                src={formData.featuredImage} 
                                alt="Featured" 
                                className="w-full object-cover h-40"
                              />
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="absolute top-2 right-2"
                                onClick={() => setFormData({
                                  ...formData,
                                  featuredImage: ''
                                })}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div 
                              className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                              onClick={() => setIsMediaLibraryOpen(true)}
                            >
                              <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">Añadir imagen destacada</p>
                            </div>
                          )}
                          
                          {formData.featuredImage && (
                            <Button 
                              variant="outline" 
                              onClick={() => setIsMediaLibraryOpen(true)}
                              className="w-full mt-2"
                            >
                              Cambiar imagen
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Categories */}
                    <Card>
                      <CardContent className="pt-6">
                        <Label>Categorías</Label>
                        <Select
                          onValueChange={(value) => {
                            const values = value.split(',').filter(Boolean);
                            handleCategoryChange(values);
                          }}
                          value={selectedCategories.join(',')}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Seleccionar categorías" />
                          </SelectTrigger>
                          <SelectContent>
                            {areCategoriesLoading ? (
                              <div className="p-2 text-center text-gray-500">Cargando...</div>
                            ) : categories?.length > 0 ? (
                              categories.map((category: any) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-center text-gray-500">No hay categorías</div>
                            )}
                          </SelectContent>
                        </Select>
                        
                        {selectedCategoryItems.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {selectedCategoryItems.map((category: any) => (
                              <Badge key={category.id} variant="outline">
                                {category.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    {/* Tags */}
                    <Card>
                      <CardContent className="pt-6">
                        <Label htmlFor="tags">Etiquetas</Label>
                        <div className="mt-2">
                          <Input
                            id="tags"
                            placeholder="Añadir etiqueta (Enter para agregar)"
                            onKeyDown={handleTagInput}
                          />
                          
                          {formData.tags && formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {formData.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                  {tag}
                                  <XCircle 
                                    className="h-3 w-3 cursor-pointer" 
                                    onClick={() => removeTag(tag)}
                                  />
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Publishing Options */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="flex items-center gap-2">
                              <input 
                                type="checkbox" 
                                checked={isScheduled} 
                                onChange={(e) => handleScheduleToggle(e.target.checked)}
                                className="rounded text-primary"
                              />
                              Programar publicación
                            </Label>
                          </div>
                          
                          {isScheduled && (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <Label>Fecha</Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal mt-1"
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {selectedDate ? (
                                          format(selectedDate, 'PPP', { locale: es })
                                        ) : (
                                          <span>Seleccionar fecha</span>
                                        )}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        initialFocus
                                        locale={es}
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                
                                <div>
                                  <Label>Hora</Label>
                                  <div className="flex items-center mt-1">
                                    <Clock className="mr-2 h-4 w-4 text-gray-500" />
                                    <Input 
                                      type="time" 
                                      value={selectedTime}
                                      onChange={(e) => setSelectedTime(e.target.value)}
                                      className="w-28"
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              <Button 
                                onClick={handleSchedule} 
                                disabled={!selectedDate || saveMutation.isPending}
                                className="w-full mt-2"
                              >
                                Programar
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
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

export default BlogEditor;
