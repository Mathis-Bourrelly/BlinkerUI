import {useQuery} from "@tanstack/react-query";
import {Endpoint} from "@/constants/Endpoint";


export function useFetchQuery(path: string, headers: any) {
    return useQuery({
        queryKey: [path],
        meta: { headers: headers },
        queryFn: async () => {
            return fetch(Endpoint.url+path).then (res => res.json())
        }}
    )
}
