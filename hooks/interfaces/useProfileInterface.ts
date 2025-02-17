import { useFetchQuery } from "@/hooks/repository/useFetchQuery";
import { usePostMutation } from "@/hooks/repository/usePostMutation";
import { usePutMutation } from "@/hooks/repository/usePutMutation";
import { useDeleteMutation } from "@/hooks/repository/useDeleteMutation";
import { Endpoint } from "@/constants/Endpoint";
import { Profile } from "@/types/users";

export function useUserProfileQuery(userID: string, queryKeys: string[] = []) {
    return useFetchQuery(`/profiles/${userID}`, ["profile", userID, ...queryKeys]);
}

export function useCreateProfileMutation() {
    return usePostMutation(`${Endpoint.url}/profiles`);
}

export function useUpdateProfileMutation(userID: string) {
    return usePutMutation<Partial<Profile>>(`/profiles/${userID}`);
}

export function useDeleteProfileMutation(userID: string) {
    return useDeleteMutation(`/profiles/${userID}`);
}

