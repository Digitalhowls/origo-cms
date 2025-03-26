import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertPageSchema } from '@shared/schema';
import { z } from 'zod';

// Get pages list
export async function getPages(req: Request, res: Response) {
  try {
    const organizationId = (req.user as any).organizationId;
    const search = req.query.search as string || '';
    const status = req.query.status as string || 'all';
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    const result = await storage.getPages(organizationId, { search, status, page, pageSize });
    
    res.json(result);
  } catch (error) {
    console.error('Error getting pages:', error);
    res.status(500).json({ message: 'Error al obtener páginas' });
  }
}

// Get a single page
export async function getPage(req: Request, res: Response) {
  try {
    const pageId = parseInt(req.params.id);
    const page = await storage.getPage(pageId);
    
    if (!page) {
      return res.status(404).json({ message: 'Página no encontrada' });
    }
    
    // Verify organization access
    if (page.organizationId !== (req.user as any).organizationId) {
      return res.status(403).json({ message: 'No tienes acceso a esta página' });
    }
    
    res.json(page);
  } catch (error) {
    console.error('Error getting page:', error);
    res.status(500).json({ message: 'Error al obtener la página' });
  }
}

// Create a new page
export async function createPage(req: Request, res: Response) {
  try {
    const user = req.user as any;
    const validationResult = insertPageSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Datos de página inválidos',
        errors: validationResult.error.errors
      });
    }
    
    // Add organization and user info
    const pageData = {
      ...validationResult.data,
      organizationId: user.organizationId,
      createdById: user.id,
      updatedById: user.id
    };
    
    const newPage = await storage.createPage(pageData);
    
    res.status(201).json(newPage);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ message: 'Error al crear la página' });
  }
}

// Update a page
export async function updatePage(req: Request, res: Response) {
  try {
    const pageId = parseInt(req.params.id);
    const user = req.user as any;
    
    // Check if the page exists
    const page = await storage.getPage(pageId);
    if (!page) {
      return res.status(404).json({ message: 'Página no encontrada' });
    }
    
    // Verify organization access
    if (page.organizationId !== user.organizationId) {
      return res.status(403).json({ message: 'No tienes acceso a esta página' });
    }
    
    // Create a schema for update that makes all fields optional
    const updatePageSchema = insertPageSchema.partial();
    const validationResult = updatePageSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Datos de actualización inválidos',
        errors: validationResult.error.errors
      });
    }
    
    // Set updatedById to current user's ID
    const updateData = {
      ...validationResult.data,
      updatedById: user.id
    };
    
    // If the status is being changed to 'published' and publishedAt is not set,
    // set it to the current date
    if (updateData.status === 'published' && !updateData.publishedAt && page.status !== 'published') {
      updateData.publishedAt = new Date();
    }
    
    const updatedPage = await storage.updatePage(pageId, updateData);
    
    res.json(updatedPage);
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ message: 'Error al actualizar la página' });
  }
}

// Delete a page
export async function deletePage(req: Request, res: Response) {
  try {
    const pageId = parseInt(req.params.id);
    
    // Check if the page exists
    const page = await storage.getPage(pageId);
    if (!page) {
      return res.status(404).json({ message: 'Página no encontrada' });
    }
    
    // Verify organization access
    if (page.organizationId !== (req.user as any).organizationId) {
      return res.status(403).json({ message: 'No tienes acceso a esta página' });
    }
    
    await storage.deletePage(pageId);
    
    res.json({ message: 'Página eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ message: 'Error al eliminar la página' });
  }
}

// Duplicate a page
export async function duplicatePage(req: Request, res: Response) {
  try {
    const pageId = parseInt(req.params.id);
    const user = req.user as any;
    
    // Check if the page exists
    const page = await storage.getPage(pageId);
    if (!page) {
      return res.status(404).json({ message: 'Página no encontrada' });
    }
    
    // Verify organization access
    if (page.organizationId !== user.organizationId) {
      return res.status(403).json({ message: 'No tienes acceso a esta página' });
    }
    
    // Create a copy with modified title, slug, and status
    const newPage = {
      ...page,
      title: `${page.title} (Copia)`,
      slug: `${page.slug}-copia-${Date.now().toString().substr(-6)}`,
      status: 'draft',
      createdById: user.id,
      updatedById: user.id,
      publishedAt: null
    };
    
    // Remove ID to create a new record
    delete newPage.id;
    
    const duplicatedPage = await storage.createPage(newPage);
    
    res.status(201).json(duplicatedPage);
  } catch (error) {
    console.error('Error duplicating page:', error);
    res.status(500).json({ message: 'Error al duplicar la página' });
  }
}

// Preview a page
export async function previewPage(req: Request, res: Response) {
  try {
    const slug = req.params.slug;
    const organizationId = (req.user as any).organizationId;
    
    const page = await storage.getPageBySlug(organizationId, slug);
    
    if (!page) {
      return res.status(404).json({ message: 'Página no encontrada' });
    }
    
    // In a real application, this would render the page with a template
    // For this implementation, we'll just return the page data
    res.json(page);
  } catch (error) {
    console.error('Error previewing page:', error);
    res.status(500).json({ message: 'Error al previsualizar la página' });
  }
}

// Get recent pages for the dashboard
export async function getRecentPages(req: Request) {
  try {
    const organizationId = (req.user as any).organizationId;
    const result = await storage.getPages(organizationId, { page: 1, pageSize: 5 });
    return result.items;
  } catch (error) {
    console.error('Error getting recent pages:', error);
    return [];
  }
}
