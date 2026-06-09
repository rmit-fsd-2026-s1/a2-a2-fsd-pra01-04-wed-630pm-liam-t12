"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const database_1 = require("../config/database");
const Venue_1 = require("../entity/Venue");
const User_1 = require("../entity/User");
const Booking_1 = require("../entity/Booking");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const venueRepo = () => database_1.AppDataSource.getRepository(Venue_1.Venue);
const userRepo = () => database_1.AppDataSource.getRepository(User_1.User);
const bookingRepo = () => database_1.AppDataSource.getRepository(Booking_1.Booking);
exports.resolvers = {
    Query: {
        login: async (_, { email, password }) => {
            // Admin login: hardcoded credentials as per spec
            if (email !== 'admin' && email !== 'admin@vv.com') {
                throw new Error('Invalid credentials');
            }
            const isAdminPassword = password === 'admin';
            const valid = isAdminPassword;
            if (!valid)
                throw new Error('Invalid credentials');
            const token = jsonwebtoken_1.default.sign({ role: 'admin', email }, process.env.JWT_SECRET || 'admin_secret', { expiresIn: '24h' });
            return { token, role: 'admin' };
        },
        venues: async () => {
            return venueRepo().find({ relations: { vendor: true } });
        },
        venue: async (_, { id }) => {
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
            return results.map((r) => ({
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
            return results.map((r) => ({
                hirerId: r.hirerId,
                hirerName: r.hirerName,
                totalApplications: parseInt(r.totalApplications),
                successfulBookings: parseInt(r.successfulBookings),
            }));
        },
    },
    Mutation: {
        createVenue: async (_, args) => {
            const venue = venueRepo().create(args);
            return venueRepo().save(venue);
        },
        updateVenue: async (_, { id, ...args }) => {
            const venue = await venueRepo().findOneBy({ id });
            if (!venue)
                throw new Error('Venue not found');
            Object.assign(venue, args);
            return venueRepo().save(venue);
        },
        deleteVenue: async (_, { id }) => {
            const venue = await venueRepo().findOneBy({ id });
            if (!venue)
                throw new Error('Venue not found');
            await venueRepo().remove(venue);
            return true;
        },
        setFeatured: async (_, { id, isFeatured }) => {
            const venue = await venueRepo().findOneBy({ id });
            if (!venue)
                throw new Error('Venue not found');
            venue.isFeatured = isFeatured;
            return venueRepo().save(venue);
        },
        assignVendor: async (_, { venueId, vendorId }) => {
            const venue = await venueRepo().findOneBy({ id: venueId });
            if (!venue)
                throw new Error('Venue not found');
            const vendor = await userRepo().findOneBy({ id: vendorId, role: 'vendor' });
            if (!vendor)
                throw new Error('Vendor not found');
            venue.vendorId = vendorId;
            return venueRepo().save(venue);
        },
    },
};
