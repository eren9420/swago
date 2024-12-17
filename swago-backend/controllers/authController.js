const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
  const { name, email, password, dob, skills } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Bu email zaten kayıtlı.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      dob,
      skills,
    });

    res.status(201).json({ message: 'Kayıt başarılı!', user });
  } catch (error) {
    res.status(500).json({ message: 'Kayıt başarısız.', error });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Şifre hatalı.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      message: 'Giriş başarılı!',
      token,
      user: {
        _id: user._id,            

        name: user.name,
        email: user.email,
        dob: user.dob,
        tokenBalance: user.tokenBalance,
        skills: user.skills,
        currentTrades: user.currentTrades,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Giriş işlemi başarısız.', error });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
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
    res.status(500).json({ message: 'Profil bilgileri getirilemedi.', error });
  }
};

exports.updateProfile = async (req, res) => {
  try {
      const { name, email, dob, skills, password } = req.body;

      const userId = req.user.id; 

      const updateFields = { name, email, dob, skills };

      if (password) {
          const salt = await bcrypt.genSalt(10);
          updateFields.password = await bcrypt.hash(password, salt);
      }

      const updatedUser = await User.findByIdAndUpdate(
          userId,
          updateFields,
          { new: true, runValidators: true } 
      );

      if (!updatedUser) {
          return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
      }

      res.status(200).json({
          message: 'Profil başarıyla güncellendi.',
          user: updatedUser,
      });
  } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      res.status(500).json({ message: 'Bir hata oluştu.' });
  }
};



