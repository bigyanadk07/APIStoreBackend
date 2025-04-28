const Package = require('../models/Package');
const Subscription = require('../models/Subscription');
const paymentService = require('../services/paymentService');

// Get all packages
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find().populate('apis', 'name description category');
    
    res.json(packages.map(pkg => ({
      id: pkg._id,
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      billingCycle: pkg.billingCycle,
      features: pkg.features,
      isPopular: pkg.isPopular,
      apis: pkg.apis
    })));
  } catch (err) {
    console.error('Get packages error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get package by ID
exports.getPackageById = async (req, res) => {
  try {
    const package = await Package.findById(req.params.id).populate('apis', 'name description category');
    
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    res.json({
      id: package._id,
      name: package.name,
      description: package.description,
      price: package.price,
      billingCycle: package.billingCycle,
      features: package.features,
      isPopular: package.isPopular,
      apis: package.apis
    });
  } catch (err) {
    console.error('Get package error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Subscribe to a package
exports.subscribeToPackage = async (req, res) => {
  try {
    const { packageId, paymentDetails } = req.body;
    
    if (!packageId || !paymentDetails) {
      return res.status(400).json({ message: 'Package ID and payment details are required' });
    }
    
    // Check if user already has an active subscription to this package
    const existingSubscription = await Subscription.findOne({
      userId: req.user._id,
      packageId,
      status: 'active'
    });
    
    if (existingSubscription) {
      return res.status(400).json({ 
        message: 'You already have an active subscription to this package' 
      });
    }
    
    // Process payment and create subscription
    const result = await paymentService.processPayment(
      req.user._id, 
      packageId, 
      paymentDetails
    );
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }
    
    res.json({
      success: true,
      subscription: {
        id: result.subscription._id,
        status: result.subscription.status,
        currentPeriodStart: result.subscription.currentPeriodStart,
        currentPeriodEnd: result.subscription.currentPeriodEnd
      }
    });
  } catch (err) {
    console.error('Package subscription error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's subscriptions
exports.getUserSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      userId: req.user._id
    }).populate('packageId');
    
    res.json(subscriptions.map(sub => ({
      id: sub._id,
      package: {
        id: sub.packageId._id,
        name: sub.packageId.name,
        price: sub.packageId.price,
        billingCycle: sub.packageId.billingCycle
      },
      status: sub.status,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      createdAt: sub.createdAt
    })));
  } catch (err) {
    console.error('Get user subscriptions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId: req.user._id
    });
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    // Call payment service to cancel subscription
    const result = await paymentService.cancelSubscription(subscriptionId);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }
    
    // Update subscription status
    subscription.status = 'cancelled';
    await subscription.save();
    
    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (err) {
    console.error('Cancel subscription error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update subscription package
exports.updateSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { newPackageId } = req.body;
    
    if (!newPackageId) {
      return res.status(400).json({ message: 'New package ID is required' });
    }
    
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId: req.user._id,
      status: 'active'
    });
    
    if (!subscription) {
      return res.status(404).json({ message: 'Active subscription not found' });
    }
    
    // Call payment service to update subscription
    const result = await paymentService.updateSubscription(
      subscriptionId,
      newPackageId
    );
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }
    
    res.json({
      success: true,
      subscription: {
        id: result.subscription._id,
        status: result.subscription.status,
        currentPeriodStart: result.subscription.currentPeriodStart,
        currentPeriodEnd: result.subscription.currentPeriodEnd
      }
    });
  } catch (err) {
    console.error('Update subscription error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};