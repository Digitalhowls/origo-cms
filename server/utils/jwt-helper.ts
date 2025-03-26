import jwt from 'jsonwebtoken';
import { User } from '@shared/schema';

// Clave secreta para firmar los tokens JWT
// En producción, esto debería estar en variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'origo-jwt-secret-key';
const JWT_EXPIRES_IN = '30d'; // Tiempo de expiración del token

/**
 * Genera un token JWT para un usuario
 * @param user Usuario para el que se genera el token
 * @returns Token JWT
 */
export function generateToken(user: User): string {
  // Eliminamos la contraseña del payload por seguridad
  const { password, ...userWithoutPassword } = user;
  
  return jwt.sign(
    userWithoutPassword, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verifica y decodifica un token JWT
 * @param token Token JWT a verificar
 * @returns Payload del token o null si es inválido
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Error al verificar token JWT:', error);
    return null;
  }
}

/**
 * Extrae el token de los headers de Authorization
 * @param authHeader Header de Authorization
 * @returns Token extraído o null si no es válido
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
}