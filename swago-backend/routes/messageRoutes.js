const express = require('express');
const { sendMessage, getInboxMessages,getConversations } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, sendMessage); 
router.get('/', protect, getInboxMessages); 
router.get('/conversations', protect, getConversations);

module.exports = router;
