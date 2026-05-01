const Violation = require('../models/Violation');

// Helper to auto-calculate fine
const calculateFine = (violationType) => {
  const fines = {
    'No Helmet': 500,
    'Signal Jump': 1000,
    'Overspeed': 1500,
    'Parking': 700
  };
  return fines[violationType] || 0;
};

// @desc    Get all violations
// @route   GET /api/violations
// @access  Private
const getViolations = async (req, res, next) => {
  try {
    const filter = {};
    
    // Users can only see their own violations
    if (req.user.role === 'User') {
      filter.ownerName = req.user.name; // In a real app, this should match by ID or a unique identifier
    }

    const violations = await Violation.find(filter).populate('createdBy', 'name email').sort('-createdAt');
    res.json(violations);
  } catch (error) {
    next(error);
  }
};

// @desc    Get violation by ID
// @route   GET /api/violations/:id
// @access  Private
const getViolationById = async (req, res, next) => {
  try {
    const violation = await Violation.findById(req.params.id).populate('createdBy', 'name email');
    if (violation) {
      res.json(violation);
    } else {
      res.status(404);
      throw new Error('Violation not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a violation
// @route   POST /api/violations
// @access  Private/Police or Admin
const createViolation = async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized - user not found');
    }

    const { vehicleNumber, ownerName, violationType, wheelerType, location, imageUrl } = req.body;

    if (!vehicleNumber || !violationType || !wheelerType || !location) {
      res.status(400);
      throw new Error('vehicleNumber, violationType, wheelerType, and location are required');
    }

    let fineAmount = calculateFine(violationType);

    // Reward / Penalty System: Find user and apply logic
    const User = require('../models/User');
    const user = await User.findOne({ name: ownerName });
    
    if (user) {
      if (user.isFlagged) {
        fineAmount = fineAmount * 1.5; // 50% higher fine for flagged users
      }
      
      user.driverScore -= 10; // Deduct 10 points for a violation
      if (user.driverScore < 0) user.driverScore = 0;
      
      if (user.driverScore <= 50) {
        user.isFlagged = true;
      }
      
      await user.save();
    }

    const violation = await Violation.create({
      vehicleNumber,
      ownerName: ownerName || 'Unknown',   // fallback so validation never fails
      violationType,
      wheelerType,
      fineAmount,
      location,
      imageUrl: imageUrl || '',
      createdBy: req.user._id
    });

    res.status(201).json(violation);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a violation
// @route   PUT /api/violations/:id
// @access  Private/Police or Admin
const updateViolation = async (req, res, next) => {
  try {
    const { vehicleNumber, ownerName, violationType, wheelerType, location, imageUrl, status } = req.body;

    const violation = await Violation.findById(req.params.id);

    if (violation) {
      violation.vehicleNumber = vehicleNumber || violation.vehicleNumber;
      violation.ownerName = ownerName || violation.ownerName;
      if (violationType) {
        violation.violationType = violationType;
        violation.fineAmount = calculateFine(violationType);
      }
      violation.wheelerType = wheelerType || violation.wheelerType;
      violation.location = location || violation.location;
      violation.imageUrl = imageUrl || violation.imageUrl;
      violation.status = status || violation.status;

      const updatedViolation = await violation.save();
      res.json(updatedViolation);
    } else {
      res.status(404);
      throw new Error('Violation not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a violation
// @route   DELETE /api/violations/:id
// @access  Private/Police or Admin
const deleteViolation = async (req, res, next) => {
  try {
    const violation = await Violation.findById(req.params.id);

    if (violation) {
      await violation.deleteOne();
      res.json({ message: 'Violation removed' });
    } else {
      res.status(404);
      throw new Error('Violation not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getViolations,
  getViolationById,
  createViolation,
  updateViolation,
  deleteViolation
};
