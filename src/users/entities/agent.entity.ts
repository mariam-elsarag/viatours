import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { AgentStatus } from 'src/utils/enum';

@Entity({ name: 'agents' })
export class Agent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 80, nullable: true })
  companyName: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'varchar', nullable: true })
  suspensionReason: string | null;

  @Column({ type: 'varchar', length: 20 })
  licenseNumber: string;

  @Column({ type: 'boolean', default: false })
  isTrusted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  trustedAt: Date;

  @Column({ type: 'enum', enum: AgentStatus, default: AgentStatus.PENDING })
  status: AgentStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.agent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approvedByAdminId' })
  approvedByAdmin: User;

  @Column()
  userId: number;

  @Column({ type: 'int', nullable: true })
  approvedByAdminId: number;
}
