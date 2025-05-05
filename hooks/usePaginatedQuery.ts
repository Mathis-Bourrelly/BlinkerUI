import { useInfiniteQuery } from "@tanstack/react-query";

import { getToken } from "@/hooks/useSetToken"; // Récupération du token
import { router } from "expo-router";

type PaginatedResponse<T> = {
    success: boolean;
    status: number;
    message: string;
    data: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        data: T[];
    };
};

export function usePaginatedQuery<T>(
    queryKey: string,    // Clé pour React Query (ex: "followers", "following", "search")
    route: string,    // URL relative de l'API (ex: "/following/following")
    params?: Record<string, any>, // Paramètres supplémentaires (ex: { userID, searchTerm })
    options?: { enabled?: boolean } // Options supplémentaires pour useInfiniteQuery
) {
    return useInfiniteQuery<PaginatedResponse<T>>({
        enabled: options?.enabled !== undefined ? options.enabled : true,
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
            // Vérifier si la réponse contient les informations de pagination
            if (lastPage.data && lastPage.data.hasNextPage !== undefined) {
                return lastPage.data.hasNextPage ? lastPage.data.page + 1 : undefined;
            }

            // Fallback pour les API qui ne renvoient pas hasNextPage
            // Calculer s'il y a plus de pages en fonction du total et des résultats actuels
            if (lastPage.data && lastPage.data.total && lastPage.data.users) {
                const currentPage = lastPage.data.page || 1;
                const limit = lastPage.data.limit || 10;
                const total = lastPage.data.total;
                const hasMorePages = currentPage * limit < total;
                return hasMorePages ? currentPage + 1 : undefined;
            }

            return undefined;
        },
    });
}
