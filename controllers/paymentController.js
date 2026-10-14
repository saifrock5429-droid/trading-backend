const { cloudinary } = require('../config/cloudinary');
const Payment = require('../models/Payment');
const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const fs = require('fs');
const { sendDepositNotification } = require('../utils/whatsappNotification');

const EXCHANGE_RATE = 96;

// Helper: Target User fetch karein (Strictly Isolated by User ID / Email)
const getOrCreateTargetUser = async (userId, userEmail) => {
  let targetUser = null;
  if (userId && userId.toString().length === 24) {
    targetUser = await User.findById(userId);
  }
  if (!targetUser && userEmail) {
    targetUser = await User.findOne({ email: userEmail.toLowerCase() });
  }
  return targetUser;
};

// 1. Upload Screenshot to Cloudinary, Save to DB & Trigger Automated WhatsApp Admin Notification
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

    const inrAmount = Number(req.body.amountINR) || 0;
    const baseUSD = Number((inrAmount / EXCHANGE_RATE).toFixed(2));
    const bonusUSD = Number((baseUSD * 0.10).toFixed(2));
    
    // Total USD with 10% bonus calculated
    const calculatedTotalUSD = Number((baseUSD + bonusUSD).toFixed(2));
    const usdAmount = req.body.amountUSD && !isNaN(Number(req.body.amountUSD))
      ? Number(Number(req.body.amountUSD).toFixed(2))
      : calculatedTotalUSD;

    const newPayment = await Payment.create({
      imageUrl: result.secure_url,
      publicId: result.public_id,
      userId: targetUser ? targetUser._id : (req.body.userId || null),
      userEmail: targetUser ? targetUser.email : (req.body.email || 'user@example.com'),
      amountINR: inrAmount,
      baseUSD: baseUSD,
      bonusUSD: bonusUSD,
      bonusPercent: 10,
      amountUSD: usdAmount,
      amount: usdAmount,
      creditedAmount: 0,
      exchangeRate: EXCHANGE_RATE,
      status: 'Pending',
    });

    // Trigger automated Telegram notification to Admin (Awaited so Vercel doesn't terminate before delivery)
    try {
      await sendDepositNotification({
        userEmail: newPayment.userEmail,
        amountINR: inrAmount,
        baseUSD: baseUSD,
        bonusUSD: bonusUSD,
        totalUSD: usdAmount,
        imageUrl: result.secure_url,
        paymentId: newPayment._id
      });
    } catch (notifErr) {
      console.error('Telegram notification error:', notifErr.message);
    }

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

// 3. Admin Approves INR Amount & Credits to User Live Balance (Includes 10% Bonus)
exports.updatePaymentAmount = async (req, res) => {
  try {
    const { id } = req.params;
    const { amountINR, amountUSD, exchangeRate } = req.body;

    const rate = Number(exchangeRate) || EXCHANGE_RATE;
    const inrValue = Number(amountINR) || 0;
    const baseUSD = Number((inrValue / rate).toFixed(2));
    const bonusUSD = Number((baseUSD * 0.10).toFixed(2));
    const totalWithBonus = Number((baseUSD + bonusUSD).toFixed(2));

    const usdValue = (amountUSD !== undefined && !isNaN(Number(amountUSD)))
      ? Number(Number(amountUSD).toFixed(2))
      : totalWithBonus;

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
    payment.baseUSD = baseUSD;
    payment.bonusUSD = bonusUSD;
    payment.bonusPercent = 10;
    payment.amountUSD = usdValue;
    payment.amount = usdValue;
    payment.creditedAmount = usdValue;
    payment.exchangeRate = rate;
    payment.status = 'Approved';
    await payment.save();

    console.log(`[Admin Payment Update] ✅ User ${payment.userEmail}: Converted ₹${inrValue} INR -> $${usdValue} USD (Base: $${baseUSD} + 10% Bonus: $${bonusUSD}). New Live Balance: $${targetUser ? targetUser.balance : usdValue}`);

    res.json({
      success: true,
      message: `USD $${usdValue} (₹${inrValue} INR with 10% bonus) user live balance me successfully credit ho gaya!`,
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

// 5. Get User Live Balance (Strictly Isolated by User ID / Email)
exports.getUserLiveBalance = async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'] || req.headers['user-id'];
    const email = req.query.email || req.headers['x-user-email'] || req.headers['user-email'];

    let targetUser = null;
    if (userId && userId.toString().length === 24) {
      targetUser = await User.findById(userId);
    }
    if (!targetUser && email) {
      targetUser = await User.findOne({ email: email.toLowerCase() });
    }

    // Default balance for new/unspecified user is 0.00
    if (!targetUser) {
      return res.json({ 
        success: true, 
        balance: 0, 
        liveBalance: 0,
        user: null 
      });
    }

    res.json({ 
      success: true, 
      balance: Number(targetUser.balance || 0), 
      liveBalance: Number(targetUser.balance || 0),
      user: targetUser 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching balance' });
  }
};

// 6. Direct Set User Balance
exports.setUserBalance = async (req, res) => {
  try {
    const { balanceUSD, balanceINR, userId, email } = req.body;
    let targetUser = await getOrCreateTargetUser(userId, email);

    if (!targetUser && email) {
      targetUser = await User.findOne({ email: email.toLowerCase() });
    }

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
    res.status(500).json({ success: false, message: 'Server error setting balance' });
  }
};

// 7. Invest Deduction from Live Balance
exports.investTrade = async (req, res) => {
  try {
    const { userId, email, amountUSD, asset } = req.body;
    const investAmount = Number(amountUSD);

    if (!investAmount || investAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid investment amount!' });
    }

    let targetUser = null;
    if (userId && userId.toString().length === 24) {
      targetUser = await User.findById(userId);
    }
    if (!targetUser && email) {
      targetUser = await User.findOne({ email: email.toLowerCase() });
    }

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found!' });
    }

    const currentBal = Number(targetUser.balance || 0);
    if (investAmount > currentBal) {
      return res.status(400).json({ success: false, message: 'Insufficient live balance to invest!' });
    }

    targetUser.balance = Number((currentBal - investAmount).toFixed(2));
    await targetUser.save();

    console.log(`[Investment Deduction] ✅ User ${targetUser.email} invested $${investAmount} in ${asset || 'Asset'}. Remaining balance: $${targetUser.balance}`);

    res.json({
      success: true,
      message: `Successfully invested $${investAmount} in ${asset || 'Asset'}!`,
      liveBalance: targetUser.balance,
      balance: targetUser.balance,
      user: targetUser
    });
  } catch (error) {
    console.error('Error in investTrade:', error);
    res.status(500).json({ success: false, message: 'Server error during investment' });
  }
};

// 8. User Creates Bank Withdrawal Request
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

// 9. Get All Withdrawals for Admin Panel
exports.getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().sort({ createdAt: -1 });
    res.json({ success: true, withdrawals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch withdrawals' });
  }
};

// 10. Admin Marks Withdrawal Transferred / Approved
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