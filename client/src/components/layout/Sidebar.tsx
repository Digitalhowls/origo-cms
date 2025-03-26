import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  FileText, 
  BookOpen, 
  Image, 
  Briefcase, 
  Users, 
  Sliders, 
  Palette, 
  Monitor, 
  Key, 
  ChevronDown 
} from 'lucide-react';
import { OrganizationSwitcher } from '../organization/OrganizationSwitcher';
import { UserMenu } from '../user/UserMenu';

interface SidebarProps {
  collapsed?: boolean;
}

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  active?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const [location] = useLocation();

  const mainMenuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      path: '/',
      icon: <Home className="h-5 w-5" />,
      active: location === '/',
    },
    {
      name: 'Páginas',
      path: '/pages',
      icon: <FileText className="h-5 w-5" />,
      active: location.startsWith('/pages'),
    },
    {
      name: 'Blog',
      path: '/blog',
      icon: <BookOpen className="h-5 w-5" />,
      active: location.startsWith('/blog'),
    },
    {
      name: 'Medios',
      path: '/media',
      icon: <Image className="h-5 w-5" />,
      active: location.startsWith('/media'),
    },
    {
      name: 'Cursos',
      path: '/courses',
      icon: <Briefcase className="h-5 w-5" />,
      active: location.startsWith('/courses'),
    },
  ];

  const settingsMenuItems: MenuItem[] = [
    {
      name: 'Usuarios',
      path: '/settings/users',
      icon: <Users className="h-5 w-5" />,
      active: location === '/settings/users',
    },
    {
      name: 'Branding',
      path: '/settings/branding',
      icon: <Sliders className="h-5 w-5" />,
      active: location === '/settings/branding',
    },
    {
      name: 'Apariencia',
      path: '/settings/appearance',
      icon: <Palette className="h-5 w-5" />,
      active: location === '/settings/appearance',
    },
    {
      name: 'Integraciones',
      path: '/settings/integrations',
      icon: <Monitor className="h-5 w-5" />,
      active: location === '/settings/integrations',
    },
    {
      name: 'API',
      path: '/settings/api',
      icon: <Key className="h-5 w-5" />,
      active: location === '/settings/api',
    },
  ];

  if (collapsed) {
    return (
      <aside className="flex flex-col w-20 bg-white border-r border-gray-200 h-full">
        <div className="p-4 border-b border-gray-200 flex justify-center">
          <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center text-white font-bold">
            O
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-2 px-2">
            {mainMenuItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex justify-center items-center p-2 rounded-md ${
                  item.active 
                    ? 'bg-blue-50 text-primary' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
              </Link>
            ))}
          </div>
          
          <div className="mt-6 px-2 space-y-2">
            {settingsMenuItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex justify-center items-center p-2 rounded-md ${
                  item.active 
                    ? 'bg-blue-50 text-primary' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
              </Link>
            ))}
          </div>
        </nav>
        
        <div className="border-t border-gray-200 p-4 flex justify-center">
          <div className="w-10 h-10 rounded-full bg-gray-300"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-full">
      <OrganizationSwitcher />
      
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">Principal</h3>
        </div>
        
        {mainMenuItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={`flex items-center px-4 py-2 text-sm font-medium ${
              item.active 
                ? 'text-primary bg-blue-50 border-l-4 border-primary' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.icon}
            <span className="ml-3">{item.name}</span>
          </Link>
        ))}
        
        <div className="px-4 mt-6 mb-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">Configuración</h3>
        </div>
        
        {settingsMenuItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={`flex items-center px-4 py-2 text-sm font-medium ${
              item.active 
                ? 'text-primary bg-blue-50 border-l-4 border-primary' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.icon}
            <span className="ml-3">{item.name}</span>
          </Link>
        ))}
      </nav>
      
      <UserMenu />
    </aside>
  );
};

export default Sidebar;
