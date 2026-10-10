

// const mongoose = require('mongoose');

// const paymentSchema = new mongoose.Schema(
//   {
//     imageUrl: { type: String, required: true },
//     publicId: { type: String, required: true },
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     userEmail: { type: String, default: '' },
//     amountINR: { type: Number, default: 0 },
//     amountUSD: { type: Number, default: 0 },
//     amount: { type: Number, default: 0 },
//     creditedAmount: { type: Number, default: 0 },
//     exchangeRate: { type: Number, default: 96 },
//     status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('Payment', paymentSchema);


const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userEmail: { type: String, default: '' },
    amountINR: { type: Number, default: 0 },
    amountUSD: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    creditedAmount: { type: Number, default: 0 },
    exchangeRate: { type: Number, default: 96 },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);