import { useMutation } from "@tanstack/react-query";


export function useDeleteMutation(path: string, token?: string) {
    return useMutation({
        mutationFn: async () => {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}${path}`, {
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
