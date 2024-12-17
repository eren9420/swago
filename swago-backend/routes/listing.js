const express = require('express');
const { getAllListings, getTradedListings, addListing } = require('../controllers/listingController');
const listingController = require('../controllers/listingController');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Listing = require('../models/Listing'); 


router.get('/', getAllListings);

router.post('/', protect, addListing);

router.get('/traded', protect, getTradedListings);

router.post('/takas', protect, listingController.takasListing);

router.post('/crossTrade', protect, listingController.crossTrade);

router.get('/my-listings', protect, async (req, res) => {
    try {
      const userId = req.user._id; 
      const listings = await Listing.find({ user: userId });
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: 'Kendi ilanlarınız alınırken hata oluştu.' });
    }
  });
  

module.exports = router;
