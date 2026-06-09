import { Router } from 'express';
import {
  uploadDocument, getDocuments, deleteDocument,
  getPreferred, addPreferred, removePreferred,
  getVendorStats,
} from '../controllers/hirerController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.get('/documents', authenticate, requireRole('hirer'), getDocuments);
router.post('/documents', authenticate, requireRole('hirer'), uploadDocument);
router.delete('/documents/:id', authenticate, requireRole('hirer'), deleteDocument);
router.get('/preferred', authenticate, requireRole('hirer'), getPreferred);
router.post('/preferred', authenticate, requireRole('hirer'), addPreferred);
router.delete('/preferred/:venueId', authenticate, requireRole('hirer'), removePreferred);
router.get('/stats', authenticate, requireRole('vendor'), getVendorStats);
export default router;