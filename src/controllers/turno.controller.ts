import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Between } from 'typeorm';
import { Turno, TurnoEstado } from '../entities/Turno';
import { MotivoVisita } from '../entities/MotivoVisita';
import { Sede } from '../entities/Sede';
import { Modulo } from '../entities/Modulo';
import { asyncHandler } from '../middlewares/common.middleware';
import { generateTurnoNumber, calculateWaitTime } from '../utils/turno.utils';

const turnoRepository = AppDataSource.getRepository(Turno);
const motivoRepository = AppDataSource.getRepository(MotivoVisita);
const sedeRepository = AppDataSource.getRepository(Sede);
const moduloRepository = AppDataSource.getRepository(Modulo);

// Obtener todos los turnos activos de una sede (los que aún no han sido atendidos)
export const getActiveTurnosBySede = asyncHandler(async (req: Request, res: Response) => {
  const { sedeId } = req.params;

  // Verificar que existe la sede
  const sede = await sedeRepository.findOne({ where: { id: sedeId } });
  if (!sede) {
    return res.status(404).json({ message: 'Sede no encontrada' });
  }

  // Obtener turnos en estado 'esperando' o 'llamando'
  const turnos = await turnoRepository.find({
    where: [
      { sede_id: sedeId, estado: 'esperando' },
      { sede_id: sedeId, estado: 'llamando' }
    ],
    relations: ['motivo', 'modulo'],
    order: { fecha_creacion: 'ASC' } // Ordenar por fecha de creación (el más antiguo primero)
  });

  // Agregar tiempo de espera a cada turno
  const turnosConTiempo = turnos.map(turno => ({
    ...turno,
    tiempoEspera: calculateWaitTime(turno.fecha_creacion)
  }));

  res.json(turnosConTiempo);
});

// Obtener todos los turnos de una sede por fecha
export const getTurnosBySedeAndDate = asyncHandler(async (req: Request, res: Response) => {
  const { sedeId } = req.params;
  const { fecha } = req.query;

  // Verificar que existe la sede
  const sede = await sedeRepository.findOne({ where: { id: sedeId } });
  if (!sede) {
    return res.status(404).json({ message: 'Sede no encontrada' });
  }

  // Preparar fechas para filtrar
  const fechaInicio = fecha ? new Date(fecha as string) : new Date();
  fechaInicio.setHours(0, 0, 0, 0);
  
  const fechaFin = new Date(fechaInicio);
  fechaFin.setHours(23, 59, 59, 999);

  // Buscar turnos
  const turnos = await turnoRepository.find({
    where: {
      sede_id: sedeId,
      fecha_creacion: Between(fechaInicio, fechaFin)
    },
    relations: ['motivo', 'modulo'],
    order: { fecha_creacion: 'ASC' }
  });

  res.json(turnos);
});

// Crear un nuevo turno
export const createTurno = asyncHandler(async (req: Request, res: Response) => {
  const { sede_id, motivo_id, cedula } = req.body;

  // Verificaciones
  const sede = await sedeRepository.findOne({ where: { id: sede_id } });
  if (!sede) {
    return res.status(404).json({ message: 'Sede no encontrada' });
  }

  const motivo = await motivoRepository.findOne({ where: { id: motivo_id } });
  if (!motivo) {
    return res.status(404).json({ message: 'Motivo de visita no encontrado' });
  }

  // Obtener el último turno con este prefijo para generar el siguiente
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Encontrar el último turno para este motivo en el día actual
  const lastTurno = await turnoRepository
    .createQueryBuilder('turno')
    .where('turno.sede_id = :sedeId', { sedeId: sede_id })
    .andWhere('turno.motivo_id = :motivoId', { motivoId: motivo_id })
    .andWhere('turno.fecha_creacion >= :today', { today })
    .orderBy('turno.numero_turno', 'DESC')
    .getOne();

  // Generar número de turno
  let lastNumber = 0;
  if (lastTurno) {
    // Extraer el número del último turno (asumiendo formato "PREFIJO000")
    const numericPart = lastTurno.numero_turno.slice(motivo.prefijo.length);
    lastNumber = parseInt(numericPart, 10);
  }
  
  const numeroTurno = generateTurnoNumber(motivo.prefijo, lastNumber);

  // Crear el nuevo turno
  const turno = turnoRepository.create({
    sede_id,
    motivo_id,
    cedula,
    numero_turno: numeroTurno,
    estado: 'esperando'
  });

  await turnoRepository.save(turno);

  // Notificar por Socket.io la creación de un nuevo turno
  const io = req.app.get('io');
  io.to(`sede:${sede_id}`).emit('nuevo-turno', {
    id: turno.id,
    numero_turno: turno.numero_turno,
    motivo: motivo.nombre
  });

  res.status(201).json(turno);
});

// Cambiar el estado de un turno
export const updateTurnoStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { estado, modulo_id } = req.body;

  const turno = await turnoRepository.findOne({ 
    where: { id },
    relations: ['motivo', 'modulo', 'sede']
  });
  
  if (!turno) {
    return res.status(404).json({ message: 'Turno no encontrado' });
  }

  // Verificar estado válido
  if (!['esperando', 'llamando', 'atendido', 'cancelado', 'derivado'].includes(estado)) {
    return res.status(400).json({ message: 'Estado no válido' });
  }

  // Verificar módulo si se va a llamar o asignar un turno
  if (['llamando', 'derivado'].includes(estado) && !modulo_id) {
    return res.status(400).json({ message: 'Se requiere un módulo para este estado' });
  }

  if (modulo_id) {
    const modulo = await moduloRepository.findOne({ where: { id: modulo_id } });
    if (!modulo) {
      return res.status(404).json({ message: 'Módulo no encontrado' });
    }
    
    // Asignar el módulo
    turno.modulo_id = modulo_id;
  }

  // Actualizar fechas según el estado
  if (estado === 'llamando' && turno.estado !== 'llamando') {
    turno.fecha_llamado = new Date();
  } 
  
  if (estado === 'atendido' && turno.estado !== 'atendido') {
    turno.fecha_atencion = new Date();
  }

  // Actualizar estado
  turno.estado = estado as TurnoEstado;

  await turnoRepository.save(turno);

  // Notificar por Socket.io el cambio de estado
  const io = req.app.get('io');
  io.to(`sede:${turno.sede_id}`).emit('turno-actualizado', {
    id: turno.id,
    numero_turno: turno.numero_turno,
    modulo: turno.modulo?.nombre || '',
    modulo_numero: turno.modulo?.numero || 0,
    estado: turno.estado
  });

  res.json(turno);
});
