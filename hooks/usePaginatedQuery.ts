import { useInfiniteQuery } from "@tanstack/react-query";

import { getToken } from "@/hooks/useLoginMutation"; // Récupération du token
import { router } from "expo-router";

type PaginatedResponse<T> = {
    page: number;
    limit: number;
    total: number;
    data: T[];
};

export function usePaginatedQuery<T>(
    queryKey: string,    // Clé pour React Query (ex: "followers", "following", "search")
    route: string,    // URL relative de l'API (ex: "/following/following")
    params?: Record<string, any> // Paramètres supplémentaires (ex: { userID, searchTerm })
) {
    return useInfiniteQuery<PaginatedResponse<T>>({
        queryKey: [queryKey, params], // Cache différent selon les paramètres
        queryFn: async ({ pageParam = 1 }) => {
            const token = await getToken();
            const url = new URL(`${process.env.EXPO_PUBLIC_API_URL}${route}`);

            // Ajout des paramètres dynamiques (ex: userID, searchTerm)
            // @ts-ignore
            url.searchParams.append("page", pageParam.toString());
            url.searchParams.append("limit", "10");
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value) url.searchParams.append(key, value.toString());
                });
            }

            const res = await fetch(url.toString(), {
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
                throw new Error(`Failed to fetch data from ${route}`);
            }

            return res.json();
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            return lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined;
        },
    });
}
