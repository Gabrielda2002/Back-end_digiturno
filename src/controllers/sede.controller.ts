import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Sede } from '../entities/Sede';
import { asyncHandler } from '../middlewares/common.middleware';

const sedeRepository = AppDataSource.getRepository(Sede);

// Obtener todas las sedes
export const getAllSedes = asyncHandler(async (req: Request, res: Response) => {
  const sedes = await sedeRepository.find({
    order: {
      nombre: 'ASC'
    }
  });
  res.json(sedes);
});

// Obtener una sede por ID
export const getSedeById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const sede = await sedeRepository.findOne({ where: { id } });

  if (!sede) {
    return res.status(404).json({ message: 'Sede no encontrada' });
  }

  res.json(sede);
});

// Crear una nueva sede
export const createSede = asyncHandler(async (req: Request, res: Response) => {
  const { nombre, codigo, direccion, telefono } = req.body;

  // Verificar que no exista una sede con el mismo código
  const existingSede = await sedeRepository.findOne({ where: { codigo } });
  if (existingSede) {
    return res.status(400).json({ message: 'Ya existe una sede con este código' });
  }

  const sede = sedeRepository.create({
    nombre,
    codigo: codigo.toUpperCase(), // Guardar código en mayúsculas
    direccion,
    telefono,
    activa: true
  });

  await sedeRepository.save(sede);
  res.status(201).json(sede);
});

// Actualizar una sede existente
export const updateSede = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre, codigo, direccion, telefono, activa } = req.body;

  let sede = await sedeRepository.findOne({ where: { id } });
  if (!sede) {
    return res.status(404).json({ message: 'Sede no encontrada' });
  }

  // Verificar que no exista otra sede con el mismo código
  if (codigo && codigo !== sede.codigo) {
    const existingSede = await sedeRepository.findOne({ where: { codigo } });
    if (existingSede) {
      return res.status(400).json({ message: 'Ya existe una sede con este código' });
    }
  }

  // Actualizar campos
  sede.nombre = nombre || sede.nombre;
  sede.codigo = codigo ? codigo.toUpperCase() : sede.codigo;
  sede.direccion = direccion || sede.direccion;
  sede.telefono = telefono || sede.telefono;
  sede.activa = activa !== undefined ? activa : sede.activa;

  await sedeRepository.save(sede);
  res.json(sede);
});

// Eliminar una sede
export const deleteSede = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const sede = await sedeRepository.findOne({ where: { id } });
  if (!sede) {
    return res.status(404).json({ message: 'Sede no encontrada' });
  }

  await sedeRepository.remove(sede);
  res.json({ message: 'Sede eliminada correctamente' });
});
