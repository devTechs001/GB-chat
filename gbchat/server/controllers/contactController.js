// controllers/contactController.js
import Contact from '../models/Contact.model.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all contacts
// @route   GET /api/contacts
// @access  Private
export const getContacts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, search, favorite, blocked, label } = req.query;
    
    const filter = { userId: req.user._id };
    
    if (search) {
        const contacts = await Contact.searchContacts(req.user._id, search);
        return res.json({ success: true, contacts, count: contacts.length });
    }
    
    if (favorite === 'true') filter.isFavorite = true;
    if (blocked === 'true') filter.isBlocked = true;
    if (label) filter.labels = label;
    
    const contacts = await Contact.find(filter)
        .sort({ name: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
    
    const count = await Contact.countDocuments(filter);
    
    res.json({
        success: true,
        contacts,
        pagination: {
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit)
        }
    });
});

// @desc    Get single contact
// @route   GET /api/contacts/:id
// @access  Private
export const getContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findOne({
        _id: req.params.id,
        userId: req.user._id
    });
    
    if (!contact) {
        return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    
    res.json({ success: true, contact });
});

// @desc    Add new contact
// @route   POST /api/contacts
// @access  Private
export const addContact = asyncHandler(async (req, res) => {
    const { name, phoneNumber, email, avatar, labels, notes, birthday } = req.body;
    
    const contact = await Contact.create({
        userId: req.user._id,
        name,
        phoneNumber,
        email,
        avatar,
        labels,
        notes,
        birthday
    });
    
    res.status(201).json({ success: true, contact });
});

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
export const updateContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        req.body,
        { new: true, runValidators: true }
    );
    
    if (!contact) {
        return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    
    res.json({ success: true, contact });
});

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
export const deleteContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id
    });
    
    if (!contact) {
        return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    
    res.json({ success: true, message: 'Contact deleted successfully' });
});

// @desc    Toggle favorite status
// @route   PATCH /api/contacts/:id/favorite
// @access  Private
export const toggleFavorite = asyncHandler(async (req, res) => {
    const contact = await Contact.findOne({
        _id: req.params.id,
        userId: req.user._id
    });
    
    if (!contact) {
        return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    
    contact.isFavorite = !contact.isFavorite;
    await contact.save();
    
    res.json({ success: true, isFavorite: contact.isFavorite });
});

// @desc    Toggle block status
// @route   PATCH /api/contacts/:id/block
// @access  Private
export const toggleBlock = asyncHandler(async (req, res) => {
    const contact = await Contact.findOne({
        _id: req.params.id,
        userId: req.user._id
    });
    
    if (!contact) {
        return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    
    contact.isBlocked = !contact.isBlocked;
    await contact.save();
    
    res.json({ success: true, isBlocked: contact.isBlocked });
});

// @desc    Import contacts from CSV/vCard
// @route   POST /api/contacts/import
// @access  Private
export const importContacts = asyncHandler(async (req, res) => {
    const { contacts } = req.body; // Array of contact objects
    
    if (!Array.isArray(contacts) || contacts.length === 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'No contacts provided' 
        });
    }
    
    const contactsWithUser = contacts.map(contact => ({
        ...contact,
        userId: req.user._id,
        syncedFrom: 'manual'
    }));
    
    const imported = await Contact.insertMany(contactsWithUser, { ordered: false });
    
    res.json({
        success: true,
        message: `Imported ${imported.length} contacts`,
        count: imported.length
    });
});

// @desc    Export contacts
// @route   GET /api/contacts/export
// @access  Private
export const exportContacts = asyncHandler(async (req, res) => {
    const { format = 'json' } = req.query;
    
    const contacts = await Contact.find({ userId: req.user._id })
        .select('-__v -userId');
    
    if (format === 'csv') {
        const csv = contacts.map(c => 
            `${c.name},${c.phoneNumber},${c.email || ''}`
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
        return res.send(csv);
    }
    
    res.json({ success: true, contacts });
});

// @desc    Get contact statistics
// @route   GET /api/contacts/stats
// @access  Private
export const getContactStats = asyncHandler(async (req, res) => {
    const stats = await Contact.getContactStats(req.user._id);
    res.json({ success: true, stats });
});

// @desc    Merge duplicate contacts
// @route   POST /api/contacts/merge
// @access  Private
export const mergeContacts = asyncHandler(async (req, res) => {
    const { contactId1, contactId2 } = req.body;
    
    const contact1 = await Contact.findOne({
        _id: contactId1,
        userId: req.user._id
    });
    const contact2 = await Contact.findOne({
        _id: contactId2,
        userId: req.user._id
    });
    
    if (!contact1 || !contact2) {
        return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    
    // Merge contact2 into contact1
    if (contact2.alternateNumbers.length > 0) {
        contact1.alternateNumbers = [...new Set([...contact1.alternateNumbers, ...contact2.alternateNumbers])];
    }
    if (!contact1.email && contact2.email) contact1.email = contact2.email;
    if (!contact1.avatar && contact2.avatar) contact1.avatar = contact2.avatar;
    if (!contact1.notes && contact2.notes) contact1.notes = contact2.notes;
    
    await contact1.save();
    await Contact.findByIdAndDelete(contactId2);
    
    res.json({ success: true, message: 'Contacts merged successfully' });
});
