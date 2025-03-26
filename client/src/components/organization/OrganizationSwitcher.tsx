import React, { useState } from 'react';
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
import { ChevronDown, PlusCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface Organization {
  id: number;
  name: string;
  plan: string;
  logo?: string;
}

export const OrganizationSwitcher: React.FC = () => {
  const { toast } = useToast();
  const { switchOrganizationMutation } = useAuth();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);

  // Fetch organizations for the current user
  const { data: organizations, isLoading, error } = useQuery<Organization[]>({
    queryKey: ['/api/organizations'],
  });

  // Set current organization when data is loaded
  React.useEffect(() => {
    if (organizations && organizations.length > 0 && !currentOrganization) {
      setCurrentOrganization(organizations[0]);
    }
  }, [organizations, currentOrganization]);

  const handleOrganizationChange = (org: Organization) => {
    setCurrentOrganization(org);
    
    // Usar la mutación del hook useAuth para cambiar de organización
    switchOrganizationMutation.mutate(org.id, {
      onSuccess: () => {
        // No es necesario mostrar una notificación porque la mutación ya lo hace
        // La mutación también actualiza el token JWT en localStorage
        
        // Refresh the page to reflect organization change after a short delay
        // para permitir que las queries sean invalidadas
        setTimeout(() => {
          window.location.reload();
        }, 500);
      },
      onError: (error) => {
        console.error('Error switching organization:', error);
        toast({
          title: "Error",
          description: "No se pudo cambiar de organización",
          variant: "destructive",
        });
      }
    });
  };

  const handleCreateNewOrganization = () => {
    // Navigate to organization creation page or open modal
    window.location.href = '/settings/organizations/new';
  };

  if (isLoading) {
    return (
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md bg-gray-200 animate-pulse"></div>
            <div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-20 bg-gray-100 rounded mt-1 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !organizations || organizations.length === 0) {
    return (
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md bg-red-100 flex items-center justify-center text-red-500">!</div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Error</h2>
              <span className="text-xs text-gray-500">No se encontraron organizaciones</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleCreateNewOrganization}>
            <PlusCircle className="h-4 w-4 mr-1" />
            <span className="sr-only sm:not-sr-only">Nueva</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-gray-200">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-between px-2">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8 rounded-md">
                <AvatarImage 
                  src={currentOrganization?.logo} 
                  alt={currentOrganization?.name || 'Organization logo'} 
                />
                <AvatarFallback className="rounded-md">
                  {currentOrganization?.name.charAt(0) || 'O'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <h2 className="text-sm font-semibold text-gray-900">
                  {currentOrganization?.name || 'Mi Empresa'}
                </h2>
                <span className="text-xs text-gray-500">
                  {currentOrganization?.plan || 'Plan Profesional'}
                </span>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Mis organizaciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {organizations.map((org) => (
              <DropdownMenuItem 
                key={org.id}
                onClick={() => handleOrganizationChange(org)}
                className="cursor-pointer"
              >
                <Avatar className="h-6 w-6 rounded-md mr-2">
                  <AvatarImage src={org.logo} alt={org.name} />
                  <AvatarFallback className="rounded-md text-xs">
                    {org.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <p className="text-sm">{org.name}</p>
                  <p className="text-xs text-gray-500">{org.plan}</p>
                </div>
                {currentOrganization?.id === org.id && (
                  <div className="w-2 h-2 bg-primary rounded-full ml-2"></div>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCreateNewOrganization} className="cursor-pointer">
            <PlusCircle className="h-4 w-4 mr-2" />
            <span>Nueva organización</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
