import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { io } from 'socket.io-client';

export const BASE_URL = 'http://localhost:3011';
export const API = axios.create({ baseURL: `${BASE_URL}/api` });
export const socket = io(BASE_URL);

export function isError(response:  AxiosResponse<any, any>) {
    return response instanceof AxiosError;
};

export function loginUser(data: any) {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
};

export function logoutUser() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

export async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
        const response = await API.post('/auth/refresh_access_token', {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
        });
        if (response.status === 401 || response.status === 403) {
            return null;
        }
        return response.data.accessToken;
    }
};

export async function getUserData() {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && refreshToken) {
        try {
            const response = await API.get('/auth/users', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return response.data;
        } catch (error: any) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                try {
                    const refreshedAccessToken = await refreshAccessToken();
                    if (refreshedAccessToken) {
                        localStorage.setItem('accessToken', refreshedAccessToken);

                        const response = await API.get('/auth/users', {
                            headers: { Authorization: `Bearer ${refreshedAccessToken}` },
                        });
                        return response.data;
                    }
                    return null;
                } catch (refreshError) {
                    return null;
                }
            }
            return null;
        }
    }

    return null;
};

export async function protectedApiRequest<
    T = any,
    R = AxiosResponse<T, any>,
    D = any
>(
    apiRequest: (url: string, data?: any, config?: AxiosRequestConfig<D>) => Promise<R>,
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: any,
    config: AxiosRequestConfig = {}
): Promise<R | null> {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && refreshToken) {
        let headers = { Authorization: `Bearer ${accessToken}` };

        try {
            const requestConfig = { ...config, headers };

            const response = method === 'GET' || method === 'DELETE'
                ? await apiRequest(url, requestConfig)
                : await apiRequest(url, data, requestConfig);

            return response;
        } catch (error: any) {
            if (error.response && (error.response.status === 403)) {
                try {
                    const refreshedAccessToken = await refreshAccessToken();
                    if (refreshedAccessToken) {
                        localStorage.setItem('accessToken', refreshedAccessToken);
                        headers = { Authorization: `Bearer ${refreshedAccessToken}` };

                        const requestConfig = { ...config, headers, method };

                        const response = method === 'GET' || method === 'DELETE'
                        ? await apiRequest(url, requestConfig)
                        : await apiRequest(url, data, requestConfig);

                        return response;
                    }
                    return null;
                } catch (refreshError) {
                    return null;
                }
            }
            throw error;
        }
    }

    return null;
};

export async function getUserProfileData(username: string) {
    try {
        const response = await protectedApiRequest(API.get, `/user-profile/${username}`, 'GET');
        return { data: response?.data, error: null };
    } catch (err) {
        const error = err as AxiosError;
        const errorMessage = error.response && (error.response.data as any).errorMessage
            ? (error.response.data as any).errorMessage
            :  error.response && (error.response.data as any).errors
            ? (error.response.data as any).errors
            : 'Network error, please try again later.';
        return { data: null, error: errorMessage };
    }
};