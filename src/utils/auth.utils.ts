import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Función para generar un JWT
export const generateToken = (payload: string | JwtPayload): string => {
  const secret = process.env.JWT_SECRET || 'secret_key_default';
  const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as SignOptions['expiresIn'] };
  return jwt.sign(payload, secret, options);
};

// Función para hashear una contraseña
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Función para comparar una contraseña con un hash
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
