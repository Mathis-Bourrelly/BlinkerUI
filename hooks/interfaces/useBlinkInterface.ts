import { useFetchQuery } from "@/hooks/repository/useFetchQuery";
import { usePostMutation } from "@/hooks/repository/usePostMutation";
import { usePutMutation } from "@/hooks/repository/usePutMutation";
import { useDeleteMutation } from "@/hooks/repository/useDeleteMutation";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { Endpoint } from "@/constants/Endpoint";
import { BlinkType } from "@/types/BlinksType";

export function useBlinkInterface(blinkID: string, queryKeys: string[] = []) {
    return useFetchQuery(`/blinks/${blinkID}`, ["blink", blinkID, ...queryKeys]);
}

export function useCreateBlinkMutation() {
    return usePostMutation(`${Endpoint.url}/blinks`);
}

export function useUpdateBlinkMutation(blinkID: string) {
    return usePutMutation<Partial<BlinkType>>(`/blinks/${blinkID}`);
}

export function useDeleteBlinkMutation(blinkID: string) {
    return useDeleteMutation(`/blinks/${blinkID}`);
}

export function useBlinksQuery() {
    return usePaginatedQuery<BlinkType>("blinks", "/blinks");
}

export function useSearchBlinksQuery(searchTerm: string) {
    return usePaginatedQuery<BlinkType>("searchBlinks", `/blinks/search`, { searchTerm });
}
