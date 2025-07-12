import { CURENT_TIMESTAMP } from 'src/utils/constant';
import { userRole } from 'src/utils/enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 80 })
  fullName: string;

  @Column({ type: 'varchar', length: 80, unique: true })
  email: string;

  @Column({ type: 'enum', enum: userRole, default: userRole.User })
  role: userRole;

  @Column({ type: 'varchar', nullable: true, default: null })
  avatar: string | null;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isForgetPassword: boolean;

  @Column({ type: 'varchar', length: 60, nullable: true })
  password: string | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  passwordChangedAt: Date | null;

  @Column({ type: 'varchar', length: 60, default: null })
  otp: string | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  otpExpiredAt: Date | null;

  @Column({ type: 'timestamp', default: () => CURENT_TIMESTAMP })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => CURENT_TIMESTAMP,
    onUpdate: CURENT_TIMESTAMP,
  })
  updatedAt: Date;
}
