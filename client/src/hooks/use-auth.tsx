import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  saveAuthToken, 
  removeAuthToken, 
  saveUserData, 
  removeUserData, 
  getUserData
} from "../lib/authStorage";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, InsertUser>;
  forgotPasswordMutation: UseMutationResult<{ message: string; token?: string }, Error, { email: string }>;
  resetPasswordMutation: UseMutationResult<{ message: string }, Error, { token: string; password: string }>;
};

type LoginData = Pick<InsertUser, "email" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Intentar cargar el usuario desde localStorage al inicio
  // Esto permite tener un estado inicial mientras se verifica con el servidor
  const cachedUser = getUserData();
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | undefined, Error>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 0, // No caché
    refetchOnMount: true, // Re-consultar al montar
    refetchOnWindowFocus: true, // Re-consultar al enfocar la ventana
    initialData: cachedUser, // Usar datos del localStorage como estado inicial
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Intentando iniciar sesión con:", credentials);
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      
      // Verificar si tenemos cookies después del login
      console.log("Cookies recibidas:", document.cookie);
      
      const data = await res.json();
      console.log("Datos de respuesta completos:", data);
      
      // Verificar si recibimos un token JWT
      if (data.token) {
        console.log("Token JWT recibido", data.token.slice(0, 15) + "...");
        
        // Guardar el token JWT
        saveAuthToken(data.token);
        console.log("Token JWT guardado en localStorage");
        
        // Guardar los datos del usuario (sin el token)
        const { token, ...userData } = data;
        saveUserData(userData);
        console.log("Datos de usuario guardados en localStorage:", userData);
        
        return userData.user || userData; // Compatibilidad con diferentes formatos
      }
      
      console.log("No se recibió token JWT en la respuesta");
      return data;
    },
    onSuccess: (user: User) => {
      console.log("Login exitoso, usuario:", user);
      queryClient.setQueryData(["/api/auth/me"], user);
      toast({
        title: "Sesión iniciada",
        description: `Bienvenido, ${user.name || user.email}`,
      });
    },
    onError: (error: Error) => {
      console.error("Error en login:", error);
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Credenciales incorrectas",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      console.log("Intentando registrar usuario:", credentials);
      const res = await apiRequest("POST", "/api/auth/register", credentials);
      
      const data = await res.json();
      console.log("Datos de respuesta de registro:", data);
      
      // Verificar si recibimos un token JWT
      if (data.token) {
        console.log("Token JWT recibido en registro", data.token.slice(0, 15) + "...");
        
        // Guardar el token JWT
        saveAuthToken(data.token);
        console.log("Token JWT de registro guardado en localStorage");
        
        // Guardar los datos del usuario (sin el token)
        const { token, ...userData } = data;
        saveUserData(userData);
        console.log("Datos de usuario de registro guardados:", userData);
        
        return userData.user || userData; // Compatibilidad con diferentes formatos
      }
      
      console.log("No se recibió token JWT en la respuesta de registro");
      return data;
    },
    onSuccess: (user: User) => {
      console.log("Registro exitoso, usuario:", user);
      queryClient.setQueryData(["/api/auth/me"], user);
      toast({
        title: "Registro exitoso",
        description: `Bienvenido, ${user.name || user.email}`,
      });
    },
    onError: (error: Error) => {
      console.error("Error en registro:", error);
      toast({
        title: "Error al registrarse",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log("Intentando cerrar sesión");
      
      try {
        // Mantenemos la llamada al servidor para garantizar compatibilidad
        await apiRequest("POST", "/api/auth/logout");
      } catch (error) {
        console.warn("Error al cerrar sesión en el servidor:", error);
        // Continuamos con el proceso de logout aunque falle el servidor
      }
      
      // Eliminar token y datos del usuario del localStorage
      removeAuthToken();
      removeUserData();
    },
    onSuccess: () => {
      console.log("Sesión cerrada exitosamente");
      queryClient.setQueryData(["/api/auth/me"], null);
      
      // Invalidar todas las consultas para forzar recargas
      queryClient.invalidateQueries();
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    },
    onError: (error: Error) => {
      console.error("Error al cerrar sesión:", error);
      
      // Intentar limpiar el localStorage de todos modos
      removeAuthToken();
      removeUserData();
      queryClient.setQueryData(["/api/auth/me"], null);
      
      toast({
        title: "Error al cerrar sesión",
        description: "Se ha cerrado la sesión localmente, pero hubo un error en el servidor",
        variant: "destructive",
      });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await apiRequest("POST", "/api/forgot-password", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Solicitud enviada",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      const res = await apiRequest("POST", "/api/reset-password", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Contraseña restablecida",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mantener localStorage actualizado cuando cambie el usuario
  useEffect(() => {
    if (user) {
      saveUserData(user);
    }
  }, [user]);
  
  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        forgotPasswordMutation,
        resetPasswordMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}