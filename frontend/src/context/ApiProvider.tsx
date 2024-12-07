import React, { createContext, useContext, useState } from 'react';
import { AxiosError } from 'axios';
import { API, protectedApiRequest } from '../utils/api';

interface ApiResponse<T> {
    data: T | null;
    error: string | any | null;
}

interface ApiContextType {
    loading: boolean;
    getRequest: (url: string) => Promise<ApiResponse<any>>;
    postRequest: (url: string, data: any) => Promise<ApiResponse<any>>;
    protectedGetRequest: (url: string) => Promise<ApiResponse<any>>;
    protectedPostRequest: (url: string, data: any) => Promise<ApiResponse<any>>;
    protectedDeleteRequest: (url: string) => Promise<ApiResponse<any>>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
    const [loading, setLoading] = useState<boolean>(false);

    async function getRequest(endpoint: string) {
        setLoading(true);
        try {
            const response = await API.get(endpoint);
            return { data: response.data, error: null };
        } catch (err) {
            const error = err as AxiosError;
            const errorMessage = error.response && (error.response.data as any).errorMessage
                ? (error.response.data as any).errorMessage
                :  error.response && (error.response.data as any).errors
                ? (error.response.data as any).errors
                : 'Network error, please try again later.';
            return { data: null, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    async function postRequest(endpoint: string, data: any) {
        setLoading(true);
        try {
            const response = await API.post(endpoint, data);
            return { data: response.data, error: null };
        } catch (err) {
            const error = err as AxiosError;
            const errorMessage = error.response && (error.response.data as any).errorMessage
                ? (error.response.data as any).errorMessage
                :  error.response && (error.response.data as any).errors
                ? (error.response.data as any).errors
                : 'Network error, please try again later.';
            return { data: null, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    async function protectedGetRequest(endpoint: string) {
        setLoading(true);
        try {
            const response = await protectedApiRequest(API.get, endpoint, 'GET');
            return { data: response?.data, error: null };
        } catch (err) {
            const error = err as AxiosError;
            const errorMessage = error.response && (error.response.data as any).errorMessage
                ? (error.response.data as any).errorMessage
                :  error.response && (error.response.data as any).errors
                ? (error.response.data as any).errors
                : 'Network error, please try again later.';
            return { data: null, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    async function protectedPostRequest(endpoint: string, data: any) {
        setLoading(true);
        try {
            const response = await protectedApiRequest(API.post, endpoint, 'POST', data);
            return { data: response?.data, error: null };
        } catch (err) {
            const error = err as AxiosError;
            const errorMessage = error.response && (error.response.data as any).errorMessage
                ? (error.response.data as any).errorMessage
                :  error.response && (error.response.data as any).errors
                ? (error.response.data as any).errors
                : 'Network error, please try again later.';
            return { data: null, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    async function protectedDeleteRequest(endpoint: string) {
        setLoading(true);
        try {
            const response = await protectedApiRequest(API.delete, endpoint, 'DELETE');
            return { data: response?.data, error: null };
        } catch (err) {
            const error = err as AxiosError;
            const errorMessage = error.response && (error.response.data as any).errorMessage
                ? (error.response.data as any).errorMessage
                :  error.response && (error.response.data as any).errors
                ? (error.response.data as any).errors
                : 'Network error, please try again later.';
            return { data: null, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return (
        <ApiContext.Provider value={{ 
            loading, 
            getRequest, 
            postRequest, 
            protectedGetRequest,
            protectedPostRequest,
            protectedDeleteRequest
        }}>
            {children}
        </ApiContext.Provider>
    );
};

export const useApi = () => {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error('useApi must be used within an ApiProvider');
    }
    return context;
};