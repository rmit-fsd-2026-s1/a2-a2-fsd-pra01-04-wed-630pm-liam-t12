import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import { Venue } from '../entity/Venue';
import { BlockedPeriod } from '../entity/BlockedPeriod';
import { Booking } from '../entity/Booking';
import { HireRecord } from '../entity/HireRecord';
import { PreferredVenue } from '../entity/PreferredVenue';
import { ComplianceDocument } from '../entity/ComplianceDocument';
import { VendorNote } from '../entity/VendorNote';
import dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '1433'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [User, Venue, BlockedPeriod, Booking, HireRecord, PreferredVenue, ComplianceDocument, VendorNote],
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
});