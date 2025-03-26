import { Request, Response, NextFunction } from 'express';

/**
 * Helper para manejar sesiones de manera consistente en todo el servidor
 */

// Verificar si hay una sesión activa y usuario autenticado
export function checkAuthenticatedSession(req: Request): boolean {
  const isAuthenticated = req.isAuthenticated();
  console.log('Session check - authenticated:', isAuthenticated, '- SessionID:', req.sessionID);
  console.log('req.user:', req.user ? 'presente' : 'ausente');
  
  if (req.headers.cookie) {
    console.log('Cookies presentes:', req.headers.cookie);
  } else {
    console.log('No hay cookies presentes en la solicitud');
  }
  
  // Verificar si hay datos de sesión
  if (req.session) {
    console.log('ID de sesión:', req.sessionID);
    console.log('Datos de sesión:', JSON.stringify(req.session));
  } else {
    console.log('No hay objeto de sesión');
  }
  
  return isAuthenticated;
}

// Guardar la sesión de manera explícita y continuar con la respuesta
export function saveSessionAndRespond(
  req: Request, 
  res: Response, 
  next: NextFunction, 
  responseData: any
) {
  req.session.touch();
  req.session.save((err) => {
    if (err) {
      console.error('Error al guardar sesión:', err);
      return next(err);
    }
    
    console.log('Sesión guardada correctamente:', req.sessionID);
    res.json(responseData);
  });
}

// Middleware para proteger rutas y asegurar que la sesión se mantiene activa
export function sessionProtectedRoute(req: Request, res: Response, next: NextFunction) {
  if (!checkAuthenticatedSession(req)) {
    return res.status(401).json({ message: 'No autorizado. Por favor, inicie sesión para continuar.' });
  }
  
  // La sesión está activa, renovar y continuar
  req.session.touch();
  next();
}