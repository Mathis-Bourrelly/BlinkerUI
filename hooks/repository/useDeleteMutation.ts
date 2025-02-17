import { useMutation } from "@tanstack/react-query";
import { Endpoint } from "@/constants/Endpoint";

export function useDeleteMutation(path: string, token?: string) {
    return useMutation({
        mutationFn: async () => {
            const res = await fetch(`${Endpoint.url}${path}`, {
                method: "DELETE",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!res.ok) throw new Error("Failed to delete data");
            return res.json();
        },
    });
}
