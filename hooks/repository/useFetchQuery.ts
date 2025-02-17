import { useQuery } from "@tanstack/react-query";
import { Endpoint } from "@/constants/Endpoint";
import {getToken} from "@/hooks/useLoginMutation";
import {router} from "expo-router"; // Un hook qui récupère le token

export function useFetchQuery(path: string, queryKey: any[], headers?: any) {
    return useQuery({
        queryKey,
        queryFn: async () => {
            const res = await fetch(`${Endpoint.url}${path}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${await getToken()}`,
                    ...headers, // Permet de rajouter d'autres headers si besoin
                }
            });
            if (res.status === 401) {
                router.push("/login")
            }

            if (!res.ok) throw new Error("Failed to fetch data");
            return res.json();
        }
    });
}
