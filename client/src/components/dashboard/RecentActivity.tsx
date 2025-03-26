import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'wouter';

interface Activity {
  id: string;
  type: 'page' | 'blog' | 'media' | 'user' | 'course';
  action: 'created' | 'updated' | 'deleted' | 'published' | 'joined';
  title: string;
  user: {
    name: string;
    avatar?: string;
  };
  timestamp: string;
  url: string;
}

interface RecentActivityProps {
  activities?: Activity[];
  isLoading?: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ 
  activities, 
  isLoading = false 
}) => {
  // Default activities if none provided
  const defaultActivities: Activity[] = [
    {
      id: '1',
      type: 'page',
      action: 'published',
      title: 'Página de inicio',
      user: {
        name: 'Juan Pérez',
        avatar: 'https://i.pravatar.cc/150?img=1'
      },
      timestamp: 'Hace 10 minutos',
      url: '/pages/1'
    },
    {
      id: '2',
      type: 'blog',
      action: 'created',
      title: 'Cómo mejorar su SEO en 2023',
      user: {
        name: 'María González',
        avatar: 'https://i.pravatar.cc/150?img=5'
      },
      timestamp: 'Hace 2 horas',
      url: '/blog/2'
    },
    {
      id: '3',
      type: 'media',
      action: 'updated',
      title: 'Banner promocional.jpg',
      user: {
        name: 'Carlos Rodríguez',
        avatar: 'https://i.pravatar.cc/150?img=8'
      },
      timestamp: 'Hace 5 horas',
      url: '/media?id=3'
    },
    {
      id: '4',
      type: 'user',
      action: 'joined',
      title: 'Nuevo editor',
      user: {
        name: 'Ana López',
        avatar: 'https://i.pravatar.cc/150?img=10'
      },
      timestamp: 'Ayer',
      url: '/settings/users'
    },
    {
      id: '5',
      type: 'course',
      action: 'created',
      title: 'Introducción al Marketing Digital',
      user: {
        name: 'Roberto Díaz',
        avatar: 'https://i.pravatar.cc/150?img=12'
      },
      timestamp: 'Hace 2 días',
      url: '/courses/5'
    }
  ];

  const items = activities || defaultActivities;

  // Badge colors by type
  const badgeVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    page: "default",
    blog: "secondary",
    media: "outline",
    user: "destructive",
    course: "default"
  };

  // Action text
  const actionText: Record<string, string> = {
    created: 'creó',
    updated: 'actualizó',
    deleted: 'eliminó',
    published: 'publicó',
    joined: 'se unió como'
  };

  // Type text
  const typeText: Record<string, string> = {
    page: 'página',
    blog: 'artículo',
    media: 'archivo',
    user: '',
    course: 'curso'
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {items.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={activity.user.avatar} />
                <AvatarFallback>{activity.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user.name}</span>{' '}
                  {actionText[activity.action]}{' '}
                  {typeText[activity.type]}{' '}
                  <Link href={activity.url} className="text-primary hover:underline">
                    {activity.title}
                  </Link>
                </p>
                <div className="flex items-center mt-1">
                  <Badge variant={badgeVariants[activity.type]} className="mr-2 text-xs">
                    {activity.type}
                  </Badge>
                  <span className="text-xs text-gray-500">{activity.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
