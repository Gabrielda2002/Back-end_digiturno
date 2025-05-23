import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { AppDataSource } from './config/database';

// Routes import
import sedeRoutes from './routes/sede.routes';
import motivoVisitaRoutes from './routes/motivoVisita.routes';
import moduloRoutes from './routes/modulo.routes';
import turnoRoutes from './routes/turno.routes';
import usuarioRoutes from './routes/usuario.routes';
import authRoutes from './routes/auth.routes';

// Config env variables
dotenv.config();
const PORT = process.env.PORT || 4000;

// Initialize express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // En producción, esto debe ser más restrictivo
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('API Digiturno funcionando correctamente');
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Unirse a una sala específica para la sede
  socket.on('join-sede', (sedeId) => {
    socket.join(`sede:${sedeId}`);
    console.log(`Cliente ${socket.id} se unió a la sede ${sedeId}`);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Make io available globally
app.set('io', io);

// Database connection and server start
AppDataSource.initialize()
  .then(() => {
    console.log('Conexión a la base de datos establecida');
    
    // Inicializar rutas después de conectar a la base de datos
    app.use('/api/sedes', sedeRoutes);
    app.use('/api/motivos-visita', motivoVisitaRoutes);
    app.use('/api/modulos', moduloRoutes);
    app.use('/api/turnos', turnoRoutes);
    app.use('/api/usuarios', usuarioRoutes);
    app.use('/api/auth', authRoutes);
    
    httpServer.listen(PORT, () => {
      console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error al conectar con la base de datos:', error);
  });
