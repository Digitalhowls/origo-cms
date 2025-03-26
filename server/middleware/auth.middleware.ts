import { Request, Response, NextFunction } from 'express';
import { checkAuthenticatedSession } from '../utils/session-helper';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Verificar si hay un ID de sesión usando el helper
  console.log('Verificando sesión en authMiddleware. SessionID:', req.sessionID);
  
  // Verificar autenticación utilizando el helper
  if (!checkAuthenticatedSession(req)) {
    // Si no está autenticado, devolver 401
    return res.status(401).json({ message: 'No autorizado. Por favor, inicie sesión para continuar.' });
  }

  console.log('Sesión autenticada en authMiddleware. SessionID:', req.sessionID);
  console.log('Usuario autenticado:', req.user?.email);
  
  // Refrescar la sesión en cada petición autenticada para mantenerla viva
  req.session.touch();
  
  // User is authenticated, proceed to the next middleware/route handler
  next();
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check if the user is authenticated and is an admin
  if (!checkAuthenticatedSession(req)) {
    return res.status(401).json({ message: 'No autorizado. Por favor, inicie sesión para continuar.' });
  }

  // Refrescar la sesión para mantenerla viva
  req.session.touch();

  // Check if user has admin role
  const user = req.user as any;
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return res.status(403).json({ message: 'Prohibido. No tienes permisos suficientes para realizar esta acción.' });
  }

  // User is authenticated and has admin role, proceed
  next();
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
