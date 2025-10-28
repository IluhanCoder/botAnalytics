import { AuthResponse } from "../../../shared/types/auth-types";
import { UserCredentials, IUser } from "../../../shared/types/user-types";
import api from "../api";

export default new class userService {
    async createUser(credentials: UserCredentials): Promise<AuthResponse> {
        return (await api.post("/user", credentials)).data as AuthResponse;
    }

    async getCurrentUserId() {
        return (await api.get("/user/id")).data as {id: string};
    }

    // Admin methods
    async fetchAllUsers(): Promise<IUser[]> {
        const response = await api.get<IUser[]>("/admin/users");
        return response.data;
    }

    async deleteUser(userId: string): Promise<void> {
        await api.delete(`/admin/users/${userId}`);
    }

    async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<IUser> {
        const response = await api.put<IUser>(`/admin/users/${userId}/role`, { role });
        return response.data;
    }
}