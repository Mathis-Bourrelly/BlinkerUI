export type BlinkType = {
    blinkID: string;
    userID: string;
    likeCount: number;
    dislikeCount: number;
    commentCount: number;
    shareCount: number;
    tier?: 'none' | 'bronze' | 'silver' | 'gold';
    createdAt: string;
    updatedAt: string;
    contents: { contentID: string; contentType: string; content: string; position: number }[];
    tags?: { tagID: string; name: string }[]; // Tags associés au blink (max 3)
    profile: {
        display_name: string;
        username: string;
        avatar_url: string;
        userID: string;
    };
    isLiked: boolean; // Maintenant non-optionnel car toujours fourni par l'API
    isDisliked: boolean; // Indique si l'utilisateur courant a disliké ce blink
};
