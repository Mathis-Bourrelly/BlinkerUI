import {useQuery} from "@tanstack/react-query";

const endpoint = "http://dev.blinker.eterny.fr";

export function useFetchQuery(path: string) {
    return useQuery({
        queryKey: [path],
        queryFn: async () => {
            wait(1)
            return fetch(endpoint+path).then (res => res.json())
        }}
    )
}

function wait (duration: number) {
    return new Promise(resolve => setTimeout(resolve, duration * 1000))
}