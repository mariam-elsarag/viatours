import { Agent } from 'src/users/entities/agent.entity';
import { Location } from 'src/location/entities/location.entity';
import { AccountStatus, userRole } from 'src/utils/enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 80 })
  fullName: string;

  @Index()
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'enum', enum: userRole, default: userRole.User })
  role: userRole;

  @Column({ type: 'varchar', nullable: true, default: null })
  avatar: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, default: null })
  address: string | null;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.Pending,
  })
  status: AccountStatus;

  @Column({ type: 'boolean', default: false })
  isPasswordReset: boolean;

  @Column({ type: 'varchar', length: 60, nullable: true })
  password: string | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  passwordChangedAt: Date | null;

  @Column({ type: 'varchar', length: 60, default: null })
  otp: string | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  otpExpiredAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => Agent, (agent) => agent.user, { cascade: true })
  agent: Agent;

  @OneToOne(() => Location)
  @JoinColumn()
  location: Location;
}
