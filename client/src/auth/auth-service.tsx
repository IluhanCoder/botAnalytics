import api from '../api';
import { jwtDecode } from 'jwt-decode';
import { AuthResponse } from "../../../shared/types/auth-types";
import { UserCredentials } from "../../../shared/types/user-types";

export const defaultUserCredentials: UserCredentials = {
    username: "",
    password: ""
}

export default new class AuthService {
    isAuthenticated = (): boolean => {
        const token = localStorage.getItem('token');
        return !!token;
    };

    getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // Запит для перевірки токена на сервері
    validateToken = async (): Promise<boolean> => {
        try {
            await api.get('/auth/validate', {
                headers: this.getAuthHeader(),
            });
            return true;
        } catch (err) {
            return false;
        }
    };

    loginUser = async (credentials: UserCredentials): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>('/auth/login', credentials);
            const token = response.data.token;

            console.log(token);

            // Збереження токена в localStorage після успішного логіну
            localStorage.setItem('token', token);

            return response.data;
        } catch (error) {
            throw error;
        }
    };

    getUserRole = (): string | null => {
        const token = localStorage.getItem('token');

        if (!token) return null;

        try {
            const decoded: { role: string } = jwtDecode(token);
            return decoded.role;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    register = async (credentials: UserCredentials): Promise<any> => {
        const token = localStorage.getItem('token'); // Припустимо, токен для аутентифікації зберігається в LocalStorage

        const response = await api.post('/auth/register', credentials, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    }
}