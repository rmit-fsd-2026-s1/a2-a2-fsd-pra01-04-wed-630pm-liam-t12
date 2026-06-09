import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Booking } from '../entity/Booking';
import { HireRecord } from '../entity/HireRecord';
import { ComplianceDocument } from '../entity/ComplianceDocument';
import { AuthRequest } from '../middleware/auth';

const bookingRepo = () => AppDataSource.getRepository(Booking);
const hrRepo = () => AppDataSource.getRepository(HireRecord);
const docRepo = () => AppDataSource.getRepository(ComplianceDocument);

const getComplianceScore = async (hirerId: number): Promise<number> => {
  const docs = await docRepo().findBy({ hirerId });
  const types = new Set(docs.map(d => d.docType));
  const required = ['drivers_license', 'insurance', 'business_certificate'];
  const matched = required.filter(t => types.has(t)).length;
  return Math.round((matched / required.length) * 5);
};

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  const { venueId, eventName, guestCount, date, time, duration } = req.body;
  if (!venueId || !eventName || !guestCount || !date || !time || !duration) {
    res.status(400).json({ message: 'All fields are required' }); return;
  }
  const booking = bookingRepo().create({
    hirerId: req.user!.id,
    venueId: parseInt(venueId),
    eventName, guestCount: parseInt(guestCount),
    date, time, duration: parseInt(duration),
    status: 'pending',
  });
  await bookingRepo().save(booking);
  res.status(201).json(booking);
};

export const getBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.user!.role === 'hirer') {
    const bookings = await bookingRepo().find({
      where: { hirerId: req.user!.id },
      relations: { venue: true, hirer: true },
      order: { createdAt: 'DESC' },
    });
    res.json(bookings);
  } else if (req.user!.role === 'vendor') {
    const bookings = await bookingRepo()
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.venue', 'venue')
      .leftJoinAndSelect('booking.hirer', 'hirer')
      .where('venue.vendorId = :vendorId', { vendorId: req.user!.id })
      .orderBy('booking.createdAt', 'DESC')
      .getMany();
    const enriched = await Promise.all(bookings.map(async b => ({
      ...b,
      complianceScore: await getComplianceScore(b.hirerId),
    })));
    res.json(enriched);
  } else {
    const bookings = await bookingRepo().find({
      relations: { venue: true, hirer: true },
      order: { createdAt: 'DESC' },
    });
    res.json(bookings);
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, vendorComment } = req.body;
  if (!['accepted', 'rejected'].includes(status)) {
    res.status(400).json({ message: 'Status must be accepted or rejected' }); return;
  }
  const booking = await bookingRepo().findOne({
    where: { id: parseInt(req.params.id as string) },
    relations: { venue: true },
  });
  if (!booking) { res.status(404).json({ message: 'Booking not found' }); return; }
  if (booking.venue.vendorId !== req.user!.id) {
    res.status(403).json({ message: 'Not your venue' }); return;
  }
  booking.status = status;
  if (vendorComment) booking.vendorComment = vendorComment;
  await bookingRepo().save(booking);
  if (status === 'accepted') {
    const existing = await hrRepo().findOneBy({ hirerId: booking.hirerId, venueId: booking.venueId });
    if (!existing) {
      const hr = hrRepo().create({
        hirerId: booking.hirerId, venueId: booking.venueId,
        eventName: booking.eventName, dateOfHire: booking.date,
      });
      await hrRepo().save(hr);
    }
  }
  res.json(booking);
};

export const getHireHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  const records = await hrRepo().find({
    where: { hirerId: req.user!.id },
    relations: { venue: true },
    order: { createdAt: 'DESC' },
  });
  res.json(records);
};

export const rateHire = async (req: AuthRequest, res: Response): Promise<void> => {
  const { rating } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    res.status(400).json({ message: 'Rating must be between 1 and 5' }); return;
  }
  const hr = await hrRepo().findOneBy({ id: parseInt(req.params.id as string) });
  if (!hr) { res.status(404).json({ message: 'Record not found' }); return; }
  if (hr.hirerId !== req.user!.id) {
    res.status(403).json({ message: 'Not your record' }); return;
  }
  hr.rating = parseInt(rating);
  await hrRepo().save(hr);
  res.json(hr);
};