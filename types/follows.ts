import {Profiles} from "@/types/Profiles";


export interface FollowsResponse {
    page: number;
    limit: number;
    total: number;
    data: Profiles[];
}

export interface FollowersResponse {
    page: number;
    limit: number;
    total: number;
    data: Profiles[];
}