import { Request, Response } from 'express';
import { storage } from '../storage';
import { 
  PlanType, 
  isWithinPlanLimits, 
  getPlanLimits, 
  getAvailablePlans,
  OrganizationUsageStats,
  ResourceValidation
} from '@shared/tenant';

/**
 * Obtiene los planes disponibles en el sistema
 */
export async function getPlans(req: Request, res: Response) {
  try {
    const plans = getAvailablePlans();
    res.json(plans);
  } catch (error) {
    console.error('Error getting plans:', error);
    res.status(500).json({ message: 'Error al obtener los planes disponibles' });
  }
}

/**
 * Obtiene las estadísticas de uso de una organización
 */
export async function getOrganizationUsage(req: Request, res: Response) {
  try {
    // Obtener la organización del contexto
    const currentOrg = (req as any).currentOrganization;
    
    if (!currentOrg) {
      return res.status(400).json({ message: 'No hay una organización en el contexto' });
    }
    
    const organizationId = currentOrg.id;
    
    // Obtener las estadísticas de uso
    const organization = await storage.getOrganization(organizationId);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    
    // Contar usuarios
    const users = await storage.getOrganizationUsers(organizationId);
    
    // Contar páginas
    const pages = await storage.getPages(organizationId);
    
    // Contar publicaciones
    const posts = await storage.getBlogPosts(organizationId);
    
    // Contar cursos
    const courses = await storage.getCourses(organizationId);
    
    // Calcular almacenamiento usado
    const media = await storage.getMediaFiles(organizationId);
    const storage_usage = media.items.reduce((total, file) => total + (file.size || 0), 0) / (1024 * 1024); // Convertir a MB
    
    // Preparar estadísticas
    const usage: OrganizationUsageStats = {
      users: users.length,
      pages: pages.totalItems,
      posts: posts.totalItems,
      courses: courses.totalItems,
      storage: storage_usage
    };
    
    // Obtener límites del plan
    const planLimits = getPlanLimits(organization.plan as PlanType || PlanType.FREE);
    
    res.json({
      organization: {
        id: organization.id,
        name: organization.name,
        plan: organization.plan || PlanType.FREE
      },
      usage,
      limits: planLimits
    });
  } catch (error) {
    console.error('Error getting organization usage:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas de uso' });
  }
}

/**
 * Cambia el plan de una organización
 */
export async function changePlan(req: Request, res: Response) {
  try {
    // Obtener la organización del contexto
    const currentOrg = (req as any).currentOrganization;
    
    if (!currentOrg) {
      return res.status(400).json({ message: 'No hay una organización en el contexto' });
    }
    
    const organizationId = currentOrg.id;
    const { plan } = req.body;
    
    // Validar el plan
    if (!Object.values(PlanType).includes(plan)) {
      return res.status(400).json({ message: 'Plan no válido' });
    }
    
    // Verificar acceso a la organización (solo admin puede cambiar el plan)
    const userId = (req.user as any).id;
    const userRole = await storage.getUserRoleInOrganization(userId, organizationId);
    
    if (!userRole || !['admin', 'superadmin'].includes(userRole)) {
      return res.status(403).json({ message: 'No tienes permisos para cambiar el plan' });
    }
    
    // Cambiar el plan
    const organization = await storage.updateOrganization(organizationId, { plan });
    
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    
    res.json(organization);
  } catch (error) {
    console.error('Error changing plan:', error);
    res.status(500).json({ message: 'Error al cambiar el plan' });
  }
}

/**
 * Valida si una organización puede crear un nuevo recurso según su plan
 * @param organizationId ID de la organización
 * @param resourceType Tipo de recurso a validar
 * @returns Resultado de la validación
 */
export async function validateResourceCreation(
  organizationId: number, 
  resourceType: 'users' | 'pages' | 'posts' | 'courses' | 'storage'
): Promise<ResourceValidation> {
  try {
    // Obtener la organización
    const organization = await storage.getOrganization(organizationId);
    if (!organization) {
      throw new Error('Organización no encontrada');
    }
    
    // Obtener plan y sus límites
    const plan = organization.plan as PlanType || PlanType.FREE;
    const limits = getPlanLimits(plan);
    
    // Obtener uso actual según el tipo de recurso
    let currentUsage = 0;
    let limit = 0;
    
    switch (resourceType) {
      case 'users':
        const users = await storage.getOrganizationUsers(organizationId);
        currentUsage = users.length;
        limit = limits.maxUsers;
        break;
        
      case 'pages':
        const pages = await storage.getPages(organizationId);
        currentUsage = pages.totalItems;
        limit = limits.maxPages;
        break;
        
      case 'posts':
        const posts = await storage.getBlogPosts(organizationId);
        currentUsage = posts.totalItems;
        limit = limits.maxPosts;
        break;
        
      case 'courses':
        const courses = await storage.getCourses(organizationId);
        currentUsage = courses.totalItems;
        limit = limits.maxCourses;
        break;
        
      case 'storage':
        const media = await storage.getMediaFiles(organizationId);
        const storage_usage = media.items.reduce((total, file) => total + (file.size || 0), 0) / (1024 * 1024); // Convertir a MB
        currentUsage = storage_usage;
        limit = limits.maxStorage;
        break;
    }
    
    // Verificar si está dentro de los límites
    const isValid = currentUsage < limit;
    
    return {
      isValid,
      currentUsage,
      limit,
      resourceType
    };
  } catch (error) {
    console.error(`Error validating resource creation (${resourceType}):`, error);
    // En caso de error, asumimos que no es válido para evitar problemas
    return {
      isValid: false,
      currentUsage: 0,
      limit: 0,
      resourceType
    };
  }
}

/**
 * Middleware para validar si una organización puede crear un nuevo recurso
 * @param resourceType Tipo de recurso a validar
 */
export function validateResourceMiddleware(resourceType: 'users' | 'pages' | 'posts' | 'courses' | 'storage') {
  return async (req: Request, res: Response, next: Function) => {
    try {
      // Obtener ID de organización del contexto o parámetros
      const organizationId = (req as any).currentOrganization?.id || parseInt(req.body.organizationId);
      
      if (!organizationId) {
        return res.status(400).json({ 
          message: 'Se requiere ID de organización',
          code: 'ORGANIZATION_REQUIRED'
        });
      }
      
      // Validar recurso
      const validation = await validateResourceCreation(organizationId, resourceType);
      
      if (!validation.isValid) {
        return res.status(403).json({
          message: `Límite de ${resourceType} alcanzado para el plan actual`,
          code: 'PLAN_LIMIT_REACHED',
          details: validation
        });
      }
      
      next();
    } catch (error) {
      console.error('Error en middleware de validación de recursos:', error);
      next(error);
    }
  };
}

/**
 * Obtiene las cuotas de uso para cada tipo de recurso
 */
export async function getResourceQuotas(req: Request, res: Response) {
  try {
    // Obtener la organización del contexto
    const currentOrg = (req as any).currentOrganization;
    
    if (!currentOrg) {
      return res.status(400).json({ message: 'No hay una organización en el contexto' });
    }
    
    const organizationId = currentOrg.id;
    
    // Validar cada tipo de recurso
    const resourceTypes = ['users', 'pages', 'posts', 'courses', 'storage'] as const;
    const quotas = await Promise.all(
      resourceTypes.map(async type => {
        const validation = await validateResourceCreation(organizationId, type);
        return {
          resourceType: type,
          usage: validation.currentUsage,
          limit: validation.limit,
          percentage: validation.limit > 0 ? Math.round((validation.currentUsage / validation.limit) * 100) : 0
        };
      })
    );
    
    res.json(quotas);
  } catch (error) {
    console.error('Error getting resource quotas:', error);
    res.status(500).json({ message: 'Error al obtener cuotas de recursos' });
  }
}