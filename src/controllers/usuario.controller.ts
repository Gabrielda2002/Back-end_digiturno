import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Usuario, RolUsuario } from '../entities/Usuario';
import { Sede } from '../entities/Sede';
import { asyncHandler } from '../middlewares/common.middleware';
import { hashPassword, comparePassword } from '../utils/auth.utils';

const usuarioRepository = AppDataSource.getRepository(Usuario);
const sedeRepository = AppDataSource.getRepository(Sede);

// Obtener todos los usuarios
export const getAllUsuarios = asyncHandler(async (req: Request, res: Response) => {  
    const usuarios = await usuarioRepository.find({
      relations: ['sede'],
      order: { nombre: 'ASC' }
    });

    const dataFormatted = usuarios.map(u => ({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      sede_id: u.sede_id,
      sede_nombre: u.sede ? u.sede.nombre : null,
      activo: u.activo
    }))
  
  return res.json(dataFormatted);
});

// Obtener un usuario por ID
export const getUsuarioById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const usuario = await usuarioRepository.findOne({
    where: { id },
    relations: ['sede']
  });

  if (!usuario) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  // Verificar permisos (solo admin global o usuarios de la misma sede)
  const isAdmin = req.usuario.rol === 'admin';
  const isSameSedeOrGlobal = (req.usuario.sede_id === usuario.sede_id) || !req.usuario.sede_id;
  
  if (!isAdmin && !isSameSedeOrGlobal) {
    return res.status(403).json({ message: 'No tienes permiso para ver este usuario' });
  }

  res.json(usuario);
});

// Crear un nuevo usuario
export const createUsuario = asyncHandler(async (req: Request, res: Response) => {
  const { nombre, email, password, rol, sede_id } = req.body;

  // Verificar email único
  const existingUsuario = await usuarioRepository.findOne({ where: { email } });
  if (existingUsuario) {
    return res.status(400).json({ message: 'El email ya está registrado' });
  }

  // Verificar sede si se proporciona
  if (sede_id) {
    const sede = await sedeRepository.findOne({ where: { id: sede_id } });
    if (!sede) {
      return res.status(404).json({ message: 'Sede no encontrada' });
    }
  }

  // Verificar permisos para crear roles específicos
  const isAdmin = req.usuario?.rol === 'admin';
  if (!isAdmin && rol === 'admin') {
    return res.status(403).json({ message: 'No tienes permisos para crear administradores' });
  }

  // Hashear contraseña
  const hashedPassword = await hashPassword(password);

  const usuario = usuarioRepository.create({
    nombre,
    email,
    password: hashedPassword,
    rol: rol as RolUsuario || 'operador',
    sede_id: sede_id || null,
    activo: true
  });

  await usuarioRepository.save(usuario);

  // No devolver el hash de la contraseña
  const { password: _, ...usuarioSinPassword } = usuario;
  
  res.status(201).json(usuarioSinPassword);
});

// Actualizar un usuario existente
export const updateUsuario = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre, email, rol, sede_id, activo } = req.body;

  let usuario = await usuarioRepository.findOne({ where: { id } });
  if (!usuario) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  // Verificar permisos (solo admin global o supervisores de la misma sede)
  const isAdmin = req.usuario.rol === 'admin';
  const isSupervisor = req.usuario.rol === 'supervisor';
  const isSameSede = req.usuario.sede_id === usuario.sede_id;
  
  if (!isAdmin && (!isSupervisor || !isSameSede)) {
    return res.status(403).json({ message: 'No tienes permiso para modificar este usuario' });
  }

  // Solo admin puede cambiar roles
  if (rol !== usuario.rol && !isAdmin) {
    return res.status(403).json({ message: 'No tienes permisos para cambiar el rol' });
  }

  // Verificar email único si se está cambiando
  if (email && email !== usuario.email) {
    const existingUsuario = await usuarioRepository.findOne({ where: { email } });
    if (existingUsuario) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }
  }

  // Verificar sede si se cambia
  if (sede_id && sede_id !== usuario.sede_id) {
    const sede = await sedeRepository.findOne({ where: { id: sede_id } });
    if (!sede) {
      return res.status(404).json({ message: 'Sede no encontrada' });
    }
  }

  // Actualizar campos
  usuario.nombre = nombre || usuario.nombre;
  usuario.email = email || usuario.email;
  if (isAdmin) {
    usuario.rol = rol as RolUsuario || usuario.rol;
    usuario.sede_id = sede_id !== undefined ? sede_id : usuario.sede_id;
  }
  usuario.activo = activo !== undefined ? activo : usuario.activo;

  await usuarioRepository.save(usuario);

  // No devolver el hash de la contraseña
  const { password: _, ...usuarioSinPassword } = usuario;
  
  res.json(usuarioSinPassword);
});

// Cambiar contraseña de usuario
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { password, newPassword } = req.body;

  const usuario = await usuarioRepository.findOne({ where: { id } });
  if (!usuario) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  // Solo el propio usuario o un admin puede cambiar la contraseña
  const isOwnUser = req.usuario.id === id;
  const isAdmin = req.usuario.rol === 'admin';
  
  if (!isOwnUser && !isAdmin) {
    return res.status(403).json({ message: 'No tienes permiso para cambiar esta contraseña' });
  }

  // Admin puede cambiar contraseña sin validar la anterior
  if (!isAdmin) {
    // Verificar contraseña actual
    const passwordMatches = await comparePassword(password, usuario.password);
    if (!passwordMatches) {
      return res.status(400).json({ message: 'Contraseña actual incorrecta' });
    }
  }

  // Hashear nueva contraseña
  const hashedPassword = await hashPassword(newPassword);
  usuario.password = hashedPassword;

  await usuarioRepository.save(usuario);
  
  res.json({ message: 'Contraseña actualizada correctamente' });
});
