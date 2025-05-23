import { Router } from 'express';
import { 
  getActiveTurnosBySede, 
  getTurnosBySedeAndDate, 
  createTurno, 
  updateTurnoStatus 
} from '../controllers/turno.controller';
import { auth, checkRole } from '../middlewares/auth.middleware';
import { validateSedeId } from '../middlewares/common.middleware';

const router = Router();

// Rutas públicas (para pantallas)
router.get('/activos/sede/:sedeId', getActiveTurnosBySede);

// Ruta para crear turno (desde kiosco)
router.post('/', createTurno);

// Rutas protegidas
router.get('/sede/:sedeId', getTurnosBySedeAndDate);

// Cambiar estado de un turno (llamar, atender, cancelar, etc.)
router.put('/:id/estado', updateTurnoStatus);

export default router;
