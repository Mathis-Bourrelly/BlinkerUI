import { BlinkType } from '@/types/BlinksType';
import { getToken } from '@/hooks/useSetToken';

export const createBlink = async (contents: { contentType: string; content: string; position: number }[]): Promise<BlinkType> => {
    try {
        const token = await getToken();
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/blinks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ contents }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create blink');
        }

        return response.json();
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to create blink');
    }
}; 