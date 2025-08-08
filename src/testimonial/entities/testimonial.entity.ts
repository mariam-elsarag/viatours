import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'testimonials' })
export class Testimonial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 80 })
  fullName: string;

  @Column({ type: 'text' })
  testimonial: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  avatar: string | null;

  @Column({ type: 'int' })
  rate: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
