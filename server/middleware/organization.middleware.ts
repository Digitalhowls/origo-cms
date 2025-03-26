import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

/**
 * Middleware para establecer el contexto de la organización actual.
 * Usa la organización del usuario si está disponible, o la almacenada en la sesión.
 */
export const organizationContextMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Si no hay usuario autenticado, continuar sin contexto de organización
  if (!req.user) {
    console.log('No hay usuario autenticado en la solicitud, continuando sin contexto de organización');
    return next();
  }

  try {
    const userId = (req.user as any).id;
    console.log(`Estableciendo contexto de organización para usuario ${userId}`);
    
    // Prioridad 1: Verificar si hay un organizationId en el JWT payload
    let jwtOrgId = null;
    if (req.jwtPayload && req.jwtPayload.organizationId) {
      jwtOrgId = req.jwtPayload.organizationId;
      console.log(`ID de organización en JWT: ${jwtOrgId}`);
    }
    
    // Prioridad 2: Intentar obtener el ID de organización de la sesión
    const sessionOrgId = (req.session as any).organizationId;
    console.log(`ID de organización en sesión: ${sessionOrgId || 'ninguno'}`);
    
    // Prioridad 3: Usar el ID de organización del usuario si está disponible
    const userOrgId = (req.user as any).organizationId;
    console.log(`ID de organización en usuario: ${userOrgId || 'ninguno'}`);
    
    // Usar el primer ID de organización disponible, en orden de prioridad
    const orgId = jwtOrgId || sessionOrgId || userOrgId;
    
    if (orgId) {
      // Verificar que el usuario tenga acceso a esta organización
      const userOrgs = await storage.getUserOrganizations(userId);
      console.log(`Organizaciones del usuario: ${JSON.stringify(userOrgs.map(org => org.id))}`);
      
      const hasAccess = userOrgs.some(org => org.id === orgId);
      
      if (hasAccess) {
        const organization = await storage.getOrganization(orgId);
        if (organization) {
          console.log(`Usando organización: ${organization.name} (ID: ${organization.id})`);
          (req as any).currentOrganization = organization;
          
          // Actualizar la sesión si el organizationId no está o es diferente
          if ((req.session as any).organizationId !== organization.id) {
            (req.session as any).organizationId = organization.id;
            
            // Guardar cambios en la sesión
            req.session.save(err => {
              if (err) {
                console.error('Error al guardar organizationId en sesión:', err);
              } else {
                console.log(`Organización ${organization.id} guardada en sesión`);
              }
            });
          }
          
          return next();
        }
      }
      
      // Si la organización no existe o el usuario ya no tiene acceso, eliminar de la sesión
      console.log(`Eliminando ID de organización inválido (${orgId}) de la sesión`);
      delete (req.session as any).organizationId;
    }
    
    // Si no hay organización válida en el token o la sesión, cargar las del usuario
    const userOrganizations = await storage.getUserOrganizations(userId);
    
    // Si el usuario pertenece a al menos una organización, usar la primera como predeterminada
    if (userOrganizations.length > 0) {
      console.log(`Usando primera organización del usuario por defecto: ${userOrganizations[0].name} (ID: ${userOrganizations[0].id})`);
      (req as any).currentOrganization = userOrganizations[0];
      (req.session as any).organizationId = userOrganizations[0].id;
      
      // Guardar cambios en la sesión
      req.session.save(err => {
        if (err) {
          console.error('Error al guardar la sesión:', err);
        } else {
          console.log('Primera organización del usuario guardada en sesión');
        }
      });
    } else {
      console.log(`El usuario ${userId} no pertenece a ninguna organización`);
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