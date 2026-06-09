import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('vendor_notes')
export class VendorNote {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  vendorId!: number;

  @Column({ type: 'int' })
  hirerId!: number;

  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  note!: string;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'vendorId' })
  vendor!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'hirerId' })
  hirer!: User;
}