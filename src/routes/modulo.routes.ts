import { Router } from 'express';
import { 
  getModulosBySede, 
  getModuloById, 
  createModulo, 
  updateModulo, 
  deleteModulo 
} from '../controllers/modulo.controller';
import { auth, checkRole } from '../middlewares/auth.middleware';
import { validateSedeId } from '../middlewares/common.middleware';

const router = Router();

// Rutas públicas
router.get('/sede/:sedeId', getModulosBySede);
router.get('/:id', getModuloById);

// Rutas protegidas
router.post('/', createModulo);
router.put('/:id', updateModulo);
router.delete('/:id', deleteModulo);

export default router;
