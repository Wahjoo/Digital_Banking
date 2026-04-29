const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  senderAccount: { type: String, required: true },
  recipientAccount: { type: String, required: true },
  recipientName: { type: String },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['intra', 'inter'], required: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  narration: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
