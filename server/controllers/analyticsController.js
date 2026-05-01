const Violation = require('../models/Violation');
const Payment = require('../models/Payment');

// @desc    Get analytics data
// @route   GET /api/analytics
// @access  Private/Admin
const getAnalytics = async (req, res, next) => {
  try {
    const totalViolations = await Violation.countDocuments();
    const paidViolations = await Violation.countDocuments({ status: 'Paid' });
    const pendingViolations = await Violation.countDocuments({ status: 'Pending' });

    const totalRevenueResult = await Payment.aggregate([
      { $match: { paymentStatus: 'Success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    // Common violations
    const commonViolations = await Violation.aggregate([
      { $group: { _id: '$violationType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Daily trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyTrends = await Violation.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    // Repeat offenders (>3 violations)
    const repeatOffenders = await Violation.aggregate([
      { $group: { _id: '$vehicleNumber', count: { $sum: 1 }, ownerName: { $first: '$ownerName' } } },
      { $match: { count: { $gt: 3 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      summary: {
        totalViolations,
        paidViolations,
        pendingViolations,
        totalRevenue
      },
      commonViolations,
      dailyTrends,
      repeatOffenders
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics };
