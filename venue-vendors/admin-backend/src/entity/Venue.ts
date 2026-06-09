import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User';

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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'vendorId' })
  vendor!: User;
}