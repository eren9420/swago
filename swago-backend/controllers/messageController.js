const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
    const { receiverId, content } = req.body;

    try {
        const message = await Message.create({
            sender: req.user.id, 
            receiver: receiverId,
            content,
        });

        res.status(201).json({
            message: 'Mesaj başarıyla gönderildi.',
            data: message,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Mesaj gönderilemedi.',
            error,
        });
    }
};

exports.getInboxMessages = async (req, res) => {
    try {
        const receivedMessages = await Message.find({ receiver: req.user.id })
            .populate('sender', 'name email')
            .sort({ createdAt: -1 });

        const sentMessages = await Message.find({ sender: req.user.id })
            .populate('receiver', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            received: receivedMessages || [],
            sent: sentMessages || [],
        });
    } catch (error) {
        res.status(500).json({
            message: 'Mesajlar alınamadı.',
            error,
        });
    }
};

exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const messages = await Message.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        })
            .populate('sender', 'name email') 
            .populate('receiver', 'name email') 
            .sort({ createdAt: 1 }); 

        const conversations = {};
        messages.forEach(message => {
            const otherUser = message.sender._id.toString() === userId ? message.receiver : message.sender;
            const otherUserId = otherUser._id.toString();

            if (!conversations[otherUserId]) {
                conversations[otherUserId] = {
                    user: otherUser,
                    messages: [],
                };
            }
            conversations[otherUserId].messages.push(message);
        });

        res.status(200).json(Object.values(conversations)); 
    } catch (error) {
        res.status(500).json({
            message: 'Konuşmalar alınamadı.',
            error,
        });
    }
};

