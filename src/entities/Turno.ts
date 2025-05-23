import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, BaseEntity } from 'typeorm';
import { Sede } from './Sede';
import { MotivoVisita } from './MotivoVisita';
import { Modulo } from './Modulo';

export type TurnoEstado = 'esperando' | 'llamando' | 'atendido' | 'cancelado' | 'derivado';

@Entity('turnos')
export class Turno  {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  sede_id: string;

  @ManyToOne(() => Sede, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sede_id' })
  sede: Sede;

  @Column({ type: 'varchar', length: 20 })
  numero_turno: string; // Combinación del prefijo y número secuencial (ej. CM001)

  @Column({ type: 'varchar', length: 20 })
  cedula: string;

  @Column({ type: 'uuid' })
  motivo_id: string;

  @ManyToOne(() => MotivoVisita)
  @JoinColumn({ name: 'motivo_id' })
  motivo: MotivoVisita;

  @Column({ type: 'uuid', nullable: true })
  modulo_id: string;

  @ManyToOne(() => Modulo, { nullable: true })
  @JoinColumn({ name: 'modulo_id' })
  modulo: Modulo;

  @Column({
    type: 'enum',
    enum: ['esperando', 'llamando', 'atendido', 'cancelado', 'derivado'],
    default: 'esperando'
  })
  estado: TurnoEstado;

  @CreateDateColumn()
  fecha_creacion: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_llamado: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_atencion: Date;
}
