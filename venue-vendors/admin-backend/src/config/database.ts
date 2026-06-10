import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import { Venue } from '../entity/Venue';
import { Booking } from '../entity/Booking';
import dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '1433'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [User, Venue, Booking],
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
});