import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity({ name: 'agents' })
export class Agent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 80 })
  companyName: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  companyLogo: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'varchar', nullable: true })
  suspensionReason: string | null;

  @Column({ type: 'varchar', length: 20 })
  licenseNumber: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.agent)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;
}
