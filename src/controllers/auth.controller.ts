import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Usuario } from '../entities/Usuario';
import { asyncHandler } from '../middlewares/common.middleware';
import { generateToken, hashPassword, comparePassword } from '../utils/auth.utils';

const usuarioRepository = AppDataSource.getRepository(Usuario);

// Login de usuario
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;
  console.log(req.body);

  // Validar que se proporcionaron username y contraseña
  if (!username || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }

  // Buscar usuario por email
  const usuario = await usuarioRepository.findOne({ 
    where: { email: username }
  });

  // Verificar si existe el usuario y está activo
  if (!usuario || !usuario.activo) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  // Verificar contraseña
  const passwordMatches = await comparePassword(password, usuario.password);
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  // Crear payload para el token
  const payload = {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    sede_id: usuario.sede_id
  };

  // Generar token
  const token = generateToken(payload);

  res.json({
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      sede_id: usuario.sede_id
    }
  });
});

// Verificar token (para comprobar autenticación)
export const verifyToken = asyncHandler(async (req: Request, res: Response) => {
  // Si llegamos aquí, es porque el middleware auth ya validó el token
  res.json({ 
    usuario: req.usuario,
    message: 'Token válido' 
  });
});
