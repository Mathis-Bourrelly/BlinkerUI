import { useFetchQuery } from "@/hooks/repository/useFetchQuery";
import { usePostMutation } from "@/hooks/repository/usePostMutation";
import { usePutMutation } from "@/hooks/repository/usePutMutation";
import { useDeleteMutation } from "@/hooks/repository/useDeleteMutation";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { ProfileType } from "@/types/usersType";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getToken } from "@/hooks/useSetToken";

export function useUserProfileQuery(userID: string, queryKeys: string[] = []) {
    return useQuery({
        queryKey: ["profile", userID, ...queryKeys],
        queryFn: async () => {
            const token = await getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profiles/${userID}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            console.log('Profile API response:', data);

            if (!response.ok) {
                throw new Error(data.message || `Failed to fetch profile. Status: ${response.status}`);
            }

            return data;
        },
        enabled: !!userID && userID !== "unknown"
    });
}

export function useCreateProfileMutation() {
    return usePostMutation(`${process.env.EXPO_PUBLIC_API_URL}/profiles`);
}

export function useUpdateProfileMutation(userID: string) {
    // Utiliser le nouvel endpoint pour uploader un avatar
    return useMutation({
        mutationFn: async (data: { avatar: File }) => {
            console.log('Uploading avatar for user:', userID);
            const token = await getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            if (!data.avatar) {
                throw new Error('Missing required data: avatar file');
            }

            const formData = new FormData();
            formData.append('avatar', data.avatar);

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profiles/upload-avatar/${userID}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
                throw new Error(errorData.message || `Failed to upload avatar. Status: ${response.status}`);
            }

            return response.json();
        }
    });
}

export function useDeleteProfileMutation(userID: string) {
    return useDeleteMutation(`/profiles/${userID}`);
}

export function useUserFollowersQuery(userID: string) {
    return usePaginatedQuery<ProfileType>("followers", `/follows/followers/${ userID }`);
}

export function useUserFollowingQuery(userID: string) {
    return usePaginatedQuery<ProfileType>("following", `/follows/following/${ userID }`);
}

// Fonction pour créer un nouveau profil
export function useCreateProfileWithAvatarMutation() {
    return useMutation({
        mutationFn: async (data: { name?: string, username: string, display_name: string, bio?: string, avatar?: File }) => {
            const token = await getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const formData = new FormData();
            if (data.name) formData.append('name', data.name);
            formData.append('username', data.username);
            formData.append('display_name', data.display_name);
            if (data.bio) formData.append('bio', data.bio);
            if (data.avatar) formData.append('avatar', data.avatar);

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profiles`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
                throw new Error(errorData.message || `Failed to create profile. Status: ${response.status}`);
            }

            return response.json();
        }
    });
}

export function useSearchProfilesQuery(searchTerm: string) {
    return usePaginatedQuery<ProfileType>("searchProfiles", `/profiles/search`, { searchTerm });
}