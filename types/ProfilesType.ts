export interface ProfilesType {
    userID: string;
    display_name: string;
    username: string;
    avatar_url?: string;
    score?: number;
    isFollowing?: boolean; // Indique si l'utilisateur courant suit ce profil
}