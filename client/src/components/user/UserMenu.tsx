import React from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings, User, LogOut, HelpCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { UserProfile } from '@shared/types';
import { useToast } from '@/hooks/use-toast';

export const UserMenu: React.FC = () => {
  const { toast } = useToast();
  
  // Fetch current user info
  const { data: currentUser, isLoading, error } = useQuery<UserProfile>({
    queryKey: ['/api/auth/me'],
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error al cerrar sesión",
        description: "Ha ocurrido un error. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-gray-100 rounded mt-1 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500">!</div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Error</h2>
              <span className="text-xs text-gray-500">Sesión no válida</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/login'}>
            Iniciar sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 p-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-between px-2">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <h2 className="text-sm font-medium text-gray-900">{currentUser.name}</h2>
                <span className="text-xs text-gray-500">{currentUser.role}</span>
              </div>
            </div>
            <Settings className="h-4 w-4 text-gray-500 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => window.location.href = '/settings/profile'}>
              <User className="h-4 w-4 mr-2" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
              <Settings className="h-4 w-4 mr-2" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = '/help'}>
              <HelpCircle className="h-4 w-4 mr-2" />
              <span>Ayuda</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
