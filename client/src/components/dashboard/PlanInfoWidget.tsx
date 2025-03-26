import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Check, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

// Tipos para la información del plan
interface PlanInfo {
  organization: {
    id: number;
    name: string;
    plan: string;
  };
  usage: {
    users: number;
    pages: number;
    posts: number;
    courses: number;
    storage: number;
  };
  limits: {
    maxUsers: number;
    maxPages: number;
    maxPosts: number;
    maxCourses: number;
    maxStorage: number;
    customDomain: boolean;
    whiteLabel: boolean;
    advancedAnalytics: boolean;
    support: 'email' | 'priority' | '24/7';
    apiAccess: boolean;
  };
}

// Mapeo de textos para los tipos de planes
const planLabels: Record<string, string> = {
  free: 'Gratuito',
  basic: 'Básico',
  professional: 'Profesional',
  enterprise: 'Empresarial'
};

// Mapeo de colores para los tipos de planes
const planColors: Record<string, string> = {
  free: 'bg-gray-400',
  basic: 'bg-blue-400',
  professional: 'bg-indigo-500',
  enterprise: 'bg-purple-600'
};

// Mapeo de textos para los tipos de soporte
const supportLabels: Record<string, string> = {
  email: 'Email',
  priority: 'Prioritario',
  '24/7': 'Soporte 24/7'
};

export function PlanInfoWidget() {
  const { toast } = useToast();
  
  const { data, isLoading, error } = useQuery<PlanInfo>({
    queryKey: ['/api/organization/usage'],
    retry: 1
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Tu plan</CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-36" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
    );
  }
  
  if (error || !data) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Tu plan</CardTitle>
          <CardDescription>Error al cargar los datos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No se pudo cargar la información de tu plan. Por favor, intenta de nuevo más tarde.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const organization = data?.organization || { id: 0, name: 'Mi organización', plan: 'free' };
  const limits = data?.limits || {
    maxUsers: 10,
    maxPages: 10,
    maxPosts: 10,
    maxCourses: 5,
    maxStorage: 100,
    customDomain: false,
    whiteLabel: false,
    advancedAnalytics: false,
    support: 'email' as const,
    apiAccess: false
  };
  const planType = organization.plan || 'free';
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Tu plan</CardTitle>
            <CardDescription>Organización: {organization.name}</CardDescription>
          </div>
          <Badge className={`${planColors[planType]} text-white`}>
            {planLabels[planType] || planType}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="text-sm flex items-center">
              <span className="text-muted-foreground flex items-center mr-2">
                <Check className="h-3.5 w-3.5 mr-1" />
                Usuarios:
              </span>
              <span>{limits.maxUsers === 0 ? 'Ilimitados' : limits.maxUsers}</span>
            </div>
            <div className="text-sm flex items-center">
              <span className="text-muted-foreground flex items-center mr-2">
                <Check className="h-3.5 w-3.5 mr-1" />
                Páginas:
              </span>
              <span>{limits.maxPages === 0 ? 'Ilimitadas' : limits.maxPages}</span>
            </div>
          </div>
          <div className="flex items-start justify-between">
            <div className="text-sm flex items-center">
              <span className="text-muted-foreground flex items-center mr-2">
                <Check className="h-3.5 w-3.5 mr-1" />
                Posts:
              </span>
              <span>{limits.maxPosts === 0 ? 'Ilimitados' : limits.maxPosts}</span>
            </div>
            <div className="text-sm flex items-center">
              <span className="text-muted-foreground flex items-center mr-2">
                <Check className="h-3.5 w-3.5 mr-1" />
                Cursos:
              </span>
              <span>{limits.maxCourses === 0 ? 'Ilimitados' : limits.maxCourses}</span>
            </div>
          </div>
          <div className="flex items-start justify-between">
            <div className="text-sm flex items-center">
              <span className="text-muted-foreground flex items-center mr-2">
                <Check className="h-3.5 w-3.5 mr-1" />
                Almacenamiento:
              </span>
              <span>{limits.maxStorage === 0 ? 'Ilimitado' : `${limits.maxStorage} MB`}</span>
            </div>
            <div className="text-sm flex items-center">
              <span className="text-muted-foreground flex items-center mr-2">
                <Check className="h-3.5 w-3.5 mr-1" />
                Soporte:
              </span>
              <span>{supportLabels[limits.support] || limits.support}</span>
            </div>
          </div>
          <div className="flex items-start justify-between">
            <div className="text-sm flex items-center">
              <span className="text-muted-foreground flex items-center mr-2">
                <Check className="h-3.5 w-3.5 mr-1" />
                Dominio personalizado:
              </span>
              <span>{limits.customDomain ? 'Sí' : 'No'}</span>
            </div>
            <div className="text-sm flex items-center">
              <span className="text-muted-foreground flex items-center mr-2">
                <Check className="h-3.5 w-3.5 mr-1" />
                API:
              </span>
              <span>{limits.apiAccess ? 'Sí' : 'No'}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full" size="sm">
          <Link to={`/settings/organizations/${organization.id}`}>
            <CreditCard className="h-4 w-4 mr-2" />
            Cambiar plan
            <ChevronRight className="h-4 w-4 ml-auto" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}