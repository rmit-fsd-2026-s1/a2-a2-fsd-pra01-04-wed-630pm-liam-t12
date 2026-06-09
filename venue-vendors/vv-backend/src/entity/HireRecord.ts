import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Venue } from './Venue';

@Entity('hire_records')
export class HireRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  hirerId!: number;

  @Column({ type: 'int' })
  venueId!: number;

  @Column({ type: 'nvarchar', length: 200 })
  eventName!: string;

  @Column({ type: 'date' })
  dateOfHire!: string;

  @Column({ type: 'int', nullable: true })
  rating!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, user => user.hireRecords)
  @JoinColumn({ name: 'hirerId' })
  hirer!: User;

  @ManyToOne(() => Venue, venue => venue.hireRecords)
  @JoinColumn({ name: 'venueId' })
  venue!: Venue;
}