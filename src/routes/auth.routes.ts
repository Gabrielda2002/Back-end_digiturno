import { Router } from 'express';
import { login, verifyToken } from '../controllers/auth.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.get('/verify', verifyToken);

export default router;
