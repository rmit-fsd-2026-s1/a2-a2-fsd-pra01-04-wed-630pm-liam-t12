import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './User';
import { Venue } from './Venue';

@Entity('preferred_venues')
@Unique(['hirerId', 'venueId'])
export class PreferredVenue {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  hirerId!: number;

  @Column({ type: 'int' })
  venueId!: number;

  @Column({ type: 'int' })
  rank!: number;

  @ManyToOne(() => User, user => user.preferredVenues)
  @JoinColumn({ name: 'hirerId' })
  hirer!: User;

  @ManyToOne(() => Venue)
  @JoinColumn({ name: 'venueId' })
  venue!: Venue;
}