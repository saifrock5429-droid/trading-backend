// // const express = require('express');
// // const router = express.Router();
// // const upload = require('../middleware/multer');
// // const { 
// //   uploadDeposit, 
// //   getAllPayments, 
// //   updatePaymentStatus, 
// //   updatePaymentAmount,
// //   getUserLiveBalance,
// //   setUserBalance
// // } = require('../controllers/paymentController');

// // router.post('/upload', upload.single('screenshot'), uploadDeposit);
// // router.get('/all', getAllPayments);
// // router.get('/live-balance', getUserLiveBalance);
// // router.post('/set-user-balance', setUserBalance);
// // router.patch('/status/:id', updatePaymentStatus);
// // router.patch('/amount/:id', updatePaymentAmount);

// // module.exports = router;


// const express = require('express');
// const router = express.Router();
// const upload = require('../middleware/multer');
// const { 
//   uploadDeposit, 
//   getAllPayments, 
//   updatePaymentStatus, 
//   updatePaymentAmount,
//   getUserLiveBalance,
//   setUserBalance
// } = require('../controllers/paymentController');

// router.post('/upload', upload.single('screenshot'), uploadDeposit);
// router.get('/all', getAllPayments);
// router.get('/live-balance', getUserLiveBalance);
// router.post('/set-user-balance', setUserBalance);
// router.patch('/status/:id', updatePaymentStatus);
// router.patch('/amount/:id', updatePaymentAmount);

// module.exports = router;

const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { 
  uploadDeposit, 
  getAllPayments, 
  updatePaymentStatus, 
  updatePaymentAmount,
  getUserLiveBalance,
  setUserBalance,
  createWithdrawal,
  getAllWithdrawals,
  updateWithdrawalStatus
} = require('../controllers/paymentController');

// Deposits
router.post('/upload', upload.single('screenshot'), uploadDeposit);
router.get('/all', getAllPayments);
router.get('/live-balance', getUserLiveBalance);
router.post('/set-user-balance', setUserBalance);
router.patch('/status/:id', updatePaymentStatus);
router.patch('/amount/:id', updatePaymentAmount);

// Withdrawals
router.post('/withdrawal/create', createWithdrawal);
router.get('/withdrawal/all', getAllWithdrawals);
router.patch('/withdrawal/status/:id', updateWithdrawalStatus);

module.exports = router;