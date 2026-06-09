import { Router } from 'express';
import {
  createBooking, getBookings,
  updateBookingStatus, getHireHistory, rateHire
} from '../controllers/bookingController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.post('/', authenticate, requireRole('hirer'), createBooking);
router.get('/', authenticate, getBookings);
router.put('/:id/status', authenticate, requireRole('vendor'), updateBookingStatus);
router.get('/history', authenticate, requireRole('hirer'), getHireHistory);
router.put('/history/:id/rate', authenticate, requireRole('hirer'), rateHire);
export default router;