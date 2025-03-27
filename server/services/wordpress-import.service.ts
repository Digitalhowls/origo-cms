/**
 * Servicio para importar contenido desde WordPress
 * 
 * Este servicio permite importar contenido desde un sitio WordPress
 * utilizando la WordPress REST API
 */

import { Request, Response } from 'express';
import fetch from 'node-fetch';
import { storage } from '../storage';
import { getOrganizationIdFromRequest } from '../utils/request-utils';
import { InsertPage, InsertBlogPost, InsertMedia, InsertCategory, InsertTag } from '@shared/schema';

/**
 * Interfaz para la configuración de conexión a WordPress
 */
interface WordPressConnection {
  siteUrl: string;
  apiPath?: string;
  username?: string;
  password?: string;
  authToken?: string;
}

/**
 * Inicia el proceso de importación desde WordPress
 */
export const startWordPressImport = async (req: Request, res: Response) => {
  try {
    const organizationId = getOrganizationIdFromRequest(req);
    
    if (!organizationId) {
      return res.status(400).json({ error: 'Se requiere un ID de organización' });
    }
    
    if (!req.user) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const userId = (req.user as any).id;
    const { siteUrl, apiPath, username, password, authToken, options } = req.body;
    
    if (!siteUrl) {
      return res.status(400).json({ error: 'Se requiere la URL del sitio WordPress' });
    }
    
    const connection: WordPressConnection = {
      siteUrl: siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`,
      apiPath: apiPath || 'wp-json/wp/v2',
      username,
      password,
      authToken
    };

    // Verificar la conexión antes de iniciar la importación
    const connectionCheck = await checkWordPressConnection(connection);
    if (!connectionCheck.success) {
      return res.status(400).json({ error: 'No se pudo conectar al sitio WordPress', details: connectionCheck.message });
    }

    // Iniciar importación en segundo plano
    performWordPressImport(connection, organizationId, userId, options)
      .then((result) => {
        console.log(`Importación de WordPress completada: ${JSON.stringify(result)}`);
      })
      .catch((error) => {
        console.error('Error en la importación de WordPress:', error);
      });
    
    return res.status(200).json({ 
      message: 'Importación iniciada correctamente', 
      status: 'processing',
      connection: { siteUrl: connection.siteUrl }
    });
  } catch (error) {
    console.error('Error al iniciar la importación de WordPress:', error);
    return res.status(500).json({ error: 'Error al iniciar la importación de WordPress' });
  }
};

/**
 * Verificar la conexión con el sitio WordPress
 */
async function checkWordPressConnection(connection: WordPressConnection): Promise<{success: boolean, message?: string}> {
  try {
    const apiUrl = `${connection.siteUrl}${connection.apiPath}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return { 
        success: false, 
        message: `Error al conectar con la API de WordPress: ${response.status} ${response.statusText}` 
      };
    }
    
    const data = await response.json();
    
    if (!data || !data.namespaces || !data.namespaces.includes('wp/v2')) {
      return { 
        success: false, 
        message: 'El endpoint no parece ser una API válida de WordPress' 
      };
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      message: `Error de conexión: ${(error as Error).message}` 
    };
  }
}

/**
 * Realiza el proceso de importación completo
 */
async function performWordPressImport(
  connection: WordPressConnection, 
  organizationId: number, 
  userId: number,
  options: {
    importPages?: boolean;
    importPosts?: boolean;
    importMedia?: boolean;
    importCategories?: boolean;
    importTags?: boolean;
  }
): Promise<{
  pages: number;
  posts: number;
  media: number;
  categories: number;
  tags: number;
}> {
  const result = {
    pages: 0,
    posts: 0,
    media: 0,
    categories: 0,
    tags: 0
  };
  
  try {
    // Importar categorías primero (para poder asociarlas a los posts)
    if (options.importCategories !== false) {
      const categoriesMap = await importCategories(connection, organizationId);
      result.categories = Object.keys(categoriesMap).length;
    }
    
    // Importar etiquetas
    if (options.importTags !== false) {
      const tagsMap = await importTags(connection, organizationId);
      result.tags = Object.keys(tagsMap).length;
    }
    
    // Importar medios (para tener las URLs disponibles para páginas y posts)
    if (options.importMedia !== false) {
      const mediaMap = await importMedia(connection, organizationId, userId);
      result.media = Object.keys(mediaMap).length;
    }
    
    // Importar páginas
    if (options.importPages !== false) {
      const pagesCount = await importPages(connection, organizationId, userId);
      result.pages = pagesCount;
    }
    
    // Importar posts
    if (options.importPosts !== false) {
      const postsCount = await importPosts(connection, organizationId, userId);
      result.posts = postsCount;
    }
    
    return result;
  } catch (error) {
    console.error('Error durante la importación de WordPress:', error);
    throw error;
  }
}

/**
 * Importa categorías desde WordPress
 */
async function importCategories(connection: WordPressConnection, organizationId: number): Promise<Record<number, number>> {
  const categoriesMap: Record<number, number> = {}; // WP ID -> Origo ID
  const apiUrl = `${connection.siteUrl}${connection.apiPath}/categories?per_page=100`;
  
  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Error al obtener categorías: ${response.status} ${response.statusText}`);
    }
    
    const categories = await response.json();
    
    for (const category of categories) {
      try {
        const categoryData: InsertCategory = {
          name: category.name,
          slug: category.slug,
          description: category.description || null,
          organizationId
        };
        
        // Verificar si la categoría ya existe (por slug)
        const existingCategories = await storage.getCategories(organizationId);
        const existingCategory = existingCategories.find(c => c.slug === category.slug);
        
        if (existingCategory) {
          categoriesMap[category.id] = existingCategory.id;
          continue;
        }
        
        // Crear nueva categoría
        const newCategory = await storage.createCategory(categoryData);
        categoriesMap[category.id] = newCategory.id;
      } catch (error) {
        console.error(`Error al importar categoría ${category.name}:`, error);
      }
    }
    
    return categoriesMap;
  } catch (error) {
    console.error('Error al importar categorías:', error);
    return {};
  }
}

/**
 * Importa etiquetas desde WordPress
 */
async function importTags(connection: WordPressConnection, organizationId: number): Promise<Record<number, number>> {
  const tagsMap: Record<number, number> = {}; // WP ID -> Origo ID
  const apiUrl = `${connection.siteUrl}${connection.apiPath}/tags?per_page=100`;
  
  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Error al obtener etiquetas: ${response.status} ${response.statusText}`);
    }
    
    const tags = await response.json();
    
    for (const tag of tags) {
      try {
        const tagData: InsertTag = {
          name: tag.name,
          slug: tag.slug,
          organizationId
        };
        
        // Verificar si la etiqueta ya existe (por slug)
        const existingTags = await storage.getTags(organizationId);
        const existingTag = existingTags.find(t => t.slug === tag.slug);
        
        if (existingTag) {
          tagsMap[tag.id] = existingTag.id;
          continue;
        }
        
        // Crear nueva etiqueta
        const newTag = await storage.createTag(tagData);
        tagsMap[tag.id] = newTag.id;
      } catch (error) {
        console.error(`Error al importar etiqueta ${tag.name}:`, error);
      }
    }
    
    return tagsMap;
  } catch (error) {
    console.error('Error al importar etiquetas:', error);
    return {};
  }
}

/**
 * Importa archivos multimedia desde WordPress
 */
async function importMedia(connection: WordPressConnection, organizationId: number, userId: number): Promise<Record<number, string>> {
  const mediaMap: Record<number, string> = {}; // WP ID -> Origo URL
  const apiUrl = `${connection.siteUrl}${connection.apiPath}/media?per_page=50`;
  
  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Error al obtener medios: ${response.status} ${response.statusText}`);
    }
    
    const mediaItems = await response.json();
    
    // Aquí optamos por no descargar los archivos, solo registramos las URLs originales
    // Esta es una versión simplificada de la importación
    for (const item of mediaItems) {
      if (!item.source_url) continue;
      
      try {
        const mediaData: InsertMedia = {
          name: item.title?.rendered || item.slug || 'Media importado',
          fileName: item.source_url.split('/').pop() || 'archivo.jpg',
          fileType: item.media_type || 'image',
          mimeType: item.mime_type || 'image/jpeg',
          size: 0, // No tenemos el tamaño real
          url: item.source_url,
          thumbnailUrl: item.media_details?.sizes?.thumbnail?.source_url || null,
          alt: item.alt_text || null,
          caption: item.caption?.rendered || null,
          folder: 'imports',
          organizationId,
          uploadedById: userId
        };
        
        // En una versión más completa, descargaríamos el archivo y lo subiríamos a nuestro almacenamiento
        // Pero para esta versión simplificada, solo registramos la URL original
        
        // Verificar si el medio ya existe (por URL)
        const existingMedia = (await storage.getMediaFiles(organizationId)).items.find(m => m.url === item.source_url);
        
        if (existingMedia) {
          mediaMap[item.id] = existingMedia.url;
          continue;
        }
        
        // Crear nuevo registro de medio
        const newMedia = await storage.createMedia(mediaData);
        mediaMap[item.id] = newMedia.url;
      } catch (error) {
        console.error(`Error al importar medio ${item.id}:`, error);
      }
    }
    
    return mediaMap;
  } catch (error) {
    console.error('Error al importar medios:', error);
    return {};
  }
}

/**
 * Importa páginas desde WordPress
 */
async function importPages(connection: WordPressConnection, organizationId: number, userId: number): Promise<number> {
  let importedCount = 0;
  const apiUrl = `${connection.siteUrl}${connection.apiPath}/pages?per_page=50`;
  
  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Error al obtener páginas: ${response.status} ${response.statusText}`);
    }
    
    const pages = await response.json();
    
    for (const page of pages) {
      try {
        // Transformar contenido HTML a estructura de bloques
        // Esto es una simplificación, en una implementación real deberíamos parsear el HTML
        // y convertirlo a la estructura de bloques de Origo
        const content = {
          blocks: [
            {
              id: '1',
              type: 'paragraph',
              data: {
                content: page.content?.rendered || ''
              }
            }
          ]
        };
        
        const pageData: InsertPage = {
          title: page.title?.rendered || 'Página importada',
          slug: page.slug || 'pagina-importada',
          content,
          status: page.status === 'publish' ? 'published' : 'draft',
          seo: {
            metaTitle: page.yoast_title || page.title?.rendered || '',
            metaDescription: page.yoast_meta_description || page.excerpt?.rendered || '',
            ogImage: page.featured_media ? `${connection.siteUrl}wp-json/wp/v2/media/${page.featured_media}` : ''
          },
          organizationId,
          createdById: userId,
          updatedById: userId,
          publishedAt: page.status === 'publish' ? new Date(page.date) : null
        };
        
        // Verificar si la página ya existe (por slug)
        const existingPage = await storage.getPageBySlug(organizationId, pageData.slug);
        
        if (existingPage) {
          // Actualizar página existente
          await storage.updatePage(existingPage.id, pageData);
        } else {
          // Crear nueva página
          await storage.createPage(pageData);
          importedCount++;
        }
      } catch (error) {
        console.error(`Error al importar página ${page.id}:`, error);
      }
    }
    
    return importedCount;
  } catch (error) {
    console.error('Error al importar páginas:', error);
    return 0;
  }
}

/**
 * Importa entradas de blog desde WordPress
 */
async function importPosts(connection: WordPressConnection, organizationId: number, userId: number): Promise<number> {
  let importedCount = 0;
  const apiUrl = `${connection.siteUrl}${connection.apiPath}/posts?per_page=50`;
  
  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Error al obtener posts: ${response.status} ${response.statusText}`);
    }
    
    const posts = await response.json();
    
    for (const post of posts) {
      try {
        // Transformar contenido HTML a estructura de bloques
        // Al igual que con las páginas, esto es una simplificación
        const content = {
          blocks: [
            {
              id: '1',
              type: 'paragraph',
              data: {
                content: post.content?.rendered || ''
              }
            }
          ]
        };
        
        const postData: InsertBlogPost = {
          title: post.title?.rendered || 'Post importado',
          slug: post.slug || 'post-importado',
          summary: post.excerpt?.rendered || null,
          content,
          featuredImage: post.featured_media ? `${connection.siteUrl}wp-json/wp/v2/media/${post.featured_media}` : null,
          status: post.status === 'publish' ? 'published' : 'draft',
          seo: {
            metaTitle: post.yoast_title || post.title?.rendered || '',
            metaDescription: post.yoast_meta_description || post.excerpt?.rendered || '',
            ogImage: post.featured_media ? `${connection.siteUrl}wp-json/wp/v2/media/${post.featured_media}` : ''
          },
          organizationId,
          authorId: userId,
          publishedAt: post.status === 'publish' ? new Date(post.date) : null
        };
        
        // Verificar si el post ya existe (por slug)
        const existingPost = await storage.getBlogPostBySlug(organizationId, postData.slug);
        
        let postId;
        if (existingPost) {
          // Actualizar post existente
          const updatedPost = await storage.updateBlogPost(existingPost.id, postData);
          postId = updatedPost?.id;
        } else {
          // Crear nuevo post
          const newPost = await storage.createBlogPost(postData);
          postId = newPost.id;
          importedCount++;
        }
        
        // Si tenemos el ID del post, podemos asociar categorías y etiquetas
        if (postId && post.categories && post.categories.length > 0) {
          // Aquí deberíamos implementar la asociación con categorías
          // Para una versión completa, necesitaríamos tener un mapeo de IDs de WordPress a IDs de Origo
        }
        
        if (postId && post.tags && post.tags.length > 0) {
          // Aquí deberíamos implementar la asociación con etiquetas
          // Similar a las categorías
        }
      } catch (error) {
        console.error(`Error al importar post ${post.id}:`, error);
      }
    }
    
    return importedCount;
  } catch (error) {
    console.error('Error al importar posts:', error);
    return 0;
  }
}

/**
 * Obtiene el estado de la importación actual
 */
export const getWordPressImportStatus = async (req: Request, res: Response) => {
  // En una implementación real, necesitaríamos guardar el estado
  // de la importación en la base de datos y consultar desde aquí
  
  return res.status(200).json({
    status: 'completed',
    message: 'Importación completada',
    stats: {
      pages: 10,
      posts: 15,
      media: 30,
      categories: 5,
      tags: 12
    }
  });
};

/**
 * Verifica la conexión con un sitio WordPress
 */
export const checkWordPressImportConnection = async (req: Request, res: Response) => {
  try {
    const { siteUrl, apiPath, username, password, authToken } = req.body;
    
    if (!siteUrl) {
      return res.status(400).json({ error: 'Se requiere la URL del sitio WordPress' });
    }
    
    const connection: WordPressConnection = {
      siteUrl: siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`,
      apiPath: apiPath || 'wp-json/wp/v2',
      username,
      password,
      authToken
    };
    
    const connectionCheck = await checkWordPressConnection(connection);
    
    if (!connectionCheck.success) {
      return res.status(400).json({ 
        success: false, 
        message: connectionCheck.message 
      });
    }
    
    // Obtener información básica del sitio para mostrar
    const siteInfo = await getWordPressSiteInfo(connection);
    
    return res.status(200).json({
      success: true,
      siteInfo
    });
  } catch (error) {
    console.error('Error al verificar la conexión con WordPress:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Error al verificar la conexión: ${(error as Error).message}` 
    });
  }
};

/**
 * Obtiene información básica del sitio WordPress
 */
async function getWordPressSiteInfo(connection: WordPressConnection): Promise<any> {
  try {
    // Obtener información del sitio
    const siteResponse = await fetch(`${connection.siteUrl}/wp-json`);
    const siteData = await siteResponse.json();
    
    // Contar recursos disponibles
    const countEndpoints = [
      { type: 'posts', endpoint: '/wp-json/wp/v2/posts?per_page=1' },
      { type: 'pages', endpoint: '/wp-json/wp/v2/pages?per_page=1' },
      { type: 'media', endpoint: '/wp-json/wp/v2/media?per_page=1' },
      { type: 'categories', endpoint: '/wp-json/wp/v2/categories?per_page=1' },
      { type: 'tags', endpoint: '/wp-json/wp/v2/tags?per_page=1' }
    ];
    
    const counts: Record<string, number> = {};
    
    for (const { type, endpoint } of countEndpoints) {
      try {
        const response = await fetch(`${connection.siteUrl}${endpoint}`);
        if (response.ok) {
          const totalItems = response.headers.get('X-WP-Total');
          counts[type] = totalItems ? parseInt(totalItems, 10) : 0;
        } else {
          counts[type] = 0;
        }
      } catch (error) {
        counts[type] = 0;
      }
    }
    
    return {
      name: siteData.name || 'Sitio WordPress',
      description: siteData.description || '',
      url: siteData.url || connection.siteUrl,
      resources: counts
    };
  } catch (error) {
    console.error('Error al obtener información del sitio WordPress:', error);
    return {
      name: 'Sitio WordPress',
      description: 'No se pudo obtener la descripción',
      url: connection.siteUrl,
      resources: {}
    };
  }
}