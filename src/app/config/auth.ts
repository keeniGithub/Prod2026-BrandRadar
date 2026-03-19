import { AUTH_CONFIG } from "./constants"

export const USERNAME_REGEX = AUTH_CONFIG.USERNAME_REGEX

export type FormValues = {
    username: string
    password: string
}

export type FormErrors = {
    username?: string
    password?: string
}

export type AuthLogin = {
    username: string;
    password: string;
}

export type AuthUser = {
    id: string;
    email: string;
    username: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type AuthSuccessResponse = {
    user: AuthUser;
    access_token: string;
    token_type: string;
};

export type AuthValidationError = {
    detail: {
        loc: (string | number)[];
        msg: string;
        type: string;
        input: string;
        ctx?: Record<string, unknown>;
    }[];
};

export type AuthResponse = AuthSuccessResponse | AuthValidationError;
