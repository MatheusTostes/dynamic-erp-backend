export interface UserCredentials {
  username?: string;
  email: string;
  password: string;
}

export interface UserResponse {
  success: boolean;
  data: {
    _id: string;
    username: string;
    email: string;
    role: string;
    token: string;
  };
}

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    [key: string]: any;
  };
}
