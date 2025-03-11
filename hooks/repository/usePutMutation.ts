import { useMutation } from "@tanstack/react-query";


export function usePutMutation<T>(path: string, token?: string) {
    return useMutation({
        mutationFn: async (data: T) => {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}${path}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to update data");
            return res.json();
        },
    });
}
