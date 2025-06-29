import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePostMutation } from "@/hooks/repository/usePostMutation";
import { usePutMutation } from "@/hooks/repository/usePutMutation";
import { useFetchQuery } from "@/hooks/repository/useFetchQuery";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { 
  ReportType, 
  CreateReportRequest, 
  UpdateReportRequest,
  ReportResponse,
  ReportsListResponse,
  ReportStatsResponse,
  ReportStatus 
} from "@/types/ReportsType";

// Hook pour créer un report (utilisateurs)
export function useCreateReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportData: CreateReportRequest) => {
      const token = await import("@/hooks/useSetToken").then(m => m.getToken());
      console.log('🔑 Token récupéré:', token ? 'Présent' : 'Absent');
      console.log('📤 Envoi du report:', reportData);

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create report');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider les requêtes liées aux reports pour les admins
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["reportStats"] });
    }
  });
}

// Hook pour récupérer tous les reports (admin seulement)
export function useReportsQuery(filters?: {
  status?: ReportStatus;
  reason?: string;
  minReports?: number;
}) {
  return usePaginatedQuery<ReportType>("reports", "/reports", filters);
}

// Hook pour récupérer un report spécifique (admin seulement)
export function useReportQuery(reportID: string) {
  return useFetchQuery<{ data: ReportType }>(`/reports/${reportID}`, ["report", reportID]);
}

// Hook pour mettre à jour le statut d'un report (admin seulement)
export function useUpdateReportMutation(reportID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: { status: ReportStatus }) => {
      const token = await import("@/hooks/useSetToken").then(m => m.getToken());
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/reports/${reportID}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update report');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider les requêtes liées aux reports
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report", reportID] });
      queryClient.invalidateQueries({ queryKey: ["reportStats"] });
    }
  });
}

// Hook pour récupérer les statistiques des reports (admin seulement)
export function useReportStatsQuery() {
  return useFetchQuery<ReportStatsResponse>("/reports/counts", ["reportStats"]);
}

// Hook pour supprimer un blink signalé (admin seulement)
export function useDeleteReportedBlinkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ blinkID }: { blinkID: string }) => {
      const token = await import("@/hooks/useSetToken").then(m => m.getToken());
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/reports/blink/${blinkID}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete blink');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider les requêtes liées aux blinks et reports
      queryClient.invalidateQueries({ queryKey: ["blinks"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["reportStats"] });
    }
  });
}

// Hook pour bannir un utilisateur (admin seulement)
export function useBanUserMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userID, reason, duration }: { 
      userID: string; 
      reason: string; 
      duration?: number; // en heures, undefined = permanent
    }) => {
      const token = await import("@/hooks/useSetToken").then(m => m.getToken());
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/admin/users/${userID}/ban`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason, duration }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to ban user');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider les requêtes liées aux utilisateurs
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  });
}
