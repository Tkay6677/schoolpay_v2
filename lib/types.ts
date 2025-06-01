export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: 'parent' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: Omit<User, 'password'>;
} 