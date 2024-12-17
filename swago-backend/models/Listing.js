const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['cleaning', 'gardening', 'cooking','software-development',
            'graphic-design',
            'language-teaching',
            'plumbing',
            'tutoring',
            'babysitting',
            'car_repair',
            'pet_sitting',
            'it_support',
            'painting'], 
  },
  details: { type: String, required: true },
  tokenCost: { type: Number, default: 0 },  
  isTraded: { type: Boolean, default: false },
  tradeDate: { type: Date },
});

module.exports = mongoose.model('Listing', listingSchema);
