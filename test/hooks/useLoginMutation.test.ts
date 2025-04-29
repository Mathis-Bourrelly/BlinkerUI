import { renderHook, act } from '@testing-library/react-hooks';
import { useLoginMutation } from '@/hooks/useLoginMutation';
import { useUser } from '@/context/UserContext';
import { storeToken } from '@/hooks/useSetToken';

// Mock des dépendances
jest.mock('@/context/UserContext');
jest.mock('@/hooks/useSetToken');

describe('useLoginMutation', () => {
    const mockStoreUser = jest.fn();
    const mockStoreToken = jest.fn();

    beforeEach(() => {
        // Reset des mocks
        jest.clearAllMocks();
        (useUser as jest.Mock).mockReturnValue({ storeUser: mockStoreUser });
        (storeToken as jest.Mock).mockImplementation(mockStoreToken);
    });

    it('should handle successful login', async () => {
        // Mock de la réponse de l'API
        global.fetch = jest.fn().mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    message: 'Login successful',
                    token: 'test-token',
                    userID: 'test-user-id'
                })
            })
        );

        const { result } = renderHook(() => useLoginMutation());

        await act(async () => {
            await result.current.mutate({
                email: 'test@test.com',
                password: 'test'
            });
        });

        // Vérifications
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/login'),
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'test@test.com',
                    password: 'test'
                })
            })
        );

        expect(mockStoreToken).toHaveBeenCalledWith('test-token');
        expect(mockStoreUser).toHaveBeenCalledWith({
            message: 'Login successful',
            token: 'test-token',
            userID: 'test-user-id'
        });
    });

    it('should handle login failure', async () => {
        // Mock de la réponse d'erreur de l'API
        global.fetch = jest.fn().mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({
                    message: 'Invalid credentials'
                })
            })
        );

        const { result } = renderHook(() => useLoginMutation());

        await act(async () => {
            try {
                await result.current.mutate({
                    email: 'test@test.com',
                    password: 'wrong-password'
                });
            } catch (error) {
                expect(error.message).toBe('Invalid credentials');
            }
        });

        // Vérifications
        expect(mockStoreToken).not.toHaveBeenCalled();
        expect(mockStoreUser).not.toHaveBeenCalled();
    });
}); 