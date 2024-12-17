const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const listingRoutes = require('./routes/listing');
const userRoutes = require('./routes/userRoutes'); 


dotenv.config();
const app = express();


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); 
app.use('/api/listings', listingRoutes);
app.use('/api/users', userRoutes);

const frontendPath = path.join(__dirname, '../swago-frontend/site');
app.use(express.static(frontendPath));

const authRoutes = require('./routes/Auth');
app.use('/api/auth', authRoutes);

app.use('/api', authRoutes);
app.use('/api/messages', require('./routes/messageRoutes'));

const listingsRoutes = require('./routes/listing');
app.use('/api/listings', listingsRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(frontendPath, 'login.html'));
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
