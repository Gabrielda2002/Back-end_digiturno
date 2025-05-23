import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { MotivoVisita } from '../entities/MotivoVisita';
import { Sede } from '../entities/Sede';
import { asyncHandler } from '../middlewares/common.middleware';

const motivoRepository = AppDataSource.getRepository(MotivoVisita);
const sedeRepository = AppDataSource.getRepository(Sede);

// Obtener todos los motivos de visita de una sede
export const getMotivosBySede = asyncHandler(async (req: Request, res: Response) => {
  const { sedeId } = req.params;

  // Verificar que existe la sede
  const sede = await sedeRepository.findOne({ where: { id: sedeId } });
  if (!sede) {
    return res.status(404).json({ message: 'Sede no encontrada' });
  }

  const motivos = await motivoRepository.find({
    where: { sede_id: sedeId, activo: true },
    order: { nombre: 'ASC' }
  });

  res.json(motivos);
});

// Obtener un motivo de visita por ID
export const getMotivoById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const motivo = await motivoRepository.findOne({
    where: { id },
    relations: ['sede'] // Incluir datos de la sede relacionada
  });

  if (!motivo) {
    return res.status(404).json({ message: 'Motivo de visita no encontrado' });
  }

  res.json(motivo);
});

// Crear un nuevo motivo de visita
export const createMotivo = asyncHandler(async (req: Request, res: Response) => {
  const { sede_id, nombre, prefijo, descripcion } = req.body;

  // Verificar que existe la sede
  const sede = await sedeRepository.findOne({ where: { id: sede_id } });
  if (!sede) {
    return res.status(404).json({ message: 'Sede no encontrada' });
  }

  // Verificar que no exista un motivo con el mismo prefijo en esta sede
  const existingMotivo = await motivoRepository.findOne({
    where: { sede_id, prefijo }
  });
  
  if (existingMotivo) {
    return res.status(400).json({
      message: 'Ya existe un motivo con este prefijo en esta sede'
    });
  }

  const motivo = motivoRepository.create({
    sede_id,
    nombre,
    prefijo: prefijo.toUpperCase(), // Guardar prefijo en mayúsculas
    descripcion,
    activo: true
  });

  await motivoRepository.save(motivo);
  res.status(201).json(motivo);
});

// Actualizar un motivo de visita existente
export const updateMotivo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre, prefijo, descripcion, activo } = req.body;

  let motivo = await motivoRepository.findOne({ where: { id } });
  if (!motivo) {
    return res.status(404).json({ message: 'Motivo de visita no encontrado' });
  }

  // Verificar que no exista otro motivo con el mismo prefijo en esta sede
  if (prefijo && prefijo !== motivo.prefijo) {
    const existingMotivo = await motivoRepository.findOne({
      where: { sede_id: motivo.sede_id, prefijo }
    });
    
    if (existingMotivo) {
      return res.status(400).json({
        message: 'Ya existe un motivo con este prefijo en esta sede'
      });
    }
  }

  // Actualizar campos
  motivo.nombre = nombre || motivo.nombre;
  motivo.prefijo = prefijo ? prefijo.toUpperCase() : motivo.prefijo;
  motivo.descripcion = descripcion !== undefined ? descripcion : motivo.descripcion;
  motivo.activo = activo !== undefined ? activo : motivo.activo;

  await motivoRepository.save(motivo);
  res.json(motivo);
});

// Eliminar un motivo de visita
export const deleteMotivo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const motivo = await motivoRepository.findOne({ where: { id } });
  if (!motivo) {
    return res.status(404).json({ message: 'Motivo de visita no encontrado' });
  }

  await motivoRepository.remove(motivo);
  res.json({ message: 'Motivo de visita eliminado correctamente' });
});
