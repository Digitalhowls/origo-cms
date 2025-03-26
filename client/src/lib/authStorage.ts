/**
 * Servicio para manejar el almacenamiento del token JWT
 * Almacena el token en localStorage para persistencia entre sesiones
 */

// Clave para almacenar el token en localStorage
const AUTH_TOKEN_KEY = 'origo-auth-token';
const USER_DATA_KEY = 'origo-user-data';

/**
 * Almacena el token JWT en localStorage
 * @param token Token JWT a almacenar
 */
export function saveAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Obtiene el token JWT almacenado en localStorage
 * @returns Token JWT o null si no existe
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Elimina el token JWT de localStorage
 */
export function removeAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

/**
 * Almacena los datos del usuario en localStorage
 * @param userData Datos del usuario a almacenar
 */
export function saveUserData(userData: any): void {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
}

/**
 * Obtiene los datos del usuario almacenados en localStorage
 * @returns Datos del usuario o null si no existen
 */
export function getUserData(): any | null {
  const data = localStorage.getItem(USER_DATA_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * Elimina los datos del usuario de localStorage
 */
export function removeUserData(): void {
  localStorage.removeItem(USER_DATA_KEY);
}

/**
 * Comprueba si hay un token JWT almacenado
 * @returns true si hay un token almacenado
 */
export function hasAuthToken(): boolean {
  return !!getAuthToken();
}

/**
 * Limpia todos los datos de autenticación (token y usuario)
 */
export function clearAuthData(): void {
  removeAuthToken();
  removeUserData();
}