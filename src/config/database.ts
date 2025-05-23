import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'Hachiko2002',
  database: process.env.DB_DATABASE || 'digiturno',
  synchronize: process.env.NODE_ENV !== 'production', // Solo sincronizar en desarrollo
  logging: process.env.NODE_ENV !== 'production',
    entities: [__dirname + "/../entities/*{.ts,.js}"],
  subscribers: [],
  migrations: [path.join(__dirname, '../migrations/**/*.{js,ts}')],
});
