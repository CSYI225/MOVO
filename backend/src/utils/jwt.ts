import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'defaut_secret_movo_2026';
const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  id: string;
  email?: string | null;
  telephone?: string | null;
  roles: string[];
}

export async function hacherMotDePasse(motDePasse: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(motDePasse, saltRounds);
}

export async function mepMotDePasseValide(motDePasse: string, hash: string): Promise<boolean> {
  return bcrypt.compare(motDePasse, hash);
}

export function genererToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifierToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
