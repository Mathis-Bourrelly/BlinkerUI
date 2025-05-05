import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getToken } from "@/hooks/useSetToken";

type FollowResponse = {
  success: boolean;
  message: string;
};

// Hook pour vérifier si l'utilisateur actuel suit un autre utilisateur
export function useIsFollowingQuery(targetUserID: string | undefined, currentUserID: string | undefined) {
  // Utiliser le queryClient pour accéder aux données du profil
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["isFollowing", targetUserID],
    queryFn: async () => {
      if (!targetUserID) {
        throw new Error("Target user ID is required");
      }

      // Essayer d'obtenir les données du profil depuis le cache
      const profileData = queryClient.getQueryData(["profile", targetUserID]);

      // Si nous avons déjà les données du profil et qu'elles contiennent isFollowing
      if (profileData && typeof profileData === 'object' && 'isFollowing' in profileData) {
        console.log(`Using cached profile data for isFollowing: ${profileData.isFollowing}`);
        return profileData.isFollowing || false;
      }

      // Sinon, récupérer les données du profil
      console.log(`Fetching profile data for user ${targetUserID} to check follow status`);
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profiles/${targetUserID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // En cas d'erreur, supposer que l'utilisateur ne suit pas
        console.warn(`Failed to fetch profile data: ${response.status}`);
        return false;
      }

      const data = await response.json();

      // Mettre à jour le cache avec les données du profil
      queryClient.setQueryData(["profile", targetUserID], data);

      return data.isFollowing || false;
    },
    // Ne pas refetch automatiquement, seulement quand explicitement demandé
    staleTime: 60000, // 1 minute
    retry: false,
    // Activer la requête uniquement si l'utilisateur est connecté et si l'ID de l'utilisateur du profil est valide
    enabled: !!currentUserID && !!targetUserID && currentUserID !== targetUserID
  });
}

// Hook pour suivre un utilisateur
export function useFollowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserID: string) => {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/follows/${targetUserID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to follow user. Status: ${response.status}`);
      }

      return response.json() as Promise<FollowResponse>;
    },
    onSuccess: (_, targetUserID) => {
      // Invalider les requêtes pour mettre à jour l'UI
      queryClient.invalidateQueries({ queryKey: ["isFollowing", targetUserID] });
      queryClient.invalidateQueries({ queryKey: ["profile", targetUserID] });
      queryClient.invalidateQueries({ queryKey: ["followers", targetUserID] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    }
  });
}

// Hook pour ne plus suivre un utilisateur
export function useUnfollowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserID: string) => {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/follows/${targetUserID}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to unfollow user. Status: ${response.status}`);
      }

      return response.json() as Promise<FollowResponse>;
    },
    onSuccess: (_, targetUserID) => {
      // Invalider les requêtes pour mettre à jour l'UI
      queryClient.invalidateQueries({ queryKey: ["isFollowing", targetUserID] });
      queryClient.invalidateQueries({ queryKey: ["profile", targetUserID] });
      queryClient.invalidateQueries({ queryKey: ["followers", targetUserID] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    }
  });
}
