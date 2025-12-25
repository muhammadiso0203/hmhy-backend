import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  payme_id: string; 

  @Column({ type: 'bigint' })
  amount: number; 

  @Column({ type: 'integer' })
  state: number; 

  @Column({ nullable: true })
  reason: number; 

  @Column({ type: 'bigint', default: 0 })
  create_time: number;

  @Column({ type: 'bigint', default: 0 })
  perform_time: number; 

  @Column({ type: 'bigint', default: 0 })
  cancel_time: number; 

  @Column()
  lesson_id: number;

  @Column()
  user_id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}