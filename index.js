

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

//check connection
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const { cloudinaryConnection } = require('./config/cloudinary');

const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// 1. Configure CORS to allow only your frontend Vercel URL (and localhost for development)
const allowedOrigins = [
  'https://xm-trading-git-main-saifrocks-projects.vercel.app',
  'http://localhost:3000', // Update this if your local frontend runs on a different port (e.g., 5173 for Vite)
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // Enable cookies/authorization headers if needed
  })
);

// Middlewares
app.use(express.json());

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
  console.log(`Server running on port ${PORT}`);
});