"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSuitability = exports.unblockPeriod = exports.blockPeriod = exports.deleteVenue = exports.updateVenue = exports.createVenue = exports.getVenueById = exports.getFeaturedVenues = exports.getVenues = void 0;
const database_1 = require("../config/database");
const Venue_1 = require("../entity/Venue");
const BlockedPeriod_1 = require("../entity/BlockedPeriod");
const venueRepo = () => database_1.AppDataSource.getRepository(Venue_1.Venue);
const bpRepo = () => database_1.AppDataSource.getRepository(BlockedPeriod_1.BlockedPeriod);
const getVenues = async (req, res) => {
    const { keyword } = req.query;
    let query = venueRepo().createQueryBuilder('venue')
        .leftJoinAndSelect('venue.vendor', 'vendor')
        .leftJoinAndSelect('venue.blockedPeriods', 'blockedPeriods');
    if (req.user?.role === 'vendor') {
        query = query.where('venue.vendorId = :id', { id: req.user.id });
    }
    if (keyword) {
        const k = `%${keyword}%`;
        query = query.andWhere('(venue.name LIKE :k OR venue.location LIKE :k OR venue.suitability LIKE :k OR venue.description LIKE :k)', { k });
    }
    const venues = await query.getMany();
    res.json(venues);
};
exports.getVenues = getVenues;
const getFeaturedVenues = async (_req, res) => {
    const venues = await venueRepo().find({
        where: { isFeatured: true },
        relations: { vendor: true, blockedPeriods: true },
    });
    res.json(venues);
};
exports.getFeaturedVenues = getFeaturedVenues;
const getVenueById = async (req, res) => {
    const venue = await venueRepo().findOne({
        where: { id: parseInt(req.params.id) },
        relations: { vendor: true, blockedPeriods: true },
    });
    if (!venue) {
        res.status(404).json({ message: 'Venue not found' });
        return;
    }
    res.json(venue);
};
exports.getVenueById = getVenueById;
const createVenue = async (req, res) => {
    const { name, location, capacity, pricePerHour, image, description, suitability } = req.body;
    if (!name || !location || !capacity || !pricePerHour) {
        res.status(400).json({ message: 'Name, location, capacity and price are required' });
        return;
    }
    const venue = venueRepo().create({
        name, location,
        capacity: parseInt(capacity),
        pricePerHour: parseFloat(pricePerHour),
        image, description, suitability,
        vendorId: req.user.id,
    });
    await venueRepo().save(venue);
    res.status(201).json(venue);
};
exports.createVenue = createVenue;
const updateVenue = async (req, res) => {
    const venue = await venueRepo().findOneBy({ id: parseInt(req.params.id) });
    if (!venue) {
        res.status(404).json({ message: 'Venue not found' });
        return;
    }
    if (venue.vendorId !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({ message: 'Not your venue' });
        return;
    }
    Object.assign(venue, req.body);
    await venueRepo().save(venue);
    res.json(venue);
};
exports.updateVenue = updateVenue;
const deleteVenue = async (req, res) => {
    const venue = await venueRepo().findOneBy({ id: parseInt(req.params.id) });
    if (!venue) {
        res.status(404).json({ message: 'Venue not found' });
        return;
    }
    if (venue.vendorId !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({ message: 'Not your venue' });
        return;
    }
    await venueRepo().remove(venue);
    res.json({ message: 'Venue deleted' });
};
exports.deleteVenue = deleteVenue;
const blockPeriod = async (req, res) => {
    const { fromDate, toDate } = req.body;
    if (!fromDate || !toDate) {
        res.status(400).json({ message: 'fromDate and toDate are required' });
        return;
    }
    const venue = await venueRepo().findOneBy({ id: parseInt(req.params.id) });
    if (!venue) {
        res.status(404).json({ message: 'Venue not found' });
        return;
    }
    if (venue.vendorId !== req.user.id) {
        res.status(403).json({ message: 'Not your venue' });
        return;
    }
    const bp = bpRepo().create({ venueId: venue.id, fromDate, toDate });
    await bpRepo().save(bp);
    res.status(201).json(bp);
};
exports.blockPeriod = blockPeriod;
const unblockPeriod = async (req, res) => {
    const bp = await bpRepo().findOneBy({ id: parseInt(req.params.bpId) });
    if (!bp) {
        res.status(404).json({ message: 'Blocked period not found' });
        return;
    }
    await bpRepo().remove(bp);
    res.json({ message: 'Unblocked' });
};
exports.unblockPeriod = unblockPeriod;
const checkSuitability = async (req, res) => {
    const { keyword } = req.query;
    if (!keyword) {
        res.status(400).json({ message: 'keyword is required' });
        return;
    }
    const venues = await venueRepo()
        .createQueryBuilder('venue')
        .where('venue.suitability LIKE :k OR venue.description LIKE :k OR venue.name LIKE :k', { k: `%${keyword}%` })
        .leftJoinAndSelect('venue.vendor', 'vendor')
        .getMany();
    res.json(venues);
};
exports.checkSuitability = checkSuitability;
