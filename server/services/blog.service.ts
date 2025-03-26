import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertBlogPostSchema, insertCategorySchema, insertTagSchema } from '@shared/schema';
import { z } from 'zod';

// Get blog posts list
export async function getPosts(req: Request, res: Response) {
  try {
    const organizationId = (req.user as any).organizationId;
    const search = req.query.search as string || '';
    const status = req.query.status as string || 'all';
    const category = req.query.category as string || 'all';
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    const result = await storage.getBlogPosts(organizationId, { 
      search, 
      status, 
      category,
      page, 
      pageSize 
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error getting blog posts:', error);
    res.status(500).json({ message: 'Error al obtener artículos del blog' });
  }
}

// Get a single blog post
export async function getPost(req: Request, res: Response) {
  try {
    const postId = parseInt(req.params.id);
    const post = await storage.getBlogPost(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }
    
    // Verify organization access
    if (post.organizationId !== (req.user as any).organizationId) {
      return res.status(403).json({ message: 'No tienes acceso a este artículo' });
    }
    
    res.json(post);
  } catch (error) {
    console.error('Error getting blog post:', error);
    res.status(500).json({ message: 'Error al obtener el artículo' });
  }
}

// Create a new blog post
export async function createPost(req: Request, res: Response) {
  try {
    const user = req.user as any;
    const validationResult = insertBlogPostSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Datos del artículo inválidos',
        errors: validationResult.error.errors
      });
    }
    
    // Add organization and author info
    const postData = {
      ...validationResult.data,
      organizationId: user.organizationId,
      authorId: user.id
    };
    
    const newPost = await storage.createBlogPost(postData);
    
    // If categories are provided, associate them with the post
    if (req.body.categories && Array.isArray(req.body.categories)) {
      // This would typically be handled in a transaction
      // For simplicity, we're not implementing that here
    }
    
    // If tags are provided, associate them with the post
    if (req.body.tags && Array.isArray(req.body.tags)) {
      // Similar to categories, would be handled in a transaction
    }
    
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ message: 'Error al crear el artículo' });
  }
}

// Update a blog post
export async function updatePost(req: Request, res: Response) {
  try {
    const postId = parseInt(req.params.id);
    const user = req.user as any;
    
    // Check if the post exists
    const post = await storage.getBlogPost(postId);
    if (!post) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }
    
    // Verify organization access
    if (post.organizationId !== user.organizationId) {
      return res.status(403).json({ message: 'No tienes acceso a este artículo' });
    }
    
    // Create a schema for update that makes all fields optional
    const updatePostSchema = insertBlogPostSchema.partial();
    const validationResult = updatePostSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Datos de actualización inválidos',
        errors: validationResult.error.errors
      });
    }
    
    // If the status is being changed to 'published' and publishedAt is not set,
    // set it to the current date
    const updateData = { ...validationResult.data };
    if (updateData.status === 'published' && !updateData.publishedAt && post.status !== 'published') {
      updateData.publishedAt = new Date();
    }
    
    const updatedPost = await storage.updateBlogPost(postId, updateData);
    
    // Update categories and tags if provided
    // Not implemented here for simplicity
    
    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ message: 'Error al actualizar el artículo' });
  }
}

// Delete a blog post
export async function deletePost(req: Request, res: Response) {
  try {
    const postId = parseInt(req.params.id);
    
    // Check if the post exists
    const post = await storage.getBlogPost(postId);
    if (!post) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }
    
    // Verify organization access
    if (post.organizationId !== (req.user as any).organizationId) {
      return res.status(403).json({ message: 'No tienes acceso a este artículo' });
    }
    
    await storage.deleteBlogPost(postId);
    
    res.json({ message: 'Artículo eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ message: 'Error al eliminar el artículo' });
  }
}

// Duplicate a blog post
export async function duplicatePost(req: Request, res: Response) {
  try {
    const postId = parseInt(req.params.id);
    const user = req.user as any;
    
    // Check if the post exists
    const post = await storage.getBlogPost(postId);
    if (!post) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }
    
    // Verify organization access
    if (post.organizationId !== user.organizationId) {
      return res.status(403).json({ message: 'No tienes acceso a este artículo' });
    }
    
    // Create a copy with modified title, slug, and status
    const newPost = {
      ...post,
      title: `${post.title} (Copia)`,
      slug: `${post.slug}-copia-${Date.now().toString().substr(-6)}`,
      status: 'draft',
      authorId: user.id,
      publishedAt: null
    };
    
    // Remove ID to create a new record
    delete newPost.id;
    
    const duplicatedPost = await storage.createBlogPost(newPost);
    
    // Duplicate categories and tags relationships
    // Not implemented here for simplicity
    
    res.status(201).json(duplicatedPost);
  } catch (error) {
    console.error('Error duplicating blog post:', error);
    res.status(500).json({ message: 'Error al duplicar el artículo' });
  }
}

// Get categories
export async function getCategories(req: Request, res: Response) {
  try {
    const organizationId = (req.user as any).organizationId;
    const categories = await storage.getCategories(organizationId);
    
    res.json(categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
}

// Create a category
export async function createCategory(req: Request, res: Response) {
  try {
    const user = req.user as any;
    const organizationId = user.organizationId;
    
    const validationResult = insertCategorySchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Datos de categoría inválidos',
        errors: validationResult.error.errors
      });
    }
    
    const categoryData = {
      ...validationResult.data,
      organizationId
    };
    
    const newCategory = await storage.createCategory(categoryData);
    
    res.status(201).json(newCategory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Datos de categoría inválidos', errors: error.errors });
    }
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error al crear la categoría' });
  }
}

// Get tags
export async function getTags(req: Request, res: Response) {
  try {
    const organizationId = (req.user as any).organizationId;
    const tags = await storage.getTags(organizationId);
    
    res.json(tags);
  } catch (error) {
    console.error('Error getting tags:', error);
    res.status(500).json({ message: 'Error al obtener etiquetas' });
  }
}

// Create a tag
export async function createTag(req: Request, res: Response) {
  try {
    const user = req.user as any;
    const organizationId = user.organizationId;
    
    const validationResult = insertTagSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Datos de etiqueta inválidos',
        errors: validationResult.error.errors
      });
    }
    
    const tagData = {
      ...validationResult.data,
      organizationId
    };
    
    const newTag = await storage.createTag(tagData);
    
    res.status(201).json(newTag);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Datos de etiqueta inválidos', errors: error.errors });
    }
    console.error('Error creating tag:', error);
    res.status(500).json({ message: 'Error al crear la etiqueta' });
  }
}

// Preview a blog post
export async function previewPost(req: Request, res: Response) {
  try {
    const slug = req.params.slug;
    const organizationId = (req.user as any).organizationId;
    
    const post = await storage.getBlogPostBySlug(organizationId, slug);
    
    if (!post) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }
    
    // In a real application, this would render the post with a template
    // For this implementation, we'll just return the post data
    res.json(post);
  } catch (error) {
    console.error('Error previewing blog post:', error);
    res.status(500).json({ message: 'Error al previsualizar el artículo' });
  }
}

// Get recent posts for the dashboard
export async function getRecentPosts(req: Request) {
  try {
    const organizationId = (req.user as any).organizationId;
    const result = await storage.getBlogPosts(organizationId, { page: 1, pageSize: 5 });
    return result.items;
  } catch (error) {
    console.error('Error getting recent posts:', error);
    return [];
  }
}
