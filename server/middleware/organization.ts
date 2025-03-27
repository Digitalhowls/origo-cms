/**
 * Middleware para obtener y validar la organización desde la solicitud
 */

import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { Organization } from "@shared/schema";

/**
 * Obtiene la organización del usuario actual basado en el dominio o headers
 */
export async function getOrganizationFromRequest(req: Request): Promise<Organization | undefined> {
  // Si ya se ha procesado la organización, devolverla directamente
  if (req.organization) {
    return req.organization;
  }

  // Obtener el ID de organización del header X-Organization-ID
  const orgId = req.headers['x-organization-id'] as string;
  if (orgId) {
    const organization = await storage.getOrganization(parseInt(orgId));
    if (organization) {
      req.organization = organization;
      return organization;
    }
  }

  // Si el usuario está autenticado, obtener su organización predeterminada
  if (req.user && req.user.id) {
    const userOrgs = await storage.getUserOrganizations(req.user.id);
    if (userOrgs.length > 0) {
      req.organization = userOrgs[0];
      return userOrgs[0];
    }
  }

  // Intentar obtener la organización desde el dominio
  const host = req.hostname || req.headers.host;
  if (host) {
    // Comprobar si es un dominio personalizado
    const orgByDomain = await storage.getOrganizationByCustomDomain(host);
    if (orgByDomain) {
      req.organization = orgByDomain;
      return orgByDomain;
    }

    // Comprobar si es un subdominio
    const subdomain = host.split('.')[0];
    if (subdomain && subdomain !== 'www') {
      const orgBySubdomain = await storage.getOrganizationBySubdomain(subdomain);
      if (orgBySubdomain) {
        req.organization = orgBySubdomain;
        return orgBySubdomain;
      }
    }
  }

  return undefined;
}

/**
 * Middleware para requerir una organización en la solicitud
 */
export function requireOrganization(req: Request, res: Response, next: NextFunction) {
  getOrganizationFromRequest(req)
    .then((organization) => {
      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }
      
      req.organization = organization;
      next();
    })
    .catch((error) => {
      console.error("Error in requireOrganization middleware:", error);
      res.status(500).json({ error: "Internal server error" });
    });
}

// Declarar el tipo para el objeto Request de Express para agregar la propiedad organization
declare global {
  namespace Express {
    interface Request {
      organization?: Organization;
    }
  }
}