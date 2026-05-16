const Product = require('../models/Product');
const { sendEmail, getLowStockTemplate } = require('./emailService');

const LAST_ALERT_SENT = new Map(); // In-memory cache for demo, better to store in DB

exports.checkAndSendLowStockAlerts = async () => {
  try {
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    });

    if (lowStockProducts.length === 0) return;

    // Filter out products that were alerted in the last 24 hours
    const now = Date.now();
    const productsToAlert = lowStockProducts.filter(p => {
      const lastAlert = LAST_ALERT_SENT.get(p._id.toString());
      if (!lastAlert || (now - lastAlert) > 24 * 60 * 60 * 1000) {
        return true;
      }
      return false;
    });

    if (productsToAlert.length === 0) return;

    await sendEmail({
      subject: '⚠️ Low Stock Alert - Lumina POS',
      html: getLowStockTemplate(productsToAlert)
    });

    // Update last alert sent timestamp
    productsToAlert.forEach(p => {
      LAST_ALERT_SENT.set(p._id.toString(), now);
    });

    console.log(`✅ Sent low stock alert for ${productsToAlert.length} products`);
  } catch (error) {
    console.error('❌ Failed to check/send low stock alerts:', error);
  }
};
