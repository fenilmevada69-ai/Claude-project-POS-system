export const generateGSTBill = (order, showToast = null) => {
  const numToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if ((num = num.toString()).length > 9) return 'overflow';
    let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim();
  };

  const w = window.open('', '_blank');
  if (!w) {
    if (showToast) showToast('Please allow popups to download GST Bill', 'error');
    return;
  }

  const itemsHtml = order.items.map((item, index) => {
    const taxableAmount = (item.unitPrice * item.quantity) / 1.18;
    const sku = item.product?.sku || item.sku || '';
    const name = item.product?.name || item.name || '';
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${name}<br><small style="color:#666">${sku}</small></td>
        <td>8471</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">₹${item.unitPrice.toFixed(2)}</td>
        <td style="text-align:right">₹${taxableAmount.toFixed(2)}</td>
        <td style="text-align:center">18%</td>
        <td style="text-align:right">₹${item.subtotal.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  const subtotal = order.subtotal || order.total;
  const taxableSubtotal = subtotal / 1.18;
  const totalTax = subtotal - taxableSubtotal;

  let discountRow = '';
  if (order.discountAmount > 0) {
    discountRow = '<tr><td>Discount</td><td>-₹' + order.discountAmount.toFixed(2) + '</td></tr>';
  }

  w.document.write(`<!DOCTYPE html>
<html>
<head>
<title>GST Invoice - ${order.orderNumber}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 40px; color: #000; }
  
  /* HEADER */
  .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
  .company-name { font-size: 24px; font-weight: bold; color: #1a1a2e; }
  .invoice-title { font-size: 18px; font-weight: bold; text-align: right; }
  .invoice-title span { 
    background: #7c3aed; color: white; 
    padding: 4px 12px; border-radius: 4px; font-size: 13px;
  }
  
  /* DIVIDER */
  hr { border: 2px solid #7c3aed; margin: 16px 0; }
  
  /* SELLER & BUYER INFO */
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  .info-box h4 { font-size: 11px; color: #666; text-transform: uppercase; margin-bottom: 6px; }
  .info-box p { margin: 2px 0; font-size: 13px; }
  
  /* INVOICE META */
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; 
               border: 1px solid #ddd; margin-bottom: 20px; }
  .meta-cell { padding: 8px 12px; border-right: 1px solid #ddd; }
  .meta-cell:last-child { border-right: none; }
  .meta-cell label { font-size: 10px; color: #666; display: block; }
  .meta-cell span { font-size: 13px; font-weight: 600; }
  
  /* ITEMS TABLE */
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  thead tr { background: #1a1a2e; color: white; }
  th { padding: 10px 12px; text-align: left; font-size: 12px; }
  td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #eee; }
  tr:nth-child(even) { background: #f9f9f9; }
  
  /* Table columns */
  .col-no { width: 5%; }
  .col-item { width: 35%; }
  .col-hsn { width: 10%; }
  .col-qty { width: 8%; text-align: center; }
  .col-rate { width: 12%; text-align: right; }
  .col-taxable { width: 12%; text-align: right; }
  .col-gst { width: 8%; text-align: center; }
  .col-total { width: 10%; text-align: right; }
  
  /* TOTALS */
  .totals-section { display: flex; justify-content: flex-end; margin-bottom: 20px; }
  .totals-table { width: 320px; }
  .totals-table tr td { padding: 6px 12px; font-size: 13px; border: none; }
  .totals-table tr td:last-child { text-align: right; font-weight: 600; }
  .grand-total td { 
    background: #1a1a2e; color: white; font-size: 15px; 
    font-weight: bold; padding: 10px 12px; 
  }
  
  /* TAX SUMMARY */
  .tax-summary { margin-bottom: 20px; }
  .tax-summary h4 { font-size: 12px; margin-bottom: 8px; }
  .tax-table { width: 100%; border-collapse: collapse; }
  .tax-table th, .tax-table td { 
    border: 1px solid #ddd; padding: 6px 10px; 
    font-size: 12px; text-align: center; 
  }
  .tax-table th { background: #f0f0f0; }
  
  /* AMOUNT IN WORDS */
  .amount-words { 
    background: #f9f9f9; border: 1px solid #ddd;
    padding: 10px 14px; margin-bottom: 20px; font-size: 12px;
  }
  
  /* FOOTER */
  .footer { display: flex; justify-content: space-between; margin-top: 40px; }
  .footer-note { font-size: 11px; color: #666; max-width: 60%; }
  .signature { text-align: center; }
  .signature-line { border-top: 1px solid #000; width: 150px; margin: 40px auto 4px; }
  
  /* WATERMARK for paid */
  .paid-stamp {
    position: fixed; top: 40%; left: 30%;
    font-size: 80px; color: rgba(0,180,0,0.15);
    font-weight: bold; transform: rotate(-35deg);
    pointer-events: none; z-index: 0;
  }
  
  @media print {
    body { margin: 20px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>

<div class="paid-stamp">PAID</div>

<!-- HEADER -->
<div class="header">
<div>
  <div class="company-name">LUMINA POS</div>
  <p style="margin:2px 0;font-size:13px">123 Business Street, City - 380001</p>
  <p style="margin:2px 0;font-size:13px">Phone: +91 98765 43210 | Email: info@lumina.pos</p>
  <p style="margin:2px 0;font-size:13px"><strong>GSTIN:</strong> 24XXXXX1234X1ZX</p>
</div>
<div style="text-align:right">
  <div class="invoice-title">
    TAX INVOICE<br>
    <span>ORIGINAL FOR RECIPIENT</span>
  </div>
</div>
</div>

<hr>

<!-- INVOICE META -->
<div class="meta-grid">
<div class="meta-cell">
  <label>Invoice Number</label>
  <span>${order.orderNumber}</span>
</div>
<div class="meta-cell">
  <label>Invoice Date</label>
  <span>${new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
</div>
<div class="meta-cell">
  <label>Payment Mode</label>
  <span>${order.paymentMethod.toUpperCase()}</span>
</div>
</div>

<!-- SELLER & BUYER -->
<div class="info-grid">
<div class="info-box">
  <h4>Bill From (Seller)</h4>
  <p><strong>Lumina Retail Pvt. Ltd.</strong></p>
  <p>123 Business Street</p>
  <p>Ahmedabad, Gujarat - 380001</p>
  <p>GSTIN: 24XXXXX1234X1ZX</p>
  <p>State: Gujarat (24)</p>
</div>
<div class="info-box">
  <h4>Bill To (Buyer)</h4>
  <p><strong>Walk-in Customer</strong></p>
  <p>Retail Purchase</p>
  <p>Cashier: ${order.cashier?.name || 'Staff'}</p>
  <p>Terminal: POS-01</p>
</div>
</div>

<!-- ITEMS TABLE -->
<table>
<thead>
  <tr>
    <th class="col-no">#</th>
    <th class="col-item">Item Description</th>
    <th class="col-hsn">HSN Code</th>
    <th class="col-qty">Qty</th>
    <th class="col-rate">Unit Price</th>
    <th class="col-taxable">Taxable Amt</th>
    <th class="col-gst">GST %</th>
    <th class="col-total">Total</th>
  </tr>
</thead>
<tbody>
  ${itemsHtml}
</tbody>
</table>

<!-- TOTALS -->
<div class="totals-section">
<table class="totals-table">
  <tr><td>Subtotal (Taxable)</td><td>₹${taxableSubtotal.toFixed(2)}</td></tr>
  <tr><td>CGST (9%)</td><td>₹${(totalTax / 2).toFixed(2)}</td></tr>
  <tr><td>SGST (9%)</td><td>₹${(totalTax / 2).toFixed(2)}</td></tr>
  ${discountRow}
  <tr class="grand-total"><td>GRAND TOTAL</td><td>₹${order.total.toFixed(2)}</td></tr>
</table>
</div>

<!-- AMOUNT IN WORDS -->
<div class="amount-words">
<strong>Amount in Words:</strong> 
${numToWords(Math.round(order.total))} Rupees Only
</div>

<!-- TAX SUMMARY TABLE -->
<div class="tax-summary">
<h4>GST Tax Summary</h4>
<table class="tax-table">
  <tr>
    <th>HSN Code</th><th>Taxable Amt</th>
    <th>CGST 9%</th><th>SGST 9%</th><th>Total Tax</th>
  </tr>
  <tr>
    <td>8471</td>
    <td>₹${taxableSubtotal.toFixed(2)}</td>
    <td>₹${(totalTax / 2).toFixed(2)}</td>
    <td>₹${(totalTax / 2).toFixed(2)}</td>
    <td>₹${totalTax.toFixed(2)}</td>
  </tr>
</table>
</div>

<!-- FOOTER -->
<div class="footer">
<div class="footer-note">
  <p>• This is a computer generated invoice</p>
  <p>• Goods once sold will not be taken back</p>
  <p>• Subject to Ahmedabad jurisdiction</p>
  <p style="margin-top:8px;color:#7c3aed">
    <strong>Powered by Lumina POS</strong>
  </p>
</div>
<div class="signature">
  <div class="signature-line"></div>
  <p style="font-size:12px">Authorized Signatory</p>
  <p style="font-size:11px;color:#666">Lumina Retail Pvt. Ltd.</p>
</div>
</div>

<!-- PRINT BUTTON (hidden when printing) -->
<div class="no-print" style="text-align:center;margin-top:30px">
<button onclick="window.print()" 
  style="background:#7c3aed;color:white;border:none;
         padding:12px 32px;border-radius:6px;font-size:15px;cursor:pointer">
  🖨️ Print / Save as PDF
</button>
<button onclick="window.close()"
  style="background:#eee;color:#333;border:none;
         padding:12px 32px;border-radius:6px;font-size:15px;
         cursor:pointer;margin-left:12px">
  ✕ Close
</button>
</div>

<script>
// Auto-trigger print dialog when fully loaded
window.onload = function() {
  setTimeout(function() {
    window.print();
  }, 500);
};
</script>
</body>
</html>`);
  w.document.close();
};
