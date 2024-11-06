export interface User {
    id: number;
    username: string;
    email: string;
    roles: {
        name: string;
    }[]
}