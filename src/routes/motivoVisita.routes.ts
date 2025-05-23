import { Router } from 'express';
import { 
  getMotivosBySede, 
  getMotivoById, 
  createMotivo, 
  updateMotivo, 
  deleteMotivo 
} from '../controllers/motivoVisita.controller';
import { auth, checkRole } from '../middlewares/auth.middleware';
import { validateSedeId } from '../middlewares/common.middleware';

const router = Router();

// Rutas públicas (para que el kiosco de turnos pueda mostrar los motivos)
router.get('/sede/:sedeId', getMotivosBySede);
router.get('/:id', getMotivoById);

// Rutas protegidas
router.post('/', createMotivo);
router.put('/:id', updateMotivo);
router.delete('/:id', deleteMotivo);

export default router;
