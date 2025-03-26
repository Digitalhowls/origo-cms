import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RolePermissionsInfo } from "./role-permissions-info";
import { UserPermissionsManager } from "./user-permissions-manager";
import { UserRole } from "@shared/types";
import { Separator } from "@/components/ui/separator";

interface UserPermissionsTabProps {
  userId: number;
  userName: string;
  userRole: UserRole;
}

export function UserPermissionsTab({ userId, userName, userRole }: UserPermissionsTabProps) {
  const [activeTab, setActiveTab] = useState<string>("role");
  
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Gestión de permisos</h2>
        <p className="text-sm text-muted-foreground">
          Visualiza y administra los permisos del usuario {userName}.
        </p>
      </div>
      
      <Separator />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="role">Permisos por rol</TabsTrigger>
          <TabsTrigger value="custom">Permisos personalizados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="role" className="mt-4">
          <RolePermissionsInfo role={userRole} />
        </TabsContent>
        
        <TabsContent value="custom" className="mt-4">
          <UserPermissionsManager 
            userId={userId}
            userName={userName}
            userRole={userRole}
          />
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 p-4 border rounded-md bg-blue-50 border-blue-200">
        <h4 className="font-medium text-blue-800">¿Cómo funcionan los permisos?</h4>
        <ul className="mt-2 space-y-2 text-sm text-blue-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>Cada usuario tiene permisos basados en su <strong>rol</strong> (superadmin, admin, editor, reader o viewer).</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Los permisos <strong>personalizados</strong> pueden anular los permisos predeterminados del rol.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>El sistema verifica primero si existen permisos personalizados antes de aplicar los permisos del rol.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Los usuarios con rol <strong>superadmin</strong> siempre tienen todos los permisos y no pueden ser restringidos.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}