import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'nvarchar', length: 100 })
  name!: string;

  @Column({ type: 'nvarchar', length: 150 })
  email!: string;

  @Column({ type: 'nvarchar', length: 10 })
  role!: string;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  phone!: string;

  @CreateDateColumn()
  joinedAt!: Date;
}