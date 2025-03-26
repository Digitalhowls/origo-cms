import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check if the user is authenticated
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'No autorizado. Por favor, inicie sesión para continuar.' });
  }

  // User is authenticated, proceed to the next middleware/route handler
  next();
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check if the user is authenticated and is an admin
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'No autorizado. Por favor, inicie sesión para continuar.' });
  }

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
