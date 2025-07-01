import { useQuery } from "@tanstack/react-query";

import {getToken} from "@/hooks/useSetToken";
import {router} from "expo-router"; // Un hook qui récupère le token

type FetchQueryResponse = {
    success: boolean;
    status: number;
    message: string;
    data: any;
};

export function useFetchQuery<T = FetchQueryResponse>(path: string, queryKey: any[], headers?: any) {
    return useQuery<T>({
        queryKey,
        queryFn: async () => {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}${path}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${await getToken()}`,
                    ...headers, // Permet de rajouter d'autres headers si besoin
                }
            });
            if (res.status === 401 ) {
                router.push("/landing")
            }

            if (!res.ok) throw new Error("Failed to fetch data");
            return res.json();
        }
    });
}
