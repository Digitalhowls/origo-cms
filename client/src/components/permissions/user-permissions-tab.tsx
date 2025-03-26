import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Este componente se implementará completamente en el futuro
const UserPermissionsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permisos de Usuario</CardTitle>
        <CardDescription>
          Gestión avanzada de permisos específicos a nivel de usuario
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Próximamente</AlertTitle>
          <AlertDescription>
            La personalización avanzada de permisos a nivel individual de usuarios 
            estará disponible próximamente. Por ahora, puedes gestionar los permisos 
            de los usuarios a través de los roles personalizados.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default UserPermissionsTab;