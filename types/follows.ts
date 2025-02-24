export interface User {
    userID: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
}

export interface FollowsResponse {
    page: number;
    limit: number;
    total: number;
    data: User[];
}
