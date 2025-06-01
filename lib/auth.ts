import { verify } from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'parent' | 'admin';
  phone?: string;
}

export async function verifyAuth(token?: string): Promise<AuthUser | null> {
  if (!token) return null;

  try {
    const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}