import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Modulo } from '../entities/Modulo';
import { Sede } from '../entities/Sede';
import { asyncHandler } from '../middlewares/common.middleware';

const moduloRepository = AppDataSource.getRepository(Modulo);
const sedeRepository = AppDataSource.getRepository(Sede);


export const getAllModulos = asyncHandler(async (req: Request, res: Response) => {
  const modulos = await moduloRepository.find();
  res.json(modulos);
})

// Obtener todos los módulos de una sede
export const getModulosBySede = asyncHandler(async (req: Request, res: Response) => {
  const { sedeId } = req.params;

  // Verificar que existe la sede
  const sede = await sedeRepository.findOne({ where: { id: sedeId } });
  if (!sede) {
    return res.status(404).json({ message: 'Sede no encontrada' });
  }

  const modulos = await moduloRepository.find({
    where: { sede_id: sedeId },
    order: { numero: 'ASC' }
  });

  res.json(modulos);
});

// Obtener un módulo por ID
export const getModuloById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const modulo = await moduloRepository.findOne({
    where: { id },
    relations: ['sede'] // Incluir datos de la sede relacionada
  });

  if (!modulo) {
    return res.status(404).json({ message: 'Módulo no encontrado' });
  }

  res.json(modulo);
});

// Crear un nuevo módulo
export const createModulo = asyncHandler(async (req: Request, res: Response) => {
  const { sede_id, nombre, numero, operador_id  } = req.body;
  console.log(req.body)

  // Verificar que existe la sede
  const sede = await sedeRepository.findOne({ where: { id: sede_id } });

  if (!sede) {
    return res.status(404).json({ message: 'Sede no encontrada' });
  }

  // Verificar que no exista un módulo con el mismo número en esta sede
  const existingModulo = await moduloRepository.findOne({
    where: { sede_id, numero }
  });
  
  if (existingModulo) {
    return res.status(400).json({
      message: 'Ya existe un módulo con este número en esta sede'
    });
  }

  const modulo = moduloRepository.create({
    sede_id,
    nombre,
    numero,
    activo: true,
    operador_id: operador_id
  });

  await moduloRepository.save(modulo);
  res.status(201).json(modulo);
});

// Actualizar un módulo existente
export const updateModulo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre, numero, activo, sede_id, operador_id } = req.body;

  let modulo = await moduloRepository.findOne({ where: { id } });
  if (!modulo) {
    return res.status(404).json({ message: 'Módulo no encontrado' });
  }

  // Verificar que no exista otro módulo con el mismo número en esta sede
  if (numero && numero !== modulo.numero) {
    const existingModulo = await moduloRepository.findOne({
      where: { sede_id: modulo.sede_id, numero }
    });
    
    if (existingModulo) {
      return res.status(400).json({
        message: 'Ya existe un módulo con este número en esta sede'
      });
    }
  }

  // Actualizar campos
  modulo.nombre = nombre || modulo.nombre;
  modulo.numero = numero !== undefined ? numero : modulo.numero;
  modulo.activo = activo !== undefined ? activo : modulo.activo;
  modulo.sede_id = sede_id || modulo.sede_id;
  modulo.operador_id = operador_id || modulo.operador_id;

  await moduloRepository.save(modulo);
  res.json(modulo);
});

// Eliminar un módulo
export const deleteModulo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const modulo = await moduloRepository.findOne({ where: { id } });
  if (!modulo) {
    return res.status(404).json({ message: 'Módulo no encontrado' });
  }

  await moduloRepository.remove(modulo);
  res.json({ message: 'Módulo eliminado correctamente' });
});
