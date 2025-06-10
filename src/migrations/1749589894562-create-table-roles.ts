import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreateTableRoles1749589894562 implements MigrationInterface {
  name = "CreateTableRoles1749589894562";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla de roles
    await queryRunner.createTable(
      new Table({
        name: "roles",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "nombre",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          {
            name: "codigo",
            type: "varchar",
            length: "20",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "descripcion",
            type: "text",
            isNullable: true,
          },
          {
            name: "activo",
            type: "boolean",
            default: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true
    );

    // Insertar datos iniciales de roles (buena práctica incluir datos base en migraciones)
    await queryRunner.query(`
            INSERT INTO roles (id, nombre, codigo, descripcion)
            VALUES 
                (uuid_generate_v4(), 'Administrador', 'admin', 'Control total del sistema'),
                (uuid_generate_v4(), 'Operador', 'operator', 'Atención de turnos'),
                (uuid_generate_v4(), 'Supervisor', 'supervisor', 'Supervisión de operadores');
        `);

    // Agregar columna rol_id a la tabla usuarios
    await queryRunner.query(`ALTER TABLE usuarios ADD COLUMN rol_id uuid`);

    // Mapear los roles existentes a los nuevos IDs
    // Obtener rol admin
    const adminRol = await queryRunner.query(
      `SELECT id FROM roles WHERE codigo = 'admin' LIMIT 1`
    );
    const operatorRol = await queryRunner.query(
      `SELECT id FROM roles WHERE codigo = 'operator' LIMIT 1`
    );
    const supervisorRol = await queryRunner.query(
      `SELECT id FROM roles WHERE codigo = 'supervisor' LIMIT 1`
    );

    // Actualizar usuarios existentes con su correspondiente rol_id
    await queryRunner.query(
      `UPDATE usuarios SET rol_id = '${adminRol[0].id}' WHERE rol = 'admin'`
    );
    await queryRunner.query(
      `UPDATE usuarios SET rol_id = '${operatorRol[0].id}' WHERE rol = 'operator'`
    );
    await queryRunner.query(
      `UPDATE usuarios SET rol_id = '${supervisorRol[0].id}' WHERE rol = 'supervisor'`
    );

    // Agregar restricción NOT NULL a rol_id
    await queryRunner.query(
      `ALTER TABLE usuarios ALTER COLUMN rol_id SET NOT NULL`
    );

    // Crear la llave foránea
    await queryRunner.createForeignKey(
      "usuarios",
      new TableForeignKey({
        columnNames: ["rol_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "roles",
        onDelete: "RESTRICT",
      })
    );

    // Eliminar columna enum rol anterior
    await queryRunner.query(`ALTER TABLE usuarios DROP COLUMN rol`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recrear la columna enum rol
    await queryRunner.query(`
            ALTER TABLE usuarios 
            ADD COLUMN rol ENUM('admin', 'operator', 'supervisor') DEFAULT 'operator'
        `);

    // Recuperar datos de roles para la columna enum
    await queryRunner.query(`
            UPDATE usuarios u SET 
            rol = (SELECT codigo FROM roles r WHERE r.id = u.rol_id)
        `);

    // Eliminar la llave foránea
    const table = await queryRunner.getTable("usuarios");
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("rol_id") !== -1
    );
    if (foreignKey) {
        await queryRunner.dropForeignKey("usuarios", foreignKey);
        
    }

    // Eliminar la columna rol_id
    await queryRunner.query(`ALTER TABLE usuarios DROP COLUMN rol_id`);

    // Eliminar la tabla roles
    await queryRunner.dropTable("roles");
  }
}
