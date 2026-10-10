const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userEmail: { type: String, required: true },
    accountHolderName: { type: String, required: true },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    amountUSD: { type: Number, required: true },
    amountINR: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Transferred', 'Rejected'], default: 'Pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Withdrawal', withdrawalSchema);