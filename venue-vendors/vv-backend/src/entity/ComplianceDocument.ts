import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('compliance_documents')
export class ComplianceDocument {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  hirerId!: number;

  @Column({ type: 'nvarchar', length: 50 })
  docType!: string;

  @Column({ type: 'nvarchar', length: 255 })
  fileName!: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  fileUrl!: string;

  @CreateDateColumn()
  uploadedAt!: Date;

  @ManyToOne(() => User, user => user.complianceDocuments)
  @JoinColumn({ name: 'hirerId' })
  hirer!: User;
}