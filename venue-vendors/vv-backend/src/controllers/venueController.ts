import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Venue } from '../entity/Venue';
import { BlockedPeriod } from '../entity/BlockedPeriod';
import { AuthRequest } from '../middleware/auth';

const venueRepo = () => AppDataSource.getRepository(Venue);
const bpRepo = () => AppDataSource.getRepository(BlockedPeriod);

export const getVenues = async (req: AuthRequest, res: Response): Promise<void> => {
  const { keyword } = req.query;
  let query = venueRepo().createQueryBuilder('venue')
    .leftJoinAndSelect('venue.vendor', 'vendor')
    .leftJoinAndSelect('venue.blockedPeriods', 'blockedPeriods');
  if (req.user?.role === 'vendor') {
    query = query.where('venue.vendorId = :id', { id: req.user.id });
  }
  if (keyword) {
    const k = `%${keyword}%`;
    query = query.andWhere(
      '(venue.name LIKE :k OR venue.location LIKE :k OR venue.suitability LIKE :k OR venue.description LIKE :k)',
      { k }
    );
  }
  const venues = await query.getMany();
  res.json(venues);
};

export const getFeaturedVenues = async (_req: Request, res: Response): Promise<void> => {
  const venues = await venueRepo().find({
    where: { isFeatured: true },
    relations: { vendor: true, blockedPeriods: true },
  });
  res.json(venues);
};

export const getVenueById = async (req: Request, res: Response): Promise<void> => {
  const venue = await venueRepo().findOne({
    where: { id: parseInt(req.params.id as string) },
    relations: { vendor: true, blockedPeriods: true },
  });
  if (!venue) { res.status(404).json({ message: 'Venue not found' }); return; }
  res.json(venue);
};

export const createVenue = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, location, capacity, pricePerHour, image, description, suitability } = req.body;
  if (!name || !location || !capacity || !pricePerHour) {
    res.status(400).json({ message: 'Name, location, capacity and price are required' }); return;
  }
  const venue = venueRepo().create({
    name, location,
    capacity: parseInt(capacity),
    pricePerHour: parseFloat(pricePerHour),
    image, description, suitability,
    vendorId: req.user!.id,
  });
  await venueRepo().save(venue);
  res.status(201).json(venue);
};

export const updateVenue = async (req: AuthRequest, res: Response): Promise<void> => {
  const venue = await venueRepo().findOneBy({ id: parseInt(req.params.id as string) });
  if (!venue) { res.status(404).json({ message: 'Venue not found' }); return; }
  if (venue.vendorId !== req.user!.id && req.user!.role !== 'admin') {
    res.status(403).json({ message: 'Not your venue' }); return;
  }
  Object.assign(venue, req.body);
  await venueRepo().save(venue);
  res.json(venue);
};

export const deleteVenue = async (req: AuthRequest, res: Response): Promise<void> => {
  const venue = await venueRepo().findOneBy({ id: parseInt(req.params.id as string) });
  if (!venue) { res.status(404).json({ message: 'Venue not found' }); return; }
  if (venue.vendorId !== req.user!.id && req.user!.role !== 'admin') {
    res.status(403).json({ message: 'Not your venue' }); return;
  }
  await venueRepo().remove(venue);
  res.json({ message: 'Venue deleted' });
};

export const blockPeriod = async (req: AuthRequest, res: Response): Promise<void> => {
  const { fromDate, toDate } = req.body;
  if (!fromDate || !toDate) {
    res.status(400).json({ message: 'fromDate and toDate are required' }); return;
  }
  const venue = await venueRepo().findOneBy({ id: parseInt(req.params.id as string) });
  if (!venue) { res.status(404).json({ message: 'Venue not found' }); return; }
  if (venue.vendorId !== req.user!.id) {
    res.status(403).json({ message: 'Not your venue' }); return;
  }
  const bp = bpRepo().create({ venueId: venue.id, fromDate, toDate });
  await bpRepo().save(bp);
  res.status(201).json(bp);
};

export const unblockPeriod = async (req: AuthRequest, res: Response): Promise<void> => {
  const bp = await bpRepo().findOneBy({ id: parseInt(req.params.bpId as string) });
  if (!bp) { res.status(404).json({ message: 'Blocked period not found' }); return; }
  await bpRepo().remove(bp);
  res.json({ message: 'Unblocked' });
};

export const checkSuitability = async (req: Request, res: Response): Promise<void> => {
  const { keyword } = req.query;
  if (!keyword) { res.status(400).json({ message: 'keyword is required' }); return; }
  const venues = await venueRepo()
    .createQueryBuilder('venue')
    .where('venue.suitability LIKE :k OR venue.description LIKE :k OR venue.name LIKE :k', { k: `%${keyword}%` })
    .leftJoinAndSelect('venue.vendor', 'vendor')
    .getMany();
  res.json(venues);
};