const User = require('../models/User'); 

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id); 
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' }); 
        }
        res.status(200).json({
            name: user.name,
            email: user.email,
            dob: user.dob,
            tokenBalance: user.tokenBalance,
            skills: user.skills,
        });
    } catch (error) {
        res.status(500).json({ message: 'Kullanıcı bilgisi alınırken bir hata oluştu.', error }); 
    }
};
