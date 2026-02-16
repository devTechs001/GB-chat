import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// @desc    Get user contacts
// @route   GET /api/contacts
// @access  Private
const getContacts = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('contacts', 'name email avatar');
    
    res.status(200).json({
      success: true,
      contacts: user.contacts,
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @desc    Add a contact
// @route   POST /api/contacts
// @access  Private
const addContact = asyncHandler(async (req, res) => {
  const { contactId } = req.body;

  try {
    // Check if contact exists
    const contact = await User.findById(contactId);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    // Check if contact is already added
    const user = await User.findById(req.user._id);
    if (user.contacts.includes(contactId)) {
      return res.status(400).json({
        success: false,
        message: 'Contact already exists',
      });
    }

    // Add contact to user's contact list
    user.contacts.push(contactId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Contact added successfully',
      contact: {
        _id: contact._id,
        name: contact.name,
        email: contact.email,
        avatar: contact.avatar,
      },
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @desc    Remove a contact
// @route   DELETE /api/contacts/:id
// @access  Private
const removeContact = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(req.user._id);
    
    // Check if contact exists in user's contact list
    if (!user.contacts.includes(id)) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found in your contacts',
      });
    }

    // Remove contact from user's contact list
    user.contacts = user.contacts.filter(contact => contact.toString() !== id);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Contact removed successfully',
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @desc    Add/remove contact from favorites
// @route   POST /api/contacts/favorite
// @access  Private
const addFavorite = asyncHandler(async (req, res) => {
  const { contactId, favorite } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (favorite) {
      // Add to favorites
      if (!user.favorites.includes(contactId)) {
        user.favorites.push(contactId);
      }
    } else {
      // Remove from favorites
      user.favorites = user.favorites.filter(fav => fav.toString() !== contactId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: favorite ? 'Added to favorites' : 'Removed from favorites',
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

export { 
  getContacts, 
  addContact, 
  removeContact, 
  addFavorite 
};