
export interface User{
    id: number;
    name: string;
    email:string;
    role: "admin" | "customer";
    isLocked: boolean;
}

export interface AuthResponse{
    message: string;
    user: User;
}
