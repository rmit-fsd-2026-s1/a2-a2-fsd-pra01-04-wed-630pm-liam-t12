import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Venue } from './Venue';
import { Booking } from './Booking';
import { HireRecord } from './HireRecord';
import { PreferredVenue } from './PreferredVenue';
import { ComplianceDocument } from './ComplianceDocument';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'nvarchar', length: 100 })
  name!: string;

  @Column({ type: 'nvarchar', length: 150, unique: true })
  email!: string;

  @Column({ type: 'nvarchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'nvarchar', length: 10 })
  role!: 'hirer' | 'vendor' | 'admin';

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  phone!: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  avatarUrl!: string;

  @CreateDateColumn()
  joinedAt!: Date;

  @OneToMany(() => Venue, venue => venue.vendor)
  venues!: Venue[];

  @OneToMany(() => Booking, booking => booking.hirer)
  bookings!: Booking[];

  @OneToMany(() => HireRecord, hr => hr.hirer)
  hireRecords!: HireRecord[];

  @OneToMany(() => PreferredVenue, pv => pv.hirer)
  preferredVenues!: PreferredVenue[];

  @OneToMany(() => ComplianceDocument, doc => doc.hirer)
  complianceDocuments!: ComplianceDocument[];
}