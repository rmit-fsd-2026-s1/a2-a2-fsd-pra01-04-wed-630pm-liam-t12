import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Venue } from './Venue';

@Entity('blocked_periods')
export class BlockedPeriod {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  venueId!: number;

  @Column({ type: 'date' })
  fromDate!: string;

  @Column({ type: 'date' })
  toDate!: string;

  @ManyToOne(() => Venue, venue => venue.blockedPeriods, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venueId' })
  venue!: Venue;
}