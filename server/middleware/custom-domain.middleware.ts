import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

/**
 * Middleware para manejar dominios personalizados
 * Este middleware detecta si la solicitud proviene de un dominio personalizado
 * y configura los datos de la organización correspondiente en la solicitud
 */
export const customDomainMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener el dominio de la solicitud
    const host = req.hostname;
    
    // Ignorar solicitudes a localhost o al dominio principal
    if (host === 'localhost' || host.includes('repl.co') || host.includes('replit.app')) {
      return next();
    }
    
    console.log('Solicitud recibida desde dominio personalizado:', host);
    
    // Verificar si es un subdominio de origo.app
    if (host.endsWith('.origo.app')) {
      const subdomain = host.replace('.origo.app', '');
      const organization = await storage.getOrganizationBySubdomain(subdomain);
      
      if (organization) {
        // Configurar datos de la organización en la solicitud
        req.organization = organization;
        console.log(`Subdominio ${subdomain} encontrado para organización:`, organization.name);
      }
      
      return next();
    }
    
    // Buscar si es un dominio personalizado
    const organization = await storage.getOrganizationByCustomDomain(host);
    
    if (organization) {
      // Verificar que el dominio está verificado
      const domainConfig = organization.domainConfig || {};
      
      if (domainConfig.verified) {
        // Configurar datos de la organización en la solicitud
        req.organization = organization;
        console.log(`Dominio personalizado ${host} encontrado para organización:`, organization.name);
      } else {
        console.log(`Dominio personalizado ${host} no está verificado para la organización:`, organization.name);
      }
    } else {
      console.log(`No se encontró ninguna organización para el dominio ${host}`);
    }
    
    next();
  } catch (error) {
    console.error('Error en middleware de dominio personalizado:', error);
    next();
  }
};

// Extender la interfaz de Express Request para incluir la organización
declare global {
  namespace Express {
    interface Request {
      organization?: any;
    }
  }
}