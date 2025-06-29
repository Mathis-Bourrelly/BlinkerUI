import { useState, useEffect } from 'react';
import { useFetchQuery } from '@/hooks/repository/useFetchQuery';
import { useUser } from '@/context/UserContext';
import { getToken } from '@/hooks/useSetToken';

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
  const [userRole, setUserRole] = useState<'user' | 'moderator' | 'admin'>('user');

  useEffect(() => {
    if (user?.userID) {
      // TEMPORAIRE : Rôles en dur pour tester
      // TODO: Remplacer par un vrai appel API quand le back-end sera prêt
      const testRoles: Record<string, 'user' | 'moderator' | 'admin'> = {
        // Ajoutez ici vos userIDs de test
        'admin-test-id': 'admin',
        'moderator-test-id': 'moderator',
        // TEMPORAIRE: Ajoutez votre userID ici pour tester (regardez la console)
        'bb29baec-bbfe-4c65-a930-82e8696a7ed1': 'admin', // Votre userID avec droits admin
      };

      // TEMPORAIRE: Pour tester, on peut forcer admin si c'est votre userID
      // Remplacez 'VOTRE-USER-ID' par votre vrai userID depuis la console
      const isTestUser = user.userID === 'VOTRE-USER-ID-ICI';
      console.log('🔍 Is test user?', { userID: user.userID, isTestUser });

      const role = testRoles[user.userID] || (isTestUser ? 'admin' : 'user'); // Par défaut user (sécurisé)

      setUserRole(role);
      setIsAdmin(role === 'admin');
      setIsModerator(role === 'moderator' || role === 'admin');
      setIsLoading(false);

      console.log('🔑 User Role Debug:', {
        userID: user.userID,
        role: role,
        isAdmin: role === 'admin',
        isModerator: role === 'moderator' || role === 'admin'
      });
    } else {
      setIsLoading(false);
    }
  }, [user?.userID]);

  return {
    isAdmin,
    isModerator,
    isLoading,
    role: userRole,
    permissions: isAdmin ? ['moderate', 'admin'] : isModerator ? ['moderate'] : [],
    error: null
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
