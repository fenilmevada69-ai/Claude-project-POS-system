const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Lumina POS" <${process.env.EMAIL_USER}>`,
      to: to || process.env.ALERT_EMAIL,
      subject,
      html,
    });
    console.log('📧 Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email failed:', error);
    throw error;
  }
};

exports.getLowStockTemplate = (products) => {
  const rows = products.map(p => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px;">${p.name}</td>
      <td style="padding: 12px;"><code style="background: #f4f4f4; padding: 2px 4px; border-radius: 4px;">${p.sku}</code></td>
      <td style="padding: 12px; font-weight: bold; color: ${p.stock === 0 ? '#ef4444' : '#f59e0b'}">
        ${p.stock}
      </td>
      <td style="padding: 12px; color: #666;">${p.lowStockThreshold}</td>
      <td style="padding: 12px;">
        <span style="padding: 4px 8px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; 
          background: ${p.stock === 0 ? '#fee2e2' : '#fef3c7'}; 
          color: ${p.stock === 0 ? '#991b1b' : '#92400e'}">
          ${p.stock === 0 ? 'Out of Stock' : 'Low Stock'}
        </span>
      </td>
    </tr>
  `).join('');

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">Lumina POS</h1>
        <p style="margin: 8px 0 0; opacity: 0.8;">Automated Inventory Alert</p>
      </div>
      <div style="padding: 24px;">
        <h2 style="color: #1e293b; margin-top: 0;">⚠️ Low Stock Alert</h2>
        <p style="color: #64748b; line-height: 1.5;">The following products have reached or fallen below their minimum stock threshold:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
          <thead>
            <tr style="text-align: left; border-bottom: 2px solid #f1f5f9; color: #94a3b8; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em;">
              <th style="padding: 12px;">Product</th>
              <th style="padding: 12px;">SKU</th>
              <th style="padding: 12px;">Current</th>
              <th style="padding: 12px;">Limit</th>
              <th style="padding: 12px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div style="margin-top: 32px; text-align: center;">
          <a href="${process.env.CLIENT_URL}/inventory" style="background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Manage Inventory</a>
        </div>
      </div>
      <div style="background: #f8fafc; padding: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
        This is an automated alert from Lumina POS. Please do not reply to this email.
      </div>
    </div>
  `;
};
