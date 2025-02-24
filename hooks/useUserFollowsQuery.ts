import { useInfiniteQuery } from "@tanstack/react-query";
import { Endpoint } from "@/constants/Endpoint";
import { FollowsResponse } from "@/types/follows";
import { getToken } from "@/hooks/useLoginMutation"; // Fonction qui récupère le JWT depuis AsyncStorage
import { router } from "expo-router";

export function useUserFollowsQuery(userID: string) {
    return useInfiniteQuery<FollowsResponse>({
        queryKey: ['userFollows', userID],
        queryFn: async ({ pageParam = 1 }) => {
            const token = await getToken();
            const res = await fetch(`${Endpoint.url}/follows/followers/${userID}?page=${pageParam}&limit=10`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            });

            if (res.status === 401) {
                router.push("/login");
            }

            if (!res.ok) {
                throw new Error("Failed to fetch follows");
            }

            return res.json();
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            // S'il reste des éléments à charger : page * limit < total
            if (lastPage.page * lastPage.limit < lastPage.total) {
                return lastPage.page + 1;
            }
            return undefined;
        },
    });
}
