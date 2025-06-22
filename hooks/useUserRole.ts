import { useState, useEffect } from 'react';
import { useFetchQuery } from '@/hooks/repository/useFetchQuery';
import { useUser } from '@/context/UserContext';

export interface UserRoleData {
  userID: string;
  role: 'user' | 'moderator' | 'admin';
  permissions: string[];
}

export function useUserRole() {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Récupérer les informations de rôle de l'utilisateur
  const { data: roleData, isLoading: roleLoading, error } = useFetchQuery<{ data: UserRoleData }>(
    `/users/${user?.userID}/role`,
    ["userRole", user?.userID || ""],
    {
      enabled: !!user?.userID,
    }
  );

  useEffect(() => {
    if (!roleLoading) {
      setIsLoading(false);
      const role = roleData?.data?.role;
      setIsAdmin(role === 'admin');
      setIsModerator(role === 'moderator' || role === 'admin'); // Admin a aussi les droits de modérateur
    }
  }, [roleData, roleLoading]);

  return {
    isAdmin,
    isModerator,
    isLoading,
    role: roleData?.data?.role || 'user',
    permissions: roleData?.data?.permissions || [],
    error
  };
}

// Hook pour vérifier si l'utilisateur a une permission spécifique
export function useHasPermission(permission: string) {
  const { permissions, isLoading } = useUserRole();
  
  return {
    hasPermission: permissions.includes(permission),
    isLoading
  };
}

// Hook pour vérifier si l'utilisateur peut modérer
export function useCanModerate() {
  const { isModerator, isLoading } = useUserRole();
  
  return {
    canModerate: isModerator,
    isLoading
  };
}

// Hook pour vérifier si l'utilisateur peut accéder aux fonctionnalités admin
export function useCanAccessAdmin() {
  const { isAdmin, isLoading } = useUserRole();
  
  return {
    canAccess: isAdmin,
    isLoading
  };
}
