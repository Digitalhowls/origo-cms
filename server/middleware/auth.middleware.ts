import { Request, Response, NextFunction } from 'express';
import { checkAuthenticatedSession } from '../utils/session-helper';
import { extractTokenFromHeader, verifyToken } from '../utils/jwt-helper';
import { storage } from '../storage';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Verificando autenticación en authMiddleware');
    
    // 1. Verificar si ya está autenticado por sesión
    if (checkAuthenticatedSession(req)) {
      console.log('Sesión autenticada en authMiddleware. SessionID:', req.sessionID);
      console.log('Usuario autenticado vía sesión:', req.user?.email);
      
      // Refrescar la sesión en cada petición autenticada para mantenerla viva
      req.session.touch();
      
      return next();
    }
    
    // 2. Verificar JWT en el header Authorization
    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader);
    
    if (authHeader) {
      const token = extractTokenFromHeader(authHeader);
      
      if (token) {
        // Verificar y decodificar el token
        const decoded = verifyToken(token);
        
        if (decoded && decoded.id) {
          // El token es válido, obtener usuario desde la BD
          const user = await storage.getUser(decoded.id);
          
          if (user) {
            // Eliminar contraseña del objeto usuario
            const { password, ...userWithoutPassword } = user;
            
            // Almacenar el payload del token y usuario en el objeto req para uso posterior
            req.jwtPayload = decoded;
            req.user = userWithoutPassword as Express.User;
            
            // Añadir datos a la sesión para mejorar la persistencia entre peticiones
            console.log('Guardando información de usuario en sesión...');
            
            try {
              // Guardar organizationId en la sesión si existe en el usuario o en el token
              const organizationId = (user as any).organizationId || decoded.organizationId || null;
              if (organizationId) {
                console.log(`Estableciendo organizationId=${organizationId} en la sesión`);
                (req.session as any).organizationId = organizationId;
                
                // Actualizar también (req as any).currentOrganization
                const organization = await storage.getOrganization(organizationId);
                if (organization) {
                  console.log(`Estableciendo currentOrganization en el contexto de la solicitud (ID: ${organizationId})`);
                  (req as any).currentOrganization = organization;
                }
              }
              
              // Guardar cambios en la sesión
              req.session.save((err) => {
                if (err) {
                  console.error('Error al guardar la sesión:', err);
                } else {
                  console.log('Sesión guardada correctamente');
                }
              });
            } catch (sessionError) {
              console.error('Error al actualizar la sesión:', sessionError);
              // No bloqueamos la autenticación por errores en la sesión
            }
            
            console.log('Usuario autenticado vía JWT:', userWithoutPassword.email);
            return next();
          }
        }
      }
    }
    
    // Si no está autenticado por ningún método, devolver 401
    return res.status(401).json({ 
      message: 'No autorizado. Por favor, inicie sesión para continuar.' 
    });
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Necesitamos hacer este middleware async debido a la verificación JWT
export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Primero verificamos la autenticación - reutilizamos la lógica del authMiddleware
    // para no duplicar código
    await authMiddleware(req, res, (err?: any) => {
      if (err) return next(err);
      
      // La autenticación pasó, ahora verificamos el rol
      const user = req.user as any;
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return res.status(403).json({ 
          message: 'Prohibido. No tienes permisos suficientes para realizar esta acción.' 
        });
      }
      
      // Usuario autenticado y tiene rol de admin, proceder
      return next();
    });
  } catch (error) {
    console.error('Error en middleware de admin:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const apiKeyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Get API key from header
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({ message: 'API key no proporcionada' });
  }
  
  try {
    // In a real implementation, you would verify the API key against the database
    // and set the appropriate organization context
    // For now, we'll just pass through this middleware
    
    // storage.getApiKeyByKey(apiKey)...
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'API key inválida' });
  }
};
