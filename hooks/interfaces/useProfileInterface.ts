import { useFetchQuery } from "@/hooks/repository/useFetchQuery";
import { usePostMutation } from "@/hooks/repository/usePostMutation";
import { usePutMutation } from "@/hooks/repository/usePutMutation";
import { useDeleteMutation } from "@/hooks/repository/useDeleteMutation";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { Endpoint } from "@/constants/Endpoint";
import { ProfileType } from "@/types/usersType";

export function useUserProfileQuery(userID: string, queryKeys: string[] = []) {
    return useFetchQuery(`/profiles/${userID}`, ["profile", userID, ...queryKeys]);
}

export function useCreateProfileMutation() {
    return usePostMutation(`${Endpoint.url}/profiles`);
}

export function useUpdateProfileMutation(userID: string) {
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