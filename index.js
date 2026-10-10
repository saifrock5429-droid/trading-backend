

// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const connectDB = require('./config/db');
// const { cloudinaryConnection } = require('./config/cloudinary');

// const userRoutes = require('./routes/userRoutes');
// const paymentRoutes = require('./routes/paymentRoutes');

// const app = express();

// // Middlewares
// app.use(express.json());
// app.use(cors());

// // Database Connection
// connectDB();
// cloudinaryConnection();

// // API Routes
// app.use('/api/user', userRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/payments', paymentRoutes);

// // Health Check
// app.get('/', (req, res) => {
//   res.send('Server Running Smoothly!');
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const { cloudinaryConnection } = require('./config/cloudinary');

const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Database Connection
connectDB();
cloudinaryConnection();

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('Server Running Smoothly!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});