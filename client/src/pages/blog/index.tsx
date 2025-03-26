import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopNavbar from '@/components/layout/TopNavbar';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Plus, MoreVertical, ExternalLink, Edit, Copy, Trash, Search, Filter, Tag } from 'lucide-react';

const BlogIndex: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // Fetch blog posts
  const { data, isLoading } = useQuery({
    queryKey: ['/api/blog', currentPage, searchTerm, statusFilter, categoryFilter],
    queryFn: async () => {
      const response = await fetch(
        `/api/blog?page=${currentPage}&pageSize=${pageSize}&search=${searchTerm}&status=${statusFilter}&category=${categoryFilter}`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to fetch blog posts');
      return response.json();
    }
  });
  
  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ['/api/blog/categories'],
    queryFn: async () => {
      const response = await fetch('/api/blog/categories', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });
  
  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest('DELETE', `/api/blog/${postId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      toast({
        title: "Publicación eliminada",
        description: "El artículo ha sido eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar el artículo: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  // Duplicate post mutation
  const duplicateMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest('POST', `/api/blog/${postId}/duplicate`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      toast({
        title: "Publicación duplicada",
        description: "El artículo ha sido duplicado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo duplicar el artículo: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  const handleDelete = (postId: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este artículo? Esta acción no se puede deshacer.')) {
      deleteMutation.mutate(postId);
    }
  };
  
  const handleDuplicate = (postId: number) => {
    duplicateMutation.mutate(postId);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Publicado</Badge>;
      case 'draft':
        return <Badge variant="outline">Borrador</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archivado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Format date in a user-friendly way
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar 
          pageTitle="Blog" 
          actions={
            <Link href="/blog/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Nuevo artículo
              </Button>
            </Link>
          }
        />
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Card>
            <CardContent className="p-6">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Buscar por título o contenido..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </form>
                
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="archived">Archivado</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Tag className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrar por categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {categories?.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Blog Posts Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Título</TableHead>
                      <TableHead>Autor</TableHead>
                      <TableHead>Categorías</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha publicación</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array(5).fill(0).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="h-5 bg-gray-200 rounded animate-pulse w-2/3"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-5 bg-gray-200 rounded animate-pulse w-20"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-5 bg-gray-200 rounded animate-pulse w-20"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-5 bg-gray-200 rounded animate-pulse w-24"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-5 bg-gray-200 rounded animate-pulse w-10 ml-auto"></div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : data?.items?.length > 0 ? (
                      data.items.map((post: any) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium">{post.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src={post.author?.avatar} />
                                <AvatarFallback>
                                  {post.author?.name.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{post.author?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {post.categories?.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {post.categories.slice(0, 2).map((category: any) => (
                                  <Badge key={category.id} variant="outline" className="text-xs">
                                    {category.name}
                                  </Badge>
                                ))}
                                {post.categories.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{post.categories.length - 2}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">Sin categoría</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(post.status)}</TableCell>
                          <TableCell>
                            {post.publishedAt ? formatDate(post.publishedAt) : 'No publicado'}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/blog/edit/${post.id}`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a 
                                    href={`/blog/${post.slug}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Ver
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicate(post.id)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-800 focus:text-red-800">
                                  <Trash className="h-4 w-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No se encontraron artículos.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {data?.totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: data.totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show pages near current page and first/last page
                          return (
                            page === 1 ||
                            page === data.totalPages ||
                            Math.abs(page - currentPage) <= 2
                          );
                        })
                        .map((page, i, array) => {
                          // Add ellipsis
                          const prevPage = array[i - 1];
                          const showEllipsisBefore = prevPage && page - prevPage > 1;
                          
                          return (
                            <React.Fragment key={page}>
                              {showEllipsisBefore && (
                                <PaginationItem>
                                  <span className="px-4 py-2">...</span>
                                </PaginationItem>
                              )}
                              <PaginationItem>
                                <PaginationLink
                                  onClick={() => setCurrentPage(page)}
                                  isActive={page === currentPage}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            </React.Fragment>
                          );
                        })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(prev => prev < data.totalPages ? prev + 1 : prev)}
                          className={currentPage === data.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default BlogIndex;
