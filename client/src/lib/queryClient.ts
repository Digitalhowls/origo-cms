import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAuthToken } from "./authStorage";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Tipo para los headers HTTP
 */
type Headers = {
  [key: string]: string;
};

/**
 * Añade el token de autenticación JWT al objeto de headers si existe
 * @param headers Headers actuales
 * @returns Headers con token de autenticación añadido si existe
 */
function addAuthHeader(headers: Headers): Headers {
  const token = getAuthToken();
  
  if (token) {
    return {
      ...headers,
      "Authorization": `Bearer ${token}`
    };
  }
  
  return headers;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log(`API Request: ${method} ${url}`);
  
  // Obtener cookies para diagnóstico
  const cookies = document.cookie;
  console.log("Cookies existentes:", cookies);
  
  // Preparar headers base con valores iniciales comunes
  const baseHeaders: Headers = {
    "X-Requested-With": "XMLHttpRequest",
    "Accept": "application/json"
  };
  
  // Añadir Content-Type si hay datos
  if (data) {
    baseHeaders["Content-Type"] = "application/json";
  }
  
  // Añadir token JWT si existe
  const headers = addAuthHeader(baseHeaders);
  
  // Mostrar si estamos usando autorización JWT
  if (headers.Authorization) {
    console.log("Usando token JWT para autorización");
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Mantener para compatibilidad con cookies
    cache: "no-cache",
  });

  if (!res.ok) {
    console.error(`API Error ${res.status}: ${method} ${url}`);
    await throwIfResNotOk(res);
  } else {
    console.log(`API Success: ${method} ${url}`);
    
    // Verificar si hay cookies recibidas
    const cookiesAfter = document.cookie;
    console.log("Cookies recibidas:", cookiesAfter);
  }
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    console.log(`QueryFn: ${queryKey[0]}`);
    
    // Obtener cookies para diagnóstico
    const cookies = document.cookie;
    console.log("Cookies antes de fetch:", cookies);
    
    // Preparar headers base
    const baseHeaders: Headers = {
      "X-Requested-With": "XMLHttpRequest",
      "Accept": "application/json"
    };
    
    // Añadir token JWT si existe
    const headers = addAuthHeader(baseHeaders);
    
    // Mostrar si estamos usando autorización JWT
    if (headers.Authorization) {
      console.log("Usando token JWT para autorización en query");
    }
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include", // Mantener para compatibilidad con cookies
      headers,
      cache: "no-cache"
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.log(`Auth check failed (401) for ${queryKey[0]}`);
      return null;
    }

    if (!res.ok) {
      console.error(`QueryFn Error ${res.status}: ${queryKey[0]}`);
      await throwIfResNotOk(res);
    } else {
      console.log(`QueryFn Success: ${queryKey[0]}`);
      
      // Verificar si hay cookies recibidas
      const cookiesAfter = document.cookie;
      console.log("Cookies después de query:", cookiesAfter);
    }
    
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
