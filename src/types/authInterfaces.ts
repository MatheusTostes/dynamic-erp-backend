export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends AuthCredentials {
  name: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
    };
    token: string;
  };
  message?: string;
}

export interface AuthError {
  success: boolean;
  message: string;
  errors?: string[];
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    [key: string]: any;
  };
}
