const Order = require("../models/orderSchema");
const User = require("../models/userSchema");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

/* ---------- LOAD LOGO ---------- */
const logoPath = path.join(
  __dirname,
  "../public/user-assets/imgs/theme/ThinkThankz-logo/cover.png"
);

let logoBase64 = "";
try {
  logoBase64 = fs.readFileSync(logoPath, "base64");
} catch (err) {
  console.log("Logo not found");
}

/* ---------- CONTROLLER ---------- */
module.exports = {
  invoice: async (req, res) => {
    try {
      const orderId = req.query.id;

      const order = await Order.findById(orderId).lean();
      const user = await User.findById(order.userId).lean();

      if (!order) return res.status(404).send("Order not found");

      let products = [];
      let subTotal = 0;
      let totalDiscount = 0;

      /* ---------- USE ORDER SNAPSHOT DATA ---------- */
      for (const item of order.product) {
        const regularPrice = item.regularPrice;
        const finalPrice = item.price;

        const regularTotal = regularPrice * item.quantity;
        const finalTotal = finalPrice * item.quantity;
        const discountAmount = regularTotal - finalTotal;
        const productDiscount = regularPrice - finalPrice

        subTotal += regularTotal;
        totalDiscount += discountAmount;

        products.push({
          name: item.name,
          regularPrice,
          finalPrice: finalPrice.toFixed(2),
          qty: item.quantity,
          total: finalTotal.toFixed(2),
          discountAmount: discountAmount.toFixed(2),
          productDiscount : productDiscount.toFixed(2)
        });
      }

      const couponDiscount = order.couponDiscount || 0;
      const grandTotal = order.totalPrice;

      const invoiceDate = new Date(order.createdOn)
        .toLocaleDateString("en-IN");

      /* ---------- HTML TEMPLATE ---------- */
      const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body { font-family: Arial; padding: 40px; font-size: 14px; }
table { width: 100%; border-collapse: collapse; margin-top: 25px; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
th { background: #f5f5f5; }
.total { margin-top: 20px; text-align: right; }
.logo { height: 70px; }
</style>
</head>
<body>

<h2>Think Thankz Invoice</h2>
${logoBase64 ? `<img class="logo" src="data:image/png;base64,${logoBase64}"/>` : ""}

<p>
Invoice: INV-${String(order._id).slice(-8)}<br>
Date: ${invoiceDate}<br>
Customer: ${user?.name || "Customer"}
</p>

<table>
<thead>
<tr>
<th>Product</th>
<th>MRP</th>
<th>Discount</th>
<th>Final Price</th>
<th>Qty</th>
<th>Total</th>
</tr>
</thead>

<tbody>
${products.map(p => `
<tr>
<td>${p.name}</td>
<td>₹${p.regularPrice}</td>
<td>₹${p.productDiscount}</td>
<td>₹${p.finalPrice}</td>
<td>${p.qty}</td>
<td>₹${p.total}</td>
</tr>
`).join("")}
</tbody>
</table>

<div class="total">
<p>Subtotal (MRP): ₹${subTotal.toFixed(2)}</p>
<p>Offer Discount: ₹${totalDiscount.toFixed(2)}</p>
<p>Coupon Discount: ₹${couponDiscount.toFixed(2)}</p>
<hr>
<h3>Grand Total: ₹${grandTotal.toFixed(2)}</h3>
</div>

</body>
</html>
`;

      /* ---------- GENERATE PDF ---------- */
      const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox"]
      });

      const page = await browser.newPage();
      await page.setContent(html);
      const pdf = await page.pdf({ format: "A4" });
      await browser.close();

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${order._id}.pdf`
      });

      res.end(pdf);

    } catch (error) {
      console.log(error);
      res.status(500).send("Invoice generation failed");
    }
  }
};
