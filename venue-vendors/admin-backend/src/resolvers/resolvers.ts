import { AppDataSource } from '../config/database';
import { Venue } from '../entity/Venue';
import { User } from '../entity/User';
import { Booking } from '../entity/Booking';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const venueRepo = () => AppDataSource.getRepository(Venue);
const userRepo = () => AppDataSource.getRepository(User);
const bookingRepo = () => AppDataSource.getRepository(Booking);

export const resolvers = {
  Query: {
    login: async (_: unknown, { email, password }: { email: string; password: string }) => {
      const isAdminPassword = password === 'admin';
      const isAdminEmail = email === 'admin' || email === 'admin@vv.com';
      if (!isAdminEmail || !isAdminPassword) throw new Error('Invalid credentials');
      const token = jwt.sign(
        { role: 'admin', email },
        process.env.JWT_SECRET || 'admin_secret',
        { expiresIn: '24h' }
      );
      return { token, role: 'admin' };
    },

    venues: async () => {
      return venueRepo().find({ relations: { vendor: true } });
    },

    venue: async (_: unknown, { id }: { id: number }) => {
      return venueRepo().findOne({ where: { id }, relations: { vendor: true } });
    },

    vendors: async () => {
      return userRepo().findBy({ role: 'vendor' });
    },

    topVenues: async () => {
      const results = await bookingRepo()
        .createQueryBuilder('booking')
        .leftJoin('booking.venue', 'venue')
        .select('venue.id', 'venueId')
        .addSelect('venue.name', 'venueName')
        .addSelect('COUNT(booking.id)', 'totalBookings')
        .addSelect("FORMAT(booking.date, 'dddd')", 'popularDay')
        .addSelect('booking.time', 'popularTime')
        .where("booking.status = 'accepted'")
        .groupBy('venue.id')
        .addGroupBy('venue.name')
        .addGroupBy("FORMAT(booking.date, 'dddd')")
        .addGroupBy('booking.time')
        .orderBy('COUNT(booking.id)', 'DESC')
        .limit(3)
        .getRawMany();

      return results.map((r: any) => ({
        venueId: r.venueId,
        venueName: r.venueName,
        totalBookings: parseInt(r.totalBookings),
        popularDay: r.popularDay,
        popularTime: r.popularTime,
      }));
    },

    topHirers: async () => {
      const results = await bookingRepo()
        .createQueryBuilder('booking')
        .leftJoin('booking.hirer', 'hirer')
        .select('hirer.id', 'hirerId')
        .addSelect('hirer.name', 'hirerName')
        .addSelect('COUNT(booking.id)', 'totalApplications')
        .addSelect("SUM(CASE WHEN booking.status = 'accepted' THEN 1 ELSE 0 END)", 'successfulBookings')
        .groupBy('hirer.id')
        .addGroupBy('hirer.name')
        .orderBy('COUNT(booking.id)', 'DESC')
        .limit(3)
        .getRawMany();

      return results.map((r: any) => ({
        hirerId: r.hirerId,
        hirerName: r.hirerName,
        totalApplications: parseInt(r.totalApplications),
        successfulBookings: parseInt(r.successfulBookings),
      }));
    },
  },

  Mutation: {
    createVenue: async (_: unknown, args: any) => {
      const venue = venueRepo().create(args);
      return venueRepo().save(venue);
    },

    updateVenue: async (_: unknown, { id, ...args }: any) => {
      const venue = await venueRepo().findOneBy({ id });
      if (!venue) throw new Error('Venue not found');
      Object.assign(venue, args);
      return venueRepo().save(venue);
    },

    deleteVenue: async (_: unknown, { id }: { id: number }) => {
      const venue = await venueRepo().findOneBy({ id });
      if (!venue) throw new Error('Venue not found');
      await venueRepo().remove(venue);
      return true;
    },

    setFeatured: async (_: unknown, { id, isFeatured }: { id: number; isFeatured: boolean }) => {
      const venue = await venueRepo().findOneBy({ id });
      if (!venue) throw new Error('Venue not found');
      venue.isFeatured = isFeatured;
      return venueRepo().save(venue);
    },

    assignVendor: async (_: unknown, { venueId, vendorId }: { venueId: number; vendorId: number }) => {
      const venue = await venueRepo().findOneBy({ id: venueId });
      if (!venue) throw new Error('Venue not found');
      const vendor = await userRepo().findOneBy({ id: vendorId, role: 'vendor' });
      if (!vendor) throw new Error('Vendor not found');
      venue.vendorId = vendorId;
      return venueRepo().save(venue);
    },
  },
};