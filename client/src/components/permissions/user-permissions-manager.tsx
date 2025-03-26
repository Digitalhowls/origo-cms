import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import UserPermissionsTab from './user-permissions-tab';
import { Shield } from 'lucide-react';
import { UserRole } from '@shared/types';

interface UserPermissionsManagerProps {
  userId: number;
  userName: string;
  userRole: string;
}

const UserPermissionsManager: React.FC<UserPermissionsManagerProps> = ({
  userId,
  userName,
  userRole,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <Shield className="h-4 w-4 mr-2" />
          Gestionar permisos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Permisos de {userName}</DialogTitle>
          <DialogDescription>
            Gestiona los permisos y roles del usuario.
          </DialogDescription>
        </DialogHeader>
        
        <UserPermissionsTab 
          userId={userId}
          userName={userName}
          userRole={userRole as UserRole}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UserPermissionsManager;