const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  violationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Violation',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'Card', 'NetBanking', 'Cash'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Success', 'Failed', 'Pending'],
    default: 'Success'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
