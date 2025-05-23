import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: any;
    }
  }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  // Obtener el token del header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Acceso no autorizado, token no proporcionado' });
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_default');
    
    // Asignar el usuario al objeto de solicitud
    req.usuario = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Middleware para verificar roles
export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const hasRole = roles.includes(req.usuario.rol);
    if (!hasRole) {
      return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
    }

    next();
  };
};
