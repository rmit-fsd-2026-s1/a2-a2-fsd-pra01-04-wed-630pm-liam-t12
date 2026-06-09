import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { BlockedPeriod } from './BlockedPeriod';
import { Booking } from './Booking';
import { HireRecord } from './HireRecord';

@Entity('venues')
export class Venue {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'nvarchar', length: 150 })
  name!: string;

  @Column({ type: 'nvarchar', length: 150 })
  location!: string;

  @Column({ type: 'int' })
  capacity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerHour!: number;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  image!: string;

  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  description!: string;

  @Column({ type: 'nvarchar', length: 300, nullable: true })
  suitability!: string;

  @Column({ type: 'int' })
  vendorId!: number;

  @Column({ type: 'bit', default: false })
  isFeatured!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, user => user.venues)
  @JoinColumn({ name: 'vendorId' })
  vendor!: User;

  @OneToMany(() => BlockedPeriod, bp => bp.venue, { cascade: true, eager: true })
  blockedPeriods!: BlockedPeriod[];

  @OneToMany(() => Booking, booking => booking.venue)
  bookings!: Booking[];

  @OneToMany(() => HireRecord, hr => hr.venue)
  hireRecords!: HireRecord[];
}