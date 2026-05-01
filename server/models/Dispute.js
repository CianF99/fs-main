const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  violationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Violation',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  proofImageUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  adminComments: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Dispute', disputeSchema);
