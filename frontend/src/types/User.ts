export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'admin' | 'driver' | 'viewer';
    status: 'active' | 'inactive' | 'suspended';
    createdAt: string;
    lastLogin: string;
}