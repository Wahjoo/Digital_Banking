const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountNumber: { type: String, required: true, unique: true },
  accountName: { type: String, required: true },
  bankCode: { type: String },
  bankName: { type: String },
  balance: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Account', accountSchema);
