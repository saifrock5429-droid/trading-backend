
// const { cloudinary } = require('../config/cloudinary');
// const Payment = require('../models/Payment');
// const User = require('../models/User');
// const fs = require('fs');

// const EXCHANGE_RATE = 96;

// // Helper: Target User fetch ya create karein
// const getOrCreateTargetUser = async (userId, userEmail) => {
//   let targetUser = null;
//   if (userId && userId.toString().length === 24) {
//     targetUser = await User.findById(userId);
//   }
//   if (!targetUser && userEmail) {
//     targetUser = await User.findOne({ email: userEmail });
//   }
//   if (!targetUser) {
//     targetUser = await User.findOne({ email: 'rehanimam624@gmail.com' });
//   }
//   if (!targetUser) {
//     targetUser = await User.findOne();
//   }
//   if (!targetUser) {
//     targetUser = await User.create({
//       email: 'rehanimam624@gmail.com',
//       firstName: 'Rehan',
//       lastName: 'Imam',
//       balance: 0
//     });
//   }
//   return targetUser;
// };

// // 1. Upload Screenshot to Cloudinary & Save to DB
// exports.uploadDeposit = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: 'No screenshot file provided' });
//     }

//     const result = await cloudinary.uploader.upload(req.file.path, {
//       folder: 'trading_deposits',
//     });

//     if (fs.existsSync(req.file.path)) {
//       fs.unlinkSync(req.file.path);
//     }

//     const targetUser = await getOrCreateTargetUser(req.body.userId, req.body.email);

//     const newPayment = await Payment.create({
//       imageUrl: result.secure_url,
//       publicId: result.public_id,
//       userId: targetUser ? targetUser._id : null,
//       userEmail: targetUser ? targetUser.email : 'rehanimam624@gmail.com',
//       amountINR: 0,
//       amountUSD: 0,
//       amount: 0,
//       creditedAmount: 0,
//       exchangeRate: EXCHANGE_RATE,
//       status: 'Pending',
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Screenshot uploaded successfully',
//       payment: newPayment,
//     });
//   } catch (error) {
//     console.error('Cloudinary / Server Upload Error Details:', error);

//     if (req.file && req.file.path && fs.existsSync(req.file.path)) {
//       fs.unlinkSync(req.file.path);
//     }

//     res.status(500).json({
//       success: false,
//       message: error.message || 'Server upload error'
//     });
//   }
// };

// // 2. Fetch All Payments for Admin
// exports.getAllPayments = async (req, res) => {
//   try {
//     const payments = await Payment.find().sort({ createdAt: -1 });
//     res.status(200).json({ success: true, payments });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Failed to fetch payments' });
//   }
// };

// // 3. Admin Dwara INR me Entered Amount ko USD me Convert karke Live Balance me credit karna
// exports.updatePaymentAmount = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { amountINR, amountUSD, exchangeRate } = req.body;

//     const rate = Number(exchangeRate) || EXCHANGE_RATE;

//     if (amountINR === undefined && amountUSD === undefined) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'INR ya USD amount enter karna zaroori hai.' 
//       });
//     }

//     const inrValue = Number(amountINR) || 0;
//     const usdValue = (amountUSD !== undefined && !isNaN(Number(amountUSD)))
//       ? Number(Number(amountUSD).toFixed(2))
//       : Number((inrValue / rate).toFixed(2));

//     const payment = await Payment.findById(id);
//     if (!payment) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Payment record nahi mila.' 
//       });
//     }

//     // Associated User find karein
//     const targetUser = await getOrCreateTargetUser(payment.userId, payment.userEmail);

//     // Payment document par user bind karein
//     payment.userId = targetUser._id;
//     payment.userEmail = targetUser.email;

//     // Difference calculate karein taaki agar dubara amount edit ho to double add na ho
//     const previouslyCredited = Number(payment.creditedAmount || 0);
//     const diff = Number((usdValue - previouslyCredited).toFixed(2));

//     // Target User ke Live Balance me USD add karein
//     const currentBal = Number(targetUser.balance || 0);
//     targetUser.balance = Number(Math.max(0, currentBal + diff).toFixed(2));
//     await targetUser.save();

//     // Payment document update karein
//     payment.amountINR = inrValue;
//     payment.amountUSD = usdValue;
//     payment.amount = usdValue;
//     payment.creditedAmount = usdValue;
//     payment.exchangeRate = rate;
//     payment.status = 'Approved';
//     await payment.save();

//     console.log(`[Admin Payment Update] ✅ User ${targetUser.email}: Converted ₹${inrValue} INR -> $${usdValue} USD. New Live Balance: $${targetUser.balance} (Added diff: $${diff})`);

//     res.json({
//       success: true,
//       message: `USD $${usdValue} (₹${inrValue} INR) user live balance me successfully credit ho gaya! Current balance: $${targetUser.balance}`,
//       payment,
//       liveBalance: targetUser.balance,
//       user: targetUser
//     });

//   } catch (error) {
//     console.error('Error in updatePaymentAmount:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Server error: Balance credit nahi ho paya.' 
//     });
//   }
// };

// // 4. Update Payment Status (e.g. Rejected)
// exports.updatePaymentStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, amount } = req.body;

//     const payment = await Payment.findById(id);
//     if (!payment) {
//       return res.status(404).json({ success: false, message: 'Payment record not found' });
//     }

//     payment.status = status;
//     if (status === 'Approved' && Number(amount) > 0) {
//       payment.amount = Number(amount);
//       payment.amountUSD = Number(amount);
//       payment.creditedAmount = Number(amount);

//       const targetUser = await getOrCreateTargetUser(payment.userId, payment.userEmail);
//       if (targetUser) {
//         payment.userId = targetUser._id;
//         payment.userEmail = targetUser.email;
//         targetUser.balance = Number((Number(targetUser.balance || 0) + Number(amount)).toFixed(2));
//         await targetUser.save();
//       }
//     }

//     await payment.save();

//     res.json({
//       success: true,
//       message: `Payment ${status} successfully!`,
//       payment
//     });
//   } catch (error) {
//     console.error('Error updating payment:', error);
//     res.status(500).json({ success: false, message: 'Server error while updating payment' });
//   }
// };

// // 5. Admin can directly view user balance & adjust Live Balance
// exports.getUserLiveBalance = async (req, res) => {
//   try {
//     const user = await getOrCreateTargetUser();
//     res.json({ 
//       success: true, 
//       balance: Number(user.balance || 0), 
//       liveBalance: Number(user.balance || 0),
//       user 
//     });
//   } catch (error) {
//     console.error('Error in getUserLiveBalance:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.setUserBalance = async (req, res) => {
//   try {
//     const { balanceUSD, balanceINR, userId, email } = req.body;
//     const targetUser = await getOrCreateTargetUser(userId, email);

//     let newBalanceUSD = 0;
//     if (balanceUSD !== undefined && !isNaN(Number(balanceUSD))) {
//       newBalanceUSD = Number(balanceUSD);
//     } else if (balanceINR !== undefined && !isNaN(Number(balanceINR))) {
//       newBalanceUSD = Number((Number(balanceINR) / EXCHANGE_RATE).toFixed(2));
//     }

//     targetUser.balance = Number(newBalanceUSD.toFixed(2));
//     await targetUser.save();

//     console.log(`[Admin Direct Set] ✅ User ${targetUser.email} live balance set to $${targetUser.balance} USD`);

//     res.json({
//       success: true,
//       message: `Live Balance set to $${targetUser.balance} USD!`,
//       liveBalance: targetUser.balance,
//       balance: targetUser.balance,
//       user: targetUser
//     });
//   } catch (error) {
//     console.error('Error setting user balance:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };


const { cloudinary } = require('../config/cloudinary');
const Payment = require('../models/Payment');
const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const fs = require('fs');

const EXCHANGE_RATE = 96;

const getOrCreateTargetUser = async (userId, userEmail) => {
  let targetUser = null;
  if (userId && userId.toString().length === 24) {
    targetUser = await User.findById(userId);
  }
  if (!targetUser && userEmail) {
    targetUser = await User.findOne({ email: userEmail.toLowerCase() });
  }
  if (!targetUser) {
    targetUser = await User.findOne();
  }
  return targetUser;
};

// 1. Upload Screenshot to Cloudinary & Save to DB
exports.uploadDeposit = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No screenshot file provided' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'trading_deposits',
    });

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    const targetUser = await getOrCreateTargetUser(req.body.userId, req.body.email);

    const newPayment = await Payment.create({
      imageUrl: result.secure_url,
      publicId: result.public_id,
      userId: targetUser ? targetUser._id : null,
      userEmail: targetUser ? targetUser.email : (req.body.email || 'user@example.com'),
      amountINR: 0,
      amountUSD: 0,
      amount: 0,
      creditedAmount: 0,
      exchangeRate: EXCHANGE_RATE,
      status: 'Pending',
    });

    console.log(`[Deposit Screenshot] ✅ Uploaded by: ${newPayment.userEmail}`);

    res.status(201).json({
      success: true,
      message: 'Screenshot uploaded successfully',
      payment: newPayment,
    });
  } catch (error) {
    console.error('Cloudinary / Server Upload Error Details:', error);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: error.message || 'Server upload error' });
  }
};

// 2. Fetch All Payments for Admin
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
};

// 3. Admin Dwara INR me Entered Amount ko USD me Convert karke Live Balance me credit karna
exports.updatePaymentAmount = async (req, res) => {
  try {
    const { id } = req.params;
    const { amountINR, amountUSD, exchangeRate } = req.body;

    const rate = Number(exchangeRate) || EXCHANGE_RATE;
    const inrValue = Number(amountINR) || 0;
    const usdValue = (amountUSD !== undefined && !isNaN(Number(amountUSD)))
      ? Number(Number(amountUSD).toFixed(2))
      : Number((inrValue / rate).toFixed(2));

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record nahi mila.' });
    }

    const targetUser = await getOrCreateTargetUser(payment.userId, payment.userEmail);
    if (targetUser) {
      payment.userId = targetUser._id;
      payment.userEmail = targetUser.email;

      const previouslyCredited = Number(payment.creditedAmount || 0);
      const diff = Number((usdValue - previouslyCredited).toFixed(2));

      targetUser.balance = Number(Math.max(0, Number(targetUser.balance || 0) + diff).toFixed(2));
      await targetUser.save();
    }

    payment.amountINR = inrValue;
    payment.amountUSD = usdValue;
    payment.amount = usdValue;
    payment.creditedAmount = usdValue;
    payment.exchangeRate = rate;
    payment.status = 'Approved';
    await payment.save();

    console.log(`[Admin Payment Update] ✅ User ${payment.userEmail}: Converted ₹${inrValue} INR -> $${usdValue} USD. New Live Balance: $${targetUser ? targetUser.balance : usdValue}`);

    res.json({
      success: true,
      message: `USD $${usdValue} (₹${inrValue} INR) user live balance me successfully credit ho gaya!`,
      payment,
      liveBalance: targetUser ? targetUser.balance : usdValue,
      user: targetUser
    });
  } catch (error) {
    console.error('Error in updatePaymentAmount:', error);
    res.status(500).json({ success: false, message: 'Server error: Balance credit nahi ho paya.' });
  }
};

// 4. Update Payment Status (e.g. Rejected)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    payment.status = status;
    await payment.save();

    res.json({ success: true, message: `Payment ${status} successfully!`, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating payment' });
  }
};

// 5. Live Balance Get & Direct Set
exports.getUserLiveBalance = async (req, res) => {
  try {
    const user = await getOrCreateTargetUser();
    res.json({ 
      success: true, 
      balance: user ? Number(user.balance || 0) : 0, 
      liveBalance: user ? Number(user.balance || 0) : 0,
      user 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.setUserBalance = async (req, res) => {
  try {
    const { balanceUSD, balanceINR, userId, email } = req.body;
    const targetUser = await getOrCreateTargetUser(userId, email);

    let newBalanceUSD = 0;
    if (balanceUSD !== undefined && !isNaN(Number(balanceUSD))) {
      newBalanceUSD = Number(balanceUSD);
    } else if (balanceINR !== undefined && !isNaN(Number(balanceINR))) {
      newBalanceUSD = Number((Number(balanceINR) / EXCHANGE_RATE).toFixed(2));
    }

    if (targetUser) {
      targetUser.balance = Number(newBalanceUSD.toFixed(2));
      await targetUser.save();
    }

    res.json({
      success: true,
      message: `Live Balance set to $${newBalanceUSD} USD!`,
      liveBalance: newBalanceUSD,
      balance: newBalanceUSD,
      user: targetUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 6. User Creates Bank Withdrawal Request
exports.createWithdrawal = async (req, res) => {
  try {
    const { userId, userEmail, accountHolderName, bankName, accountNumber, ifscCode, amountUSD } = req.body;

    if (!accountHolderName || !bankName || !accountNumber || !ifscCode || !amountUSD || Number(amountUSD) <= 0) {
      return res.status(400).json({ success: false, message: 'Kripya saari bank details aur valid amount bharein!' });
    }

    const targetUser = await getOrCreateTargetUser(userId, userEmail);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found!' });
    }

    const currentBal = Number(targetUser.balance || 0);
    const withdrawAmount = Number(amountUSD);

    if (withdrawAmount > currentBal) {
      return res.status(400).json({ success: false, message: 'Insufficient Live Balance for withdrawal!' });
    }

    // Balance deduct karein
    targetUser.balance = Number((currentBal - withdrawAmount).toFixed(2));
    await targetUser.save();

    const amountINR = Number((withdrawAmount * EXCHANGE_RATE).toFixed(2));

    const withdrawal = await Withdrawal.create({
      userId: targetUser._id,
      userEmail: targetUser.email,
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      amountUSD: withdrawAmount,
      amountINR,
      status: 'Pending'
    });

    console.log(`[Withdrawal Request] ✅ User: ${targetUser.email} requested $${withdrawAmount} (₹${amountINR} INR)`);

    res.status(201).json({
      success: true,
      message: `Withdrawal request submitted! ₹${amountINR} INR will be transferred by Admin.`,
      withdrawal,
      liveBalance: targetUser.balance
    });
  } catch (error) {
    console.error('Error creating withdrawal:', error);
    res.status(500).json({ success: false, message: 'Server error during withdrawal' });
  }
};

// 7. Get All Withdrawals for Admin Panel
exports.getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().sort({ createdAt: -1 });
    res.json({ success: true, withdrawals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch withdrawals' });
  }
};

// 8. Admin Marks Withdrawal Transferred / Approved
exports.updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) return res.status(404).json({ success: false, message: 'Withdrawal not found' });

    withdrawal.status = status || 'Transferred';
    await withdrawal.save();

    console.log(`[Admin Transfer] ✅ Withdrawal ID ${id} marked as ${withdrawal.status}`);

    res.json({ success: true, message: `Withdrawal marked as ${withdrawal.status}!`, withdrawal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating withdrawal' });
  }
};