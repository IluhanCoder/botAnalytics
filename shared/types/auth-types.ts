import { ApiResponse } from './api-types';

export type AuthResponse = ApiResponse & { token: string };