import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

/**
 * Middleware para establecer el contexto de la organización actual.
 * Usa la organización del usuario si está disponible, o la almacenada en la sesión.
 */
export const organizationContextMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Si no hay usuario autenticado, continuar sin contexto de organización
  if (!req.user) {
    return next();
  }

  try {
    // Intentar obtener el ID de organización de la sesión
    const sessionOrgId = (req.session as any).organizationId;
    
    // Si existe un ID de organización en la sesión, intentar cargar esa organización
    if (sessionOrgId) {
      // Verificar que el usuario tenga acceso a esta organización
      const userOrgs = await storage.getUserOrganizations((req.user as any).id);
      const hasAccess = userOrgs.some(org => org.id === sessionOrgId);
      
      if (hasAccess) {
        const organization = await storage.getOrganization(sessionOrgId);
        if (organization) {
          (req as any).currentOrganization = organization;
          return next();
        }
      }
      
      // Si la organización no existe o el usuario ya no tiene acceso, eliminar de la sesión
      delete (req.session as any).organizationId;
    }
    
    // Cargar las organizaciones del usuario
    const userOrganizations = await storage.getUserOrganizations((req.user as any).id);
    
    // Si el usuario pertenece a al menos una organización, usar la primera como predeterminada
    if (userOrganizations.length > 0) {
      (req as any).currentOrganization = userOrganizations[0];
      (req.session as any).organizationId = userOrganizations[0].id;
    }
    
    next();
  } catch (error) {
    console.error('Error en middleware de contexto de organización:', error);
    next();
  }
};

/**
 * Middleware para requerir que haya una organización en el contexto
 */
export const requireOrganizationContext = (req: Request, res: Response, next: NextFunction) => {
  if (!(req as any).currentOrganization) {
    return res.status(403).json({ 
      message: 'Se requiere contexto de organización para acceder a este recurso',
      code: 'ORGANIZATION_REQUIRED' 
    });
  }
  
  next();
};

// Agregar TypeScript interface para extender Request
declare global {
  namespace Express {
    interface Request {
      currentOrganization?: any;
    }
  }
}