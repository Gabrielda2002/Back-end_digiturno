import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AlterTableModulosAddOperadorId1748277266230 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('modulos', new TableColumn({
            name: 'operador_id',
            type: 'uuid',
            isNullable: false,
        }));

        await queryRunner.createForeignKey('modulos', new TableForeignKey({
            columnNames: ['operador_id'],
            referencedTableName: 'usuarios',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('modulos');
        const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf('operador_id') !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey('modulos', foreignKey);
        }
        await queryRunner.dropColumn('modulos', 'operador_id');
    }
}
