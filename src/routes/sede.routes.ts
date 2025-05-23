import { Router } from 'express';
import { getAllSedes, getSedeById, createSede, updateSede, deleteSede } from '../controllers/sede.controller';
import { auth, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// Rutas públicas
router.get('/', getAllSedes);
router.get('/:id', getSedeById);

// Rutas protegidas (solo admins pueden crear/modificar/eliminar sedes)
router.post('/', createSede);
router.put('/:id', updateSede);
router.delete('/:id', deleteSede);

export default router;
