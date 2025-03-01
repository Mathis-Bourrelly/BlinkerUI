export type BlinkType = {
    blinkID: string;
    userID: string;
    likeCount: number;
    dislikeCount: number;
    commentCount: number;
    shareCount: number;
    createdAt: string;
    updatedAt: string;
    contents: { contentID: string; contentType: string; content: string; position: number }[];
    profile: {
        display_name: string;
        username: string;
        avatar_url: string;
    };
};
