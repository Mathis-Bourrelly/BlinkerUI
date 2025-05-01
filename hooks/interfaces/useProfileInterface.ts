import { useFetchQuery } from "@/hooks/repository/useFetchQuery";
import { usePostMutation } from "@/hooks/repository/usePostMutation";
import { usePutMutation } from "@/hooks/repository/usePutMutation";
import { useDeleteMutation } from "@/hooks/repository/useDeleteMutation";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { ProfileType } from "@/types/usersType";
import { useMutation } from "@tanstack/react-query";
import { getToken } from "@/hooks/useSetToken";

export function useUserProfileQuery(userID: string, queryKeys: string[] = []) {
    return useFetchQuery(`/profiles/${userID}`, ["profile", userID, ...queryKeys]);
}

export function useCreateProfileMutation() {
    return usePostMutation(`${process.env.EXPO_PUBLIC_API_URL}/profiles`);
}

export function useUpdateProfileMutation(userID: string) {
    // If userID is 'current', we'll use a special endpoint for updating just the avatar
    if (userID === 'current') {
        return useMutation({
            mutationFn: async (data: { userID: string, avatarUrl: string }) => {
                console.log('Updating profile avatar with data:', data);
                const token = await getToken();
                if (!token) {
                    throw new Error('No authentication token found');
                }

                if (!data.userID || !data.avatarUrl) {
                    throw new Error('Missing required data: userID or avatarUrl');
                }

                const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profiles/update-avatar`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
                    throw new Error(errorData.message || `Failed to update avatar. Status: ${response.status}`);
                }

                return response.json();
            }
        });
    }

    // Otherwise, use the standard update endpoint
    return usePutMutation<Partial<ProfileType>>(`/profiles/${userID}`);
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

export function useSearchProfilesQuery(searchTerm: string) {
    return usePaginatedQuery<ProfileType>("searchProfiles", `/profiles/search`, { searchTerm });
}