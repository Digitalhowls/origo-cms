import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
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
  
  const res = await fetch(url, {
    method,
    headers: data ? { 
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "Accept": "application/json"
    } : {
      "X-Requested-With": "XMLHttpRequest",
      "Accept": "application/json"
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Mantener credenciales para cookies
    cache: "no-cache",
  });

  if (!res.ok) {
    console.error(`API Error ${res.status}: ${method} ${url}`);
    await throwIfResNotOk(res);
  } else {
    console.log(`API Success: ${method} ${url}`);
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
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Accept": "application/json"
      },
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
