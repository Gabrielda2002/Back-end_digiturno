import { Router } from 'express';
import { 
  getAllUsuarios, 
  getUsuarioById, 
  createUsuario, 
  updateUsuario, 
  changePassword 
} from '../controllers/usuario.controller';
import { auth, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas de usuarios requieren autenticación

// Rutas para administradores y supervisores
router.get('/', getAllUsuarios);
router.post('/', createUsuario);

// Rutas para obtener y actualizar usuarios específicos
router.get('/:id', getUsuarioById);
router.put('/:id', updateUsuario);

// Cambio de contraseña (puede hacerlo el propio usuario o un admin)
router.put('/:id/password', changePassword);

export default router;
