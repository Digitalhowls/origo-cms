import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Función para verificar y configurar el entorno de cookies
function initCookieEnvironment() {
  // Mostrar las cookies actuales en la consola
  console.log('Cookies al iniciar la aplicación:', document.cookie);
  
  // Comprobar si la configuración de cookies del navegador está habilitada
  const testCookieName = 'origo_cookie_test';
  const testCookieValue = 'cookie_enabled';
  
  // Intentar establecer una cookie de prueba
  document.cookie = `${testCookieName}=${testCookieValue}; path=/; SameSite=None; Secure=false`;
  
  // Verificar si la cookie se ha establecido correctamente
  const cookieEnabled = document.cookie.indexOf(testCookieName) !== -1;
  
  console.log('Estado de cookies del navegador:', cookieEnabled ? 'Habilitado' : 'Deshabilitado');
  
  if (!cookieEnabled) {
    console.warn('⚠️ Las cookies están deshabilitadas o bloqueadas. La autenticación no funcionará correctamente.');
  }
  
  return cookieEnabled;
}

// Inicializar entorno de cookies
initCookieEnvironment();

// Función para crear un interceptor global de fetch
// Esta funcionalidad ahora se maneja desde queryClient.ts con JWT
// Mantenemos el interceptor para compatibilidad, pero delegamos la autenticación
// al sistema de JWT implementado en queryClient.ts
const originalFetch = window.fetch;
window.fetch = async function(input, init) {
  // Asegurarse de que siempre se incluyan las credenciales
  const modifiedInit: RequestInit = {
    ...init,
    credentials: 'include' as RequestCredentials, // Especificar tipo explícitamente
    headers: {
      ...(init?.headers || {}),
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  };
  
  console.log('Interceptando fetch para:', input);
  console.log('Cookies antes de fetch:', document.cookie);
  
  try {
    const response = await originalFetch(input, modifiedInit);
    console.log('Respuesta de fetch:', response.status, response.statusText);
    console.log('Cookies después de fetch:', document.cookie);
    return response;
  } catch (error) {
    console.error('Error en fetch interceptado:', error);
    throw error;
  }
};

createRoot(document.getElementById("root")!).render(<App />);
