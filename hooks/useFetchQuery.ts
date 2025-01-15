import {useQuery} from "@tanstack/react-query";
import {Endpoint} from "@/constants/Endpoint";


export function useFetchQuery(path: string) {
    return useQuery({
        queryKey: [path],
        queryFn: async () => {
            wait(1)
            return fetch(Endpoint.url+path).then (res => res.json())
        }}
    )
}

function wait (duration: number) {
    return new Promise(resolve => setTimeout(resolve, duration * 1000))
}