export interface User {
    userID: string;
    name: string;
    password: string;
    email: string;
    role: "user" | "admin"; // Ajout d'un type spécifique pour les rôles
    isVerified: boolean;
}

export interface Profile {
    userID: string;
    username: string;
    bio?: string; // Optionnel
    avatarUrl?: string; // Optionnel
    score: number;
}

export interface Follow {
    id: number;
    fromUserID: string;
    targetUserID: string;
}