// services/paymentService.js
const stripe = require('stripe')(require('../config/default').stripeSecretKey);
const Package = require('../models/Package');
const Subscription = require('../models/Subscription');

// Create a billing cycle duration in days
const getBillingCycleDuration = (billingCycle) => {
  switch (billingCycle) {
    case 'monthly': 
      return 30;
    case 'quarterly': 
      return 90;
    case 'yearly': 
      return 365;
    default: 
      return 30;
  }
};

// Process payment
exports.processPayment = async (userId, packageId, paymentDetails) => {
  try {
    const package = await Package.findById(packageId);
    if (!package) {
      throw new Error('Package not found');
    }

    let paymentIntentId = null;

    if (paymentDetails.method === 'eSewa' || paymentDetails.method === 'Khalti') {
      // Handle eSewa/Khalti manually
      // No Stripe call here
      console.log(`Received ${paymentDetails.method} payment. Number: ${paymentDetails.cardNumber}`);
    } else if (paymentDetails.method === 'Card') {
      // Only now call Stripe!
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(package.price * 100),
        currency: 'usd',
        payment_method: paymentDetails.paymentMethodId,
        confirm: true,
        description: `Subscription to ${package.name} package`,
        metadata: { userId, packageId }
      });

      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment failed');
      }

      paymentIntentId = paymentIntent.id;
    } else {
      throw new Error('Unsupported payment method');
    }

    // Now create the subscription record
    const now = new Date();
    const cycleDuration = getBillingCycleDuration(package.billingCycle);
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + cycleDuration);

    const subscription = new Subscription({
      userId,
      packageId,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: endDate,
      paymentDetails: {
        paymentIntentId,
        amount: package.price,
        currency: 'usd',
        billingCycle: package.billingCycle,
        paymentMethod: paymentDetails.method,
        externalTransactionId: paymentDetails.cardNumber // if you want to store eSewa/Khalti reference
      }
    });

    await subscription.save();

    return {
      success: true,
      subscription
    };
  } catch (err) {
    console.error('Payment processing error:', err);
    return {
      success: false,
      error: err.message
    };
  }
};


// Cancel subscription
exports.cancelSubscription = async (subscriptionId, userId) => {
  try {
    const subscription = await Subscription.findOne({ 
      _id: subscriptionId, 
      userId 
    });
    
    if (!subscription) {
      throw new Error('Subscription not found');
    }
    
    subscription.status = 'canceled';
    await subscription.save();
    
    return {
      success: true,
      subscription
    };
  } catch (err) {
    console.error('Subscription cancellation error:', err);
    return {
      success: false,
      error: err.message
    };
  }
};

// Check and renew subscriptions
exports.checkAndRenewSubscriptions = async () => {
  try {
    const now = new Date();
    
    // Find subscriptions that are about to expire and are active
    const subscriptionsToRenew = await Subscription.find({
      status: 'active',
      currentPeriodEnd: { $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) } // Within 24 hours
    }).populate('packageId');
    
    for (const subscription of subscriptionsToRenew) {
      try {
        // Renew the subscription - in a real system, you would charge the customer again
        // For now, we'll just update the dates
        const package = subscription.packageId;
        const cycleDuration = getBillingCycleDuration(package.billingCycle);
        
        const newStartDate = new Date(subscription.currentPeriodEnd);
        const newEndDate = new Date(newStartDate);
        newEndDate.setDate(newEndDate.getDate() + cycleDuration);
        
        subscription.currentPeriodStart = newStartDate;
        subscription.currentPeriodEnd = newEndDate;
        
        await subscription.save();
        
        console.log(`Renewed subscription ${subscription._id} for user ${subscription.userId}`);
      } catch (err) {
        console.error(`Failed to renew subscription ${subscription._id}:`, err);
        
        // Mark as past_due if renewal fails
        subscription.status = 'past_due';
        await subscription.save();
      }
    }
    
    return true;
  } catch (err) {
    console.error('Subscription renewal error:', err);
    return false;
  }
};