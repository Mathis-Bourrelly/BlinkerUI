export interface UserType {
    userID: string;
    name: string;
    password: string;
    email: string;
    role: "user" | "admin"; // Ajout d'un type spécifique pour les rôles
    isVerified: boolean;
}

export interface ProfileType {
    userID: string;
    username: string;
    display_name: string;
    bio?: string; // Optionnel
    avatar_url?: string; // Optionnel
    score: number;
    followingCount: number;
    followersCount: number;
    blinksCount: number;
    isFollowing?: boolean; // Indique si l'utilisateur courant suit ce profil
}

export interface FollowType {
    id: number;
    fromUserID: string;
    targetUserID: string;
}