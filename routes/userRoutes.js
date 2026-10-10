// const express = require('express');
// const router = express.Router();
// const { 
//   getUserProfile, 
//   updateUserProfile, 
//   deleteUserAccount 
// } = require('../controllers/userController');

// // Profile GET, PUT & DELETE Routes
// router.get('/profile', getUserProfile);
// router.get('/profile/:id', getUserProfile);

// router.put('/profile', updateUserProfile);
// router.put('/profile/:id', updateUserProfile);

// router.delete('/profile/:id', deleteUserAccount);

// module.exports = router;


const express = require('express');
const router = express.Router();
const { 
  registerUser,
  loginUser,
  forgotPassword,
  changePassword,
  getUserProfile, 
  updateUserProfile, 
  deleteUserAccount 
} = require('../controllers/userController');

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/change-password', changePassword);

// Profile GET, PUT & DELETE Routes
router.get('/profile', getUserProfile);
router.get('/profile/:id', getUserProfile);

router.put('/profile', updateUserProfile);
router.put('/profile/:id', updateUserProfile);

router.delete('/profile/:id', deleteUserAccount);

module.exports = router;