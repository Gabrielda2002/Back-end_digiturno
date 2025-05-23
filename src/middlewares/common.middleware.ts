import { Request, Response, NextFunction } from 'express';

// Middleware para manejar errores asíncronos en controladores
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next))
    .catch(next);
};

// Middleware para validar el ID de sede en las rutas que lo requieren
export const validateSedeId = (req: Request, res: Response, next: NextFunction) => {
  const sedeId = req.params.sedeId || req.body.sede_id;

  if (!sedeId) {
    return res.status(400).json({ message: 'Se requiere un ID de sede válido' });
  }

  // Aquí puedes agregar validación adicional si es necesario
  
  next();
};
