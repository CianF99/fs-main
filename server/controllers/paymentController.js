const Payment = require('../models/Payment');
const Violation = require('../models/Violation');

// @desc    Process a mock payment
// @route   POST /api/payments
// @access  Private
const processPayment = async (req, res, next) => {
  try {
    const { violationId, amount, paymentMethod } = req.body;

    const violation = await Violation.findById(violationId);

    if (!violation) {
      res.status(404);
      throw new Error('Violation not found');
    }

    if (violation.status === 'Paid') {
      res.status(400);
      throw new Error('Violation is already paid');
    }

    // Mock payment successful creation
    const payment = await Payment.create({
      violationId,
      amount,
      paymentMethod,
      paymentStatus: 'Success'
    });

    // Update violation status
    violation.status = 'Paid';
    await violation.save();

    // Reward / Penalty System: Increase score on successful payment
    const User = require('../models/User');
    const user = await User.findOne({ name: violation.ownerName });
    if (user) {
      user.driverScore += 5; // Reward with 5 points
      if (user.driverScore > 100) user.driverScore = 100;
      
      // Remove flag if score improves above 50
      if (user.driverScore > 50 && user.isFlagged) {
        user.isFlagged = false;
      }
      
      await user.save();
    }

    res.status(201).json({ message: 'Payment successful', payment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin
const getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({}).populate('violationId').sort('-createdAt');
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

module.exports = { processPayment, getPayments };
