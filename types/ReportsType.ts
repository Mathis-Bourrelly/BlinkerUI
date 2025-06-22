export interface ReportType {
  reportID: string;
  blinkID: string;
  reporterID: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  
  // Informations sur le blink signalé
  blink?: {
    blinkID: string;
    userID: string;
    contents: { contentID: string; contentType: string; content: string; position: number }[];
    createdAt: string;
    profile: {
      display_name: string;
      username: string;
      avatar_url: string;
      userID: string;
    };
  };
  
  // Informations sur le rapporteur
  reporter?: {
    userID: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  
  // Informations sur le modérateur qui a traité le report
  reviewer?: {
    userID: string;
    username: string;
    display_name: string;
  };
}

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  HATE_SPEECH = 'hate_speech',
  VIOLENCE = 'violence',
  NUDITY = 'nudity',
  COPYRIGHT = 'copyright',
  MISINFORMATION = 'misinformation',
  OTHER = 'other'
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}

export interface CreateReportRequest {
  blinkID: string;
  reason: ReportReason;
  description?: string;
}

export interface UpdateReportRequest {
  status: ReportStatus;
  reviewNote?: string;
}

export interface ReportResponse {
  success: boolean;
  status: number;
  message: string;
  data: ReportType;
}

export interface ReportsListResponse {
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
    data: ReportType[];
  };
}

export interface ReportStatsResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    totalReports: number;
    pendingReports: number;
    resolvedReports: number;
    dismissedReports: number;
    reportsByReason: Record<ReportReason, number>;
  };
}
