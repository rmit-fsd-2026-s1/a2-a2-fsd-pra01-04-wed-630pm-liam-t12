import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Venue } from './Venue';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  hirerId!: number;

  @Column({ type: 'int' })
  venueId!: number;

  @Column({ type: 'nvarchar', length: 200 })
  eventName!: string;

  @Column({ type: 'int' })
  guestCount!: number;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'nvarchar', length: 10 })
  time!: string;

  @Column({ type: 'int' })
  duration!: number;

  @Column({ type: 'nvarchar', length: 10, default: 'pending' })
  status!: 'pending' | 'accepted' | 'rejected';

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  vendorComment!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, user => user.bookings, { eager: true })
  @JoinColumn({ name: 'hirerId' })
  hirer!: User;

  @ManyToOne(() => Venue, venue => venue.bookings, { eager: true })
  @JoinColumn({ name: 'venueId' })
  venue!: Venue;
}