import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Eye, Menu } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface TopNavbarProps {
  pageTitle: string;
  onSidebarToggle?: () => void;
  actions?: React.ReactNode;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ 
  pageTitle, 
  onSidebarToggle, 
  actions 
}) => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left: Hamburger + Page Title */}
        <div className="flex items-center">
          <button 
            className="md:hidden text-gray-500 hover:text-gray-700 mr-4"
            onClick={onSidebarToggle}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center" 
                  variant="destructive"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="py-3 cursor-pointer">
                <div>
                  <p className="font-medium">Nueva publicación comentada</p>
                  <p className="text-sm text-gray-500">Juan ha comentado en "Cómo mejorar su SEO"</p>
                  <p className="text-xs text-gray-400 mt-1">Hace 10 minutos</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3 cursor-pointer">
                <div>
                  <p className="font-medium">Actualización de sistema</p>
                  <p className="text-sm text-gray-500">Se ha instalado la versión 2.4.0 de Origo</p>
                  <p className="text-xs text-gray-400 mt-1">Hace 1 hora</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3 cursor-pointer">
                <div>
                  <p className="font-medium">Nuevo usuario registrado</p>
                  <p className="text-sm text-gray-500">María se ha unido como editora</p>
                  <p className="text-xs text-gray-400 mt-1">Ayer</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-primary justify-center">
                Ver todas las notificaciones
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {actions ? (
            actions
          ) : (
            <>
              <Button variant="outline" className="text-primary" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Vista previa
              </Button>
              <Button size="sm">
                Publicar
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
