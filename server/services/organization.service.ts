import { Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

// Get organizations for the current user
export async function getOrganizations(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    const organizations = await storage.getUserOrganizations(userId);
    
    res.json(organizations);
  } catch (error) {
    console.error('Error getting organizations:', error);
    res.status(500).json({ message: 'Error al obtener organizaciones' });
  }
}

// Switch to a different organization
export async function switchOrganization(req: Request, res: Response) {
  try {
    const organizationId = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    // Check if the organization exists
    const organization = await storage.getOrganization(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    
    // Check if the user belongs to this organization
    const userOrganizations = await storage.getUserOrganizations(userId);
    const hasAccess = userOrganizations.some(org => org.id === organizationId);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'No tienes acceso a esta organización' });
    }
    
    // Update the user's session with the new organization ID
    (req.user as any).organizationId = organizationId;
    
    // In a real application, you would update the session or user record
    // For this implementation, we'll just return success
    
    res.json({ 
      message: 'Organización cambiada correctamente',
      organization
    });
  } catch (error) {
    console.error('Error switching organization:', error);
    res.status(500).json({ message: 'Error al cambiar de organización' });
  }
}

// Get organization branding
export async function getBranding(req: Request, res: Response) {
  try {
    const organizationId = (req.user as any).organizationId;
    
    // Check if the organization exists
    const organization = await storage.getOrganization(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    
    // Extract branding information
    const branding = {
      name: organization.name,
      domain: organization.domain || '',
      subdomain: organization.subdomain || '',
      logo: organization.logo || '',
      favicon: organization.favicon || '',
      colors: organization.colors || {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#8B5CF6',
      },
      typography: organization.typography || {
        fontFamily: 'Inter',
        headings: 'Inter',
      },
    };
    
    res.json(branding);
  } catch (error) {
    console.error('Error getting branding:', error);
    res.status(500).json({ message: 'Error al obtener la configuración de marca' });
  }
}

// Update organization branding
export async function updateBranding(req: Request, res: Response) {
  try {
    const organizationId = (req.user as any).organizationId;
    
    // Check if the organization exists
    const organization = await storage.getOrganization(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    
    // Validate branding data
    const brandingSchema = z.object({
      name: z.string().min(1).optional(),
      domain: z.string().optional(),
      subdomain: z.string().optional(),
      logo: z.string().optional(),
      favicon: z.string().optional(),
      colors: z.object({
        primary: z.string(),
        secondary: z.string(),
        accent: z.string(),
      }).optional(),
      typography: z.object({
        fontFamily: z.string(),
        headings: z.string(),
      }).optional(),
    });
    
    const validationResult = brandingSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Datos de marca inválidos',
        errors: validationResult.error.errors
      });
    }
    
    // Update organization
    const updatedOrganization = await storage.updateOrganizationBranding(
      organizationId,
      validationResult.data
    );
    
    // Extract updated branding information
    const branding = {
      name: updatedOrganization?.name,
      domain: updatedOrganization?.domain || '',
      subdomain: updatedOrganization?.subdomain || '',
      logo: updatedOrganization?.logo || '',
      favicon: updatedOrganization?.favicon || '',
      colors: updatedOrganization?.colors || {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#8B5CF6',
      },
      typography: updatedOrganization?.typography || {
        fontFamily: 'Inter',
        headings: 'Inter',
      },
    };
    
    res.json(branding);
  } catch (error) {
    console.error('Error updating branding:', error);
    res.status(500).json({ message: 'Error al actualizar la configuración de marca' });
  }
}

// Check domain availability
export async function checkDomain(req: Request, res: Response) {
  try {
    const domainSchema = z.object({
      domain: z.string().min(1),
    });
    
    const validationResult = domainSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Dominio inválido',
        errors: validationResult.error.errors
      });
    }
    
    const { domain } = validationResult.data;
    
    // Check if domain is already in use
    const existingOrg = await storage.getOrganizationBySlug(domain);
    
    res.json({
      domain,
      available: !existingOrg,
    });
  } catch (error) {
    console.error('Error checking domain:', error);
    res.status(500).json({ message: 'Error al verificar disponibilidad del dominio' });
  }
}

// Create a new organization
export async function createOrganization(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    
    // Validate organization data
    const organizationSchema = z.object({
      name: z.string().min(1, 'El nombre es obligatorio'),
      slug: z.string().min(1, 'El slug es obligatorio').regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
      domain: z.string().optional(),
      subdomain: z.string().optional(),
      plan: z.string().optional(),
      logo: z.string().optional(),
      favicon: z.string().optional(),
      colors: z.object({
        primary: z.string(),
        secondary: z.string(),
        accent: z.string(),
      }).optional(),
      typography: z.object({
        fontFamily: z.string(),
        headings: z.string(),
      }).optional(),
    });
    
    const validationResult = organizationSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Datos de organización inválidos',
        errors: validationResult.error.errors
      });
    }
    
    // Check if slug is already taken
    const existingOrg = await storage.getOrganizationBySlug(validationResult.data.slug);
    if (existingOrg) {
      return res.status(400).json({
        message: 'El identificador (slug) ya está en uso',
        field: 'slug'
      });
    }
    
    // Create organization
    const organization = await storage.createOrganization(validationResult.data, userId);
    
    // Set the new organization as the current one for the user
    (req.user as any).organizationId = organization.id;
    
    res.status(201).json({
      message: 'Organización creada correctamente',
      organization
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ message: 'Error al crear la organización' });
  }
}

// Delete an organization
export async function deleteOrganization(req: Request, res: Response) {
  try {
    const organizationId = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    // Check if the organization exists
    const organization = await storage.getOrganization(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    
    // Check if the user has admin rights in this organization
    const orgUsers = await storage.getOrganizationUsers(organizationId);
    const userInOrg = orgUsers.find(user => user.id === userId);
    
    if (!userInOrg || userInOrg.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para eliminar esta organización' });
    }
    
    // Get all organizations the user belongs to
    const userOrganizations = await storage.getUserOrganizations(userId);
    
    // Check if this is the only organization for the user
    if (userOrganizations.length <= 1) {
      return res.status(400).json({ message: 'No puedes eliminar tu única organización' });
    }
    
    // Delete the organization
    const deleted = await storage.deleteOrganization(organizationId);
    
    if (!deleted) {
      return res.status(500).json({ message: 'No se pudo eliminar la organización' });
    }
    
    // If the deleted organization was the current one for the user, switch to another organization
    if ((req.user as any).organizationId === organizationId) {
      // Find another organization to switch to
      const newOrg = userOrganizations.find(org => org.id !== organizationId);
      if (newOrg) {
        (req.user as any).organizationId = newOrg.id;
      }
    }
    
    res.json({
      message: 'Organización eliminada correctamente'
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ message: 'Error al eliminar la organización' });
  }
}

// Get organization users
export async function getOrganizationUsers(req: Request, res: Response) {
  try {
    const organizationId = (req.user as any).organizationId;
    
    // Check if the organization exists
    const organization = await storage.getOrganization(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    
    // Get users
    const users = await storage.getOrganizationUsers(organizationId);
    
    // Remove password from response
    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json(usersWithoutPassword);
  } catch (error) {
    console.error('Error getting organization users:', error);
    res.status(500).json({ message: 'Error al obtener usuarios de la organización' });
  }
}
