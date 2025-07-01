import React from 'react';
import { render, act } from '@testing-library/react-native';
import { UserProvider, useUser } from '@/context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken } from '@/hooks/useSetToken';

// Mock des dépendances
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@/hooks/useSetToken');

describe('UserContext', () => {
    const mockToken = 'test-token';
    const mockUserID = 'test-user-id';
    const mockAvatarUrl = 'test-avatar.jpg';

    beforeEach(() => {
        jest.clearAllMocks();
        (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
            if (key === 'userID') return Promise.resolve(mockUserID);
            if (key === 'avatar_url') return Promise.resolve(mockAvatarUrl);
            return Promise.resolve(null);
        });
        (getToken as jest.Mock).mockResolvedValue(mockToken);
    });

    it('should load user from storage on mount', async () => {
        const TestComponent = () => {
            const { user } = useUser();
            return <>{user?.userID}</>;
        };

        const { getByText } = render(
            <UserProvider>
                <TestComponent />
            </UserProvider>
        );

        await act(async () => {
            await Promise.resolve();
        });

        expect(getByText(mockUserID)).toBeTruthy();
    });

    it('should store user data', async () => {
        const TestComponent = () => {
            const { storeUser } = useUser();
            return (
                <button
                    onClick={() =>
                        storeUser({
                            userID: 'new-user-id',
                            name: 'Test User',
                            password: '',
                            email: 'test@example.com',
                            role: 'user',
                            isVerified: false,
                            avatar_url: 'new-avatar.jpg'
                        })
                    }
                >
                    Store User
                </button>
            );
        };

        const { getByText } = render(
            <UserProvider>
                <TestComponent />
            </UserProvider>
        );

        await act(async () => {
            getByText('Store User').props.onClick();
        });

        expect(AsyncStorage.setItem).toHaveBeenCalledWith('userID', 'new-user-id');
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('avatar_url', 'new-avatar.jpg');
    });

    it('should clear user data', async () => {
        const TestComponent = () => {
            const { clearUser } = useUser();
            return <button onClick={clearUser}>Clear User</button>;
        };

        const { getByText } = render(
            <UserProvider>
                <TestComponent />
            </UserProvider>
        );

        await act(async () => {
            getByText('Clear User').props.onClick();
        });

        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userID');
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('avatar_url');
    });
}); 