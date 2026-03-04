// routes/contactRoutes.js
import express from 'express';
import {
    getContacts,
    getContact,
    addContact,
    updateContact,
    deleteContact,
    toggleFavorite,
    toggleBlock,
    importContacts,
    exportContacts,
    getContactStats,
    mergeContacts
} from '../controllers/contactController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
    .get(getContacts)
    .post(addContact);

router.get('/stats', getContactStats);
router.get('/export', exportContacts);
router.post('/import', importContacts);
router.post('/merge', mergeContacts);

router.route('/:id')
    .get(getContact)
    .put(updateContact)
    .delete(deleteContact);

router.patch('/:id/favorite', toggleFavorite);
router.patch('/:id/block', toggleBlock);

export default router;
