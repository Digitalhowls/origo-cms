import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken } from '../utils/jwt-helper';
import { storage } from '../storage';

/**
 * Middleware para verificar la autenticación por JWT
 * Permite continuar si el usuario está autenticado por JWT o por sesión
 */
export const jwtAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Verificar si ya hay usuario autenticado por sesión
    if (req.isAuthenticated() && req.user) {
      return next();
    }
    
    // 2. Verificar JWT en el header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No autorizado. Se requiere token de autenticación.' });
    }
    
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({ message: 'Formato de token inválido. Use: Bearer [token]' });
    }
    
    // Verificar y decodificar el token
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }
    
    // El token es válido, obtener usuario desde la BD
    const user = await storage.getUser(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    
    // Eliminar contraseña del objeto usuario
    const { password, ...userWithoutPassword } = user;
    
    // Almacenar el payload del token y usuario en el objeto req para uso posterior
    req.jwtPayload = decoded;
    req.user = userWithoutPassword as Express.User;
    
    next();
  } catch (error) {
    console.error('Error en middleware JWT:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};