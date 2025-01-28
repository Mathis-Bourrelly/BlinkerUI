import {useQuery} from "@tanstack/react-query";
import {Endpoint} from "@/constants/Endpoint";


export function useFetchQuery(path: string) {
    return useQuery({
        queryKey: [path],
        queryFn: async () => {
            return fetch(Endpoint.url+path).then (res => res.json())
        }}
    )
}
