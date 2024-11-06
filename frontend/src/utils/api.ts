import axios, { AxiosResponse, AxiosError } from 'axios';

const BASE_URL = 'http://localhost:3011/api';
export const API = axios.create({ baseURL: BASE_URL });

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
            const response = await API.get('/auth/get_user_data', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return response.data;
        } catch (error: any) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                try {
                    const refreshedAccessToken = await refreshAccessToken();
                    if (refreshedAccessToken) {
                        localStorage.setItem('accessToken', refreshedAccessToken);

                        const response = await API.get('/auth/get_user_data', {
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