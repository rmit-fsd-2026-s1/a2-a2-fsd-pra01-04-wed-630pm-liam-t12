import { Router } from 'express';
import {
  getVenues, getFeaturedVenues, getVenueById,
  createVenue, updateVenue, deleteVenue,
  blockPeriod, unblockPeriod, checkSuitability
} from '../controllers/venueController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.get('/featured', getFeaturedVenues);
router.get('/suitability', checkSuitability);
router.get('/', authenticate, getVenues);
router.get('/:id', authenticate, getVenueById);
router.post('/', authenticate, requireRole('vendor'), createVenue);
router.put('/:id', authenticate, requireRole('vendor', 'admin'), updateVenue);
router.delete('/:id', authenticate, requireRole('vendor', 'admin'), deleteVenue);
router.post('/:id/block', authenticate, requireRole('vendor'), blockPeriod);
router.delete('/:id/block/:bpId', authenticate, requireRole('vendor'), unblockPeriod);
export default router;