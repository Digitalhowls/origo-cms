import { Request } from 'express';

/**
 * Obtiene el ID de la organización de la solicitud HTTP
 * 
 * Busca el ID de la organización en el siguiente orden:
 * 1. De la propiedad organizationId añadida por el middleware de organización
 * 2. De la propiedad user.organizationId si el usuario está autenticado
 * 3. Del parámetro 'organizationId' en el cuerpo de la solicitud
 * 4. Del parámetro 'organizationId' en la consulta URL
 * 
 * @param req Objeto de solicitud Express
 * @returns ID de la organización o undefined si no se encuentra
 */
export function getOrganizationIdFromRequest(req: Request): number | undefined {
  // Si ya fue establecido por el middleware de organización
  if ((req as any).organizationId) {
    return (req as any).organizationId;
  }
  
  // Si hay un usuario autenticado con organización asignada
  if (req.user && (req.user as any).organizationId) {
    return (req.user as any).organizationId;
  }
  
  // Buscar en el cuerpo de la solicitud
  if (req.body && req.body.organizationId) {
    return parseInt(req.body.organizationId);
  }
  
  // Buscar en los parámetros de la URL
  if (req.query && req.query.organizationId) {
    return parseInt(req.query.organizationId as string);
  }
  
  return undefined;
}

/**
 * Verifica si el usuario actual es administrador
 * 
 * @param req Objeto de solicitud Express
 * @returns true si el usuario es administrador, false en caso contrario
 */
export function isAdmin(req: Request): boolean {
  if (!req.user) return false;
  
  // Verificar el rol del usuario (superadmin o admin)
  const role = (req.user as any).role;
  return role === 'superadmin' || role === 'admin';
}

/**
 * Verifica si el usuario actual es el propietario del recurso
 * 
 * @param req Objeto de solicitud Express
 * @param resourceUserId ID del usuario propietario del recurso
 * @returns true si el usuario actual es el propietario, false en caso contrario
 */
export function isResourceOwner(req: Request, resourceUserId: number): boolean {
  if (!req.user) return false;
  
  return (req.user as any).id === resourceUserId;
}