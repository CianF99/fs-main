const Dispute = require('../models/Dispute');
const Violation = require('../models/Violation');
const User = require('../models/User');

// @desc    Raise a new dispute
// @route   POST /api/disputes
// @access  Private (User)
const raiseDispute = async (req, res, next) => {
  try {
    const { violationId, reason, proofImageUrl } = req.body;

    const violation = await Violation.findById(violationId);
    if (!violation) {
      res.status(404);
      throw new Error('Violation not found');
    }

    if (violation.status === 'Paid') {
      res.status(400);
      throw new Error('Cannot dispute a paid violation');
    }

    const dispute = await Dispute.create({
      violationId,
      userId: req.user._id,
      reason,
      proofImageUrl: proofImageUrl || ''
    });

    res.status(201).json(dispute);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all disputes
// @route   GET /api/disputes
// @access  Private
const getDisputes = async (req, res, next) => {
  try {
    // Users see their own disputes, Admins/Police see all
    const filter = {};
    if (req.user.role === 'User') {
      filter.userId = req.user._id;
    }
    
    const disputes = await Dispute.find(filter)
      .populate('violationId')
      .populate('userId', 'name email')
      .sort('-createdAt');
    res.json(disputes);
  } catch (error) {
    next(error);
  }
};

// @desc    Update dispute status (Accept/Reject)
// @route   PUT /api/disputes/:id
// @access  Private (Admin/Police)
const updateDisputeStatus = async (req, res, next) => {
  try {
    const { status, adminComments } = req.body;
    const dispute = await Dispute.findById(req.params.id);

    if (!dispute) {
      res.status(404);
      throw new Error('Dispute not found');
    }

    dispute.status = status || dispute.status;
    if (adminComments) dispute.adminComments = adminComments;

    const updatedDispute = await dispute.save();

    // If accepted, waive the fine and return points
    if (status === 'Accepted') {
      const violation = await Violation.findById(dispute.violationId);
      if (violation) {
        violation.fineAmount = 0;
        await violation.save();
        
        const user = await User.findById(dispute.userId);
        if (user) {
          user.driverScore += 10; // return deducted points
          if (user.driverScore > 100) user.driverScore = 100;
          if (user.driverScore > 50 && user.isFlagged) {
            user.isFlagged = false;
          }
          await user.save();
        }
      }
    }

    res.json(updatedDispute);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  raiseDispute,
  getDisputes,
  updateDisputeStatus
};
