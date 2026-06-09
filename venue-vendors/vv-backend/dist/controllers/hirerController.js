"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorStats = exports.removePreferred = exports.addPreferred = exports.getPreferred = exports.deleteDocument = exports.getDocuments = exports.uploadDocument = void 0;
const database_1 = require("../config/database");
const ComplianceDocument_1 = require("../entity/ComplianceDocument");
const PreferredVenue_1 = require("../entity/PreferredVenue");
const Booking_1 = require("../entity/Booking");
const docRepo = () => database_1.AppDataSource.getRepository(ComplianceDocument_1.ComplianceDocument);
const pvRepo = () => database_1.AppDataSource.getRepository(PreferredVenue_1.PreferredVenue);
const bookingRepo = () => database_1.AppDataSource.getRepository(Booking_1.Booking);
const uploadDocument = async (req, res) => {
    const { docType, fileName, fileUrl } = req.body;
    if (!docType || !fileName) {
        res.status(400).json({ message: 'docType and fileName are required' });
        return;
    }
    const existing = await docRepo().findOneBy({ hirerId: req.user.id, docType });
    if (existing) {
        existing.fileName = fileName;
        existing.fileUrl = fileUrl;
        await docRepo().save(existing);
        res.json(existing);
        return;
    }
    const doc = docRepo().create({ hirerId: req.user.id, docType, fileName, fileUrl });
    await docRepo().save(doc);
    res.status(201).json(doc);
};
exports.uploadDocument = uploadDocument;
const getDocuments = async (req, res) => {
    const docs = await docRepo().findBy({ hirerId: req.user.id });
    res.json(docs);
};
exports.getDocuments = getDocuments;
const deleteDocument = async (req, res) => {
    const doc = await docRepo().findOneBy({ id: parseInt(req.params.id) });
    if (!doc || doc.hirerId !== req.user.id) {
        res.status(404).json({ message: 'Document not found' });
        return;
    }
    await docRepo().remove(doc);
    res.json({ message: 'Deleted' });
};
exports.deleteDocument = deleteDocument;
const getPreferred = async (req, res) => {
    const pvs = await pvRepo().find({
        where: { hirerId: req.user.id },
        relations: { venue: true },
        order: { rank: 'ASC' },
    });
    res.json(pvs);
};
exports.getPreferred = getPreferred;
const addPreferred = async (req, res) => {
    const { venueId, rank } = req.body;
    const existing = await pvRepo().findOneBy({ hirerId: req.user.id, venueId });
    if (existing) {
        existing.rank = rank;
        await pvRepo().save(existing);
        res.json(existing);
        return;
    }
    const pv = pvRepo().create({ hirerId: req.user.id, venueId, rank });
    await pvRepo().save(pv);
    res.status(201).json(pv);
};
exports.addPreferred = addPreferred;
const removePreferred = async (req, res) => {
    const pv = await pvRepo().findOneBy({
        hirerId: req.user.id,
        venueId: parseInt(req.params.venueId),
    });
    if (!pv) {
        res.status(404).json({ message: 'Not found' });
        return;
    }
    await pvRepo().remove(pv);
    res.json({ message: 'Removed' });
};
exports.removePreferred = removePreferred;
const getVendorStats = async (req, res) => {
    const vendorId = req.user.id;
    const bookingsByVenue = await bookingRepo()
        .createQueryBuilder('booking')
        .leftJoin('booking.venue', 'venue')
        .select('venue.name', 'venueName')
        .addSelect('venue.id', 'venueId')
        .addSelect('COUNT(booking.id)', 'total')
        .addSelect("SUM(CASE WHEN booking.status = 'accepted' THEN 1 ELSE 0 END)", 'accepted')
        .addSelect("SUM(CASE WHEN booking.status = 'rejected' THEN 1 ELSE 0 END)", 'rejected')
        .addSelect("SUM(CASE WHEN booking.status = 'pending' THEN 1 ELSE 0 END)", 'pending')
        .where('venue.vendorId = :vendorId', { vendorId })
        .groupBy('venue.id')
        .addGroupBy('venue.name')
        .getRawMany();
    const hirersByVenue = await bookingRepo()
        .createQueryBuilder('booking')
        .leftJoin('booking.venue', 'venue')
        .leftJoin('booking.hirer', 'hirer')
        .select('venue.name', 'venueName')
        .addSelect('hirer.name', 'hirerName')
        .addSelect('hirer.id', 'hirerId')
        .addSelect('COUNT(booking.id)', 'count')
        .where('venue.vendorId = :vendorId', { vendorId })
        .groupBy('venue.id').addGroupBy('venue.name')
        .addGroupBy('hirer.id').addGroupBy('hirer.name')
        .getRawMany();
    const utilizationOverTime = await bookingRepo()
        .createQueryBuilder('booking')
        .leftJoin('booking.venue', 'venue')
        .select("FORMAT(booking.createdAt, 'yyyy-MM')", 'month')
        .addSelect('venue.name', 'venueName')
        .addSelect('COUNT(booking.id)', 'count')
        .where('venue.vendorId = :vendorId', { vendorId })
        .groupBy("FORMAT(booking.createdAt, 'yyyy-MM')")
        .addGroupBy('venue.name')
        .orderBy("FORMAT(booking.createdAt, 'yyyy-MM')", 'ASC')
        .getRawMany();
    res.json({ bookingsByVenue, hirersByVenue, utilizationOverTime });
};
exports.getVendorStats = getVendorStats;
