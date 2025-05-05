import { useMutation } from "@tanstack/react-query";
import { getToken } from "@/hooks/useSetToken";

export function usePutMutation<T = void>(path: string, token?: string) {
    return useMutation({
        mutationFn: async (data?: T) => {
            // Récupérer le token si non fourni
            let authToken = token;
            if (!authToken) {
                authToken = await getToken() || undefined;
            }

            // Préparer les options de la requête
            const options: RequestInit = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                },
            };

            // Ajouter le corps de la requête seulement si des données sont fournies
            if (data !== undefined) {
                options.body = JSON.stringify(data);
            }

            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}${path}`, options);

            if (!res.ok) {
                const errorText = await res.text();
                let errorMessage = "Failed to update data";
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // Si le texte n'est pas du JSON valide, utiliser le texte brut
                    if (errorText) errorMessage = errorText;
                }
                throw new Error(errorMessage);
            }

            // Vérifier si la réponse contient du contenu avant de la parser
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json") && res.status !== 204) {
                return res.json();
            }

            // Retourner un objet vide si pas de contenu
            return {};
        },
    });
}
