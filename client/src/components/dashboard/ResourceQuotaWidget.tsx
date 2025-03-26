import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { HardDrive, Users, FileText, Layers } from 'lucide-react';

// Tipo para los datos de cuota
interface ResourceQuota {
  resourceType: 'users' | 'pages' | 'posts' | 'courses' | 'storage';
  usage: number;
  limit: number;
  percentage: number;
}

// Mapeo de iconos por tipo de recurso
const resourceIcons = {
  users: <Users className="h-4 w-4" />,
  pages: <FileText className="h-4 w-4" />,
  posts: <FileText className="h-4 w-4" />,
  courses: <Layers className="h-4 w-4" />,
  storage: <HardDrive className="h-4 w-4" />,
};

// Mapeo de nombres localizados por tipo de recurso
const resourceNames = {
  users: 'Usuarios',
  pages: 'Páginas',
  posts: 'Entradas de blog',
  courses: 'Cursos',
  storage: 'Almacenamiento (MB)',
};

export function ResourceQuotaWidget() {
  const { toast } = useToast();
  
  const { data, isLoading, error } = useQuery<ResourceQuota[]>({
    queryKey: ['/api/organization/resource-quotas'],
    retry: 1
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Uso de recursos</CardTitle>
          <CardDescription>Límites de tu plan actual</CardDescription>
        </CardHeader>
        <CardContent>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="mb-6 last:mb-0">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-2 w-full mb-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  if (error || !data) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Uso de recursos</CardTitle>
          <CardDescription>Error al cargar los datos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No se pudieron cargar los datos de cuotas. Por favor, intenta de nuevo más tarde.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Uso de recursos</CardTitle>
        <CardDescription>Límites de tu plan actual</CardDescription>
      </CardHeader>
      <CardContent>
        {(Array.isArray(data) ? data : []).map((quota: ResourceQuota) => (
          <div key={quota.resourceType} className="mb-6 last:mb-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {resourceIcons[quota.resourceType]}
                </span>
                <span className="text-sm font-medium">
                  {resourceNames[quota.resourceType]}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {quota.usage} / {quota.limit === 0 ? '∞' : quota.limit}
              </span>
            </div>
            <Progress 
              value={quota.limit > 0 ? quota.percentage : 0} 
              className="h-2"
              // Clase condicional para mostrar progreso crítico
              data-critical={quota.percentage >= 90}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                {quota.percentage}%
              </span>
              {quota.percentage >= 90 && (
                <span className="text-xs text-destructive font-medium">
                  Casi alcanzado
                </span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}