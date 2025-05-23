import { AppDataSource } from '../config/database';
import { Sede } from '../entities/Sede';
import { Usuario } from '../entities/Usuario';
import { hashPassword } from '../utils/auth.utils';

// Función para inicializar la base de datos con datos básicos
async function seedDatabase() {
  try {
    // Inicializar la conexión a la base de datos
    await AppDataSource.initialize();
    console.log('Conexión a la base de datos establecida');

    // Crear sede principal si no existe
    let sede = await AppDataSource.getRepository(Sede).findOne({
      where: { codigo: 'PRINCIPAL' }
    });

    if (!sede) {
      sede = AppDataSource.getRepository(Sede).create({
        nombre: 'Sede Principal',
        codigo: 'PRINCIPAL',
        direccion: 'Dirección de la sede principal',
        telefono: '123456789',
        activa: true
      });

      await AppDataSource.getRepository(Sede).save(sede);
      console.log('Sede principal creada');
    } else {
      console.log('La sede principal ya existe');
    }

    // Crear usuario administrador si no existe
    const adminEmail = 'admin@example.com';
    let admin = await AppDataSource.getRepository(Usuario).findOne({
      where: { email: adminEmail }
    });

    if (!admin) {
      // Crear hash de la contraseña
      const hashedPassword = await hashPassword('admin123');

      admin = AppDataSource.getRepository(Usuario).create({
        nombre: 'Administrador',
        email: adminEmail,
        password: hashedPassword,
        rol: 'admin',
        activo: true
      });

      await AppDataSource.getRepository(Usuario).save(admin);
      console.log('Usuario administrador creado');
    } else {
      console.log('El usuario administrador ya existe');
    }

    console.log('Inicialización de la base de datos completada');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  } finally {
    // Cerrar la conexión
    await AppDataSource.destroy();
  }
}

// Ejecutar la función
seedDatabase();
