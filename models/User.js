// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   nickname: { type: String, default: '' },
//   firstName: { type: String, default: '' },
//   lastName: { type: String, default: '' },
//   dateOfBirth: { type: String, default: '' },
//   aadhaar: { type: String, default: '' },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   country: { type: String, default: 'India' },
//   address: { type: String, default: '' },
//   balance: { type: Number, default: 0 },
//   avatarEmoji: { type: String, default: '👨‍💻' },
//   isVerified: { type: Boolean, default: false }
// }, { timestamps: true });

// module.exports = mongoose.model('User', userSchema);


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nickname: { type: String, default: '' },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  dateOfBirth: { type: String, default: '' },
  aadhaar: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  country: { type: String, default: 'India' },
  address: { type: String, default: '' },
  balance: { type: Number, default: 0 },
  avatarEmoji: { type: String, default: '👨‍💻' },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);