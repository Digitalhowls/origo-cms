/**
 * Middleware para la validación de permisos y roles de usuario
 */

import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { getOrganizationFromRequest } from "./organization";

/**
 * Verifica si el usuario tiene un permiso específico
 */
export async function validatePermission(req: Request, resource: string, action: string): Promise<boolean> {
  // Si no hay usuario autenticado, no tiene permisos
  if (!req.user || !req.user.id) {
    return false;
  }

  // Obtener la organización
  const organization = await getOrganizationFromRequest(req);
  if (!organization) {
    return false;
  }

  // Si el usuario es admin del sitio, tiene todos los permisos
  if (req.user.role === 'admin') {
    return true;
  }

  // Verificar el rol del usuario en la organización
  const userRole = await storage.getUserRoleInOrganization(req.user.id, organization.id);

  // Si es admin de la organización, tiene todos los permisos
  if (userRole === 'admin') {
    return true;
  }

  // Verificar permisos específicos
  return await storage.hasPermission(req.user.id, resource, action);
}

/**
 * Middleware para requerir un permiso específico
 */
export function requirePermission(resource: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hasPermission = await validatePermission(req, resource, action);
      
      if (!hasPermission) {
        return res.status(403).json({ 
          error: "Forbidden", 
          message: `You don't have permission to ${action} ${resource}` 
        });
      }
      
      next();
    } catch (error) {
      console.error(`Error checking permission ${resource}:${action}:`, error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}

/**
 * Middleware para requerir autenticación
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}