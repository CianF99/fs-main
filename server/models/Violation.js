const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  violationType: {
    type: String,
    required: true
  },
  wheelerType: {
    type: String,
    enum: ['2-Wheeler', '3-Wheeler', '4-Wheeler', 'Heavy Vehicle'],
    default: '4-Wheeler',
    required: true
  },
  fineAmount: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Violation', violationSchema);
