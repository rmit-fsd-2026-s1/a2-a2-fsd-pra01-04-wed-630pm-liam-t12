import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { ComplianceDocument } from '../entity/ComplianceDocument';
import { PreferredVenue } from '../entity/PreferredVenue';
import { Booking } from '../entity/Booking';
import { AuthRequest } from '../middleware/auth';

const docRepo = () => AppDataSource.getRepository(ComplianceDocument);
const pvRepo = () => AppDataSource.getRepository(PreferredVenue);
const bookingRepo = () => AppDataSource.getRepository(Booking);

export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  const { docType, fileName, fileUrl } = req.body;
  if (!docType || !fileName) {
    res.status(400).json({ message: 'docType and fileName are required' }); return;
  }
  const existing = await docRepo().findOneBy({ hirerId: req.user!.id, docType });
  if (existing) {
    existing.fileName = fileName;
    existing.fileUrl = fileUrl;
    await docRepo().save(existing);
    res.json(existing); return;
  }
  const doc = docRepo().create({ hirerId: req.user!.id, docType, fileName, fileUrl });
  await docRepo().save(doc);
  res.status(201).json(doc);
};

export const getDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  const docs = await docRepo().findBy({ hirerId: req.user!.id });
  res.json(docs);
};

export const deleteDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  const doc = await docRepo().findOneBy({ id: parseInt(req.params.id as string) });
  if (!doc || doc.hirerId !== req.user!.id) {
    res.status(404).json({ message: 'Document not found' }); return;
  }
  await docRepo().remove(doc);
  res.json({ message: 'Deleted' });
};

export const getPreferred = async (req: AuthRequest, res: Response): Promise<void> => {
  const pvs = await pvRepo().find({
    where: { hirerId: req.user!.id },
    relations: { venue: true },
    order: { rank: 'ASC' },
  });
  res.json(pvs);
};

export const addPreferred = async (req: AuthRequest, res: Response): Promise<void> => {
  const { venueId, rank } = req.body;
  const existing = await pvRepo().findOneBy({ hirerId: req.user!.id, venueId });
  if (existing) {
    existing.rank = rank;
    await pvRepo().save(existing);
    res.json(existing); return;
  }
  const pv = pvRepo().create({ hirerId: req.user!.id, venueId, rank });
  await pvRepo().save(pv);
  res.status(201).json(pv);
};

export const removePreferred = async (req: AuthRequest, res: Response): Promise<void> => {
  const pv = await pvRepo().findOneBy({
    hirerId: req.user!.id,
    venueId: parseInt(req.params.venueId as string),
  });
  if (!pv) { res.status(404).json({ message: 'Not found' }); return; }
  await pvRepo().remove(pv);
  res.json({ message: 'Removed' });
};

export const getVendorStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const vendorId = req.user!.id;

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