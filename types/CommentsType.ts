export interface CommentType {
  commentID: string;
  blinkID: string;
  userID: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  profile: {
    userID: string;
    username: string;
    display_name: string;
    avatar_url?: string;
    score: number;
  };
}

export interface CreateCommentRequest {
  blinkID: string;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentResponse {
  success: boolean;
  status: number;
  message: string;
  data: CommentType;
}

export interface CommentsListResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    data: CommentType[];
  };
}

export interface CommentMutationData {
  created?: boolean;
  updated?: boolean;
  removed?: boolean;
}

export interface CommentMutationResponse {
  success: boolean;
  status: number;
  message: string;
  data?: CommentMutationData;
}
