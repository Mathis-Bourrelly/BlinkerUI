import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { BlinkList } from '@/components/feature/BlinkList';
import BlinkInterface from '@/hooks/interfaces/useBlinkInterface';
import { useTheme } from '@/context/ThemeContext';

// Mock des dépendances
jest.mock('@/hooks/interfaces/useBlinkInterface');
jest.mock('@/context/ThemeContext');

describe('BlinkList', () => {
    const mockColors = {
        accent: '#000',
        danger: '#ff0000',
        text: '#000',
        background: '#fff',
        card: '#fff',
        border: '#ccc',
        textSecondary: '#666',
        gradient: ['#fff', '#eee'],
        accentGradient: ['#000', '#111'],
        dangerGradient: ['#ff0000', '#cc0000'],
        dangerTimer: '#ff0000'
    };

    beforeEach(() => {
        (useTheme as jest.Mock).mockReturnValue({ colors: mockColors });
    });

    it('should render loading state', () => {
        (BlinkInterface.useBlinksQuery as jest.Mock).mockReturnValue({
            isLoading: true,
            data: null,
            error: null
        });

        const { getByTestId } = render(<BlinkList />);
        expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should render error state', () => {
        (BlinkInterface.useBlinksQuery as jest.Mock).mockReturnValue({
            isLoading: false,
            data: null,
            error: new Error('Failed to fetch blinks')
        });

        const { getByText } = render(<BlinkList />);
        expect(getByText('Erreur : Failed to fetch blinks')).toBeTruthy();
    });

    it('should render empty state', () => {
        (BlinkInterface.useBlinksQuery as jest.Mock).mockReturnValue({
            isLoading: false,
            data: { pages: [] },
            error: null
        });

        const { getByText } = render(<BlinkList />);
        expect(getByText('Aucun blink disponible')).toBeTruthy();
    });

    it('should render blinks list', async () => {
        const mockBlinks = [
            {
                blinkID: '1',
                userID: 'user1',
                likeCount: 0,
                dislikeCount: 0,
                commentCount: 0,
                shareCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                contents: [
                    {
                        contentID: '1',
                        contentType: 'text',
                        content: 'Test blink',
                        position: 1
                    }
                ],
                profile: {
                    display_name: 'Test User',
                    username: 'testuser',
                    avatar_url: 'test.jpg',
                    userID: 'user1'
                }
            }
        ];

        (BlinkInterface.useBlinksQuery as jest.Mock).mockReturnValue({
            isLoading: false,
            data: { pages: [{ data: mockBlinks }] },
            error: null,
            fetchNextPage: jest.fn(),
            hasNextPage: false,
            isFetchingNextPage: false
        });

        const { getByText } = render(<BlinkList />);
        
        await waitFor(() => {
            expect(getByText('Test blink')).toBeTruthy();
            expect(getByText('Test User')).toBeTruthy();
            expect(getByText('@testuser')).toBeTruthy();
        });
    });
}); 