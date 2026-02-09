const Order = require("../models/orderSchema");
const Product = require("../models/productSchema");
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
    console.log("✅ Logo loaded");
} catch (err) {
    console.log("⚠️ Logo not found, continuing without logo");
}

/* ---------- CONTROLLER ---------- */
module.exports = {
    invoice: async (req, res) => {
        try {
            console.log("🔹 Invoice request received");

            const orderId = req.query.id;
            if (!orderId) {
                return res.status(400).send("Order ID missing");
            }

            const order = await Order.findById(orderId).lean();
            if (!order) {
                return res.status(404).send("Order not found");
            }

            const user = await User.findById(order.userId).lean();
            if (!user) {
                return res.status(404).send("User not found");
            }

            /* ---------- PREPARE PRODUCTS ---------- */
            let products = [];
            let subTotal = 0;

            for (const item of order.product) {
                const prod = await Product.findById(item._id).lean();
                if (!prod) continue;

                const total = prod.salePrice * item.quantity;
                subTotal += total;

                products.push({
                    name: prod.productName,
                    price: prod.salePrice,
                    qty: item.quantity,
                    total
                });
            }

            const discount = subTotal - order.totalPrice;
            const invoiceDate = new Date(order.createdOn).toLocaleDateString("en-IN");

            console.log("🔹 Subtotal:", subTotal);
            console.log("🔹 Discount:", discount);
            console.log("🔹 Grand Total:", order.totalPrice);

            /* ---------- HTML TEMPLATE ---------- */
            const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Invoice</title>
<style>
body { font-family: Arial, sans-serif; padding: 40px; font-size: 14px; }
.header { display: flex; justify-content: space-between; align-items: center; }
.logo { height: 70px; }
table { width: 100%; border-collapse: collapse; margin-top: 25px; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
th { background: #f5f5f5; }
.total { margin-top: 20px; text-align: right; }
.footer { margin-top: 40px; text-align: center; font-size: 12px; }
</style>
</head>
<body>

<div class="header">
    <div>
        <h2>Think Thankz</h2>
        <p>WhiteField, Silk Board Road<br>Bangalore, India</p>
        <p>Phone: +91 9876543210<br>Email: support@thinkthankz.com</p>
    </div>
    ${logoBase64 ? `<img class="logo" src="data:image/png;base64,${logoBase64}"/>` : ""}
</div>

<hr>

<p>
<b>Invoice No:</b> INV-${String(order._id).slice(-8)}<br>
<b>Date:</b> ${invoiceDate}<br>
<b>Customer:</b> ${user.name || "Customer"}
</p>

<table>
<thead>
<tr>
    <th>Product</th>
    <th>Price</th>
    <th>Qty</th>
    <th>Total</th>
</tr>
</thead>
<tbody>
${products.map(p => `
<tr>
<td>${p.name}</td>
<td>₹${p.price}</td>
<td>${p.qty}</td>
<td>₹${p.total}</td>
</tr>
`).join("")}
</tbody>
</table>

<div class="total">
<p><b>Subtotal:</b> ₹${subTotal}</p>
<p><b>Discount:</b> ₹${discount}</p>
<p><b>Grand Total:</b> ₹${order.totalPrice}</p>
</div>

<div class="footer">
<p>Thank you for shopping with Think Thankz ❤️</p>
</div>

</body>
</html>
`;

            /* ---------- GENERATE PDF ---------- */
            const browser = await puppeteer.launch({
                headless: "new",
                args: ["--no-sandbox", "--disable-setuid-sandbox"]
            });

            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: "networkidle0" });

            const pdfUint8 = await page.pdf({
                format: "A4",
                printBackground: true
            });

            await browser.close();

            const pdfBuffer = Buffer.from(pdfUint8);
            console.log("✅ PDF size:", pdfBuffer.length);

            /* ---------- SEND RESPONSE ---------- */
            res.set({
                "Content-Type": "application/pdf",
                "Content-Length": pdfBuffer.length,
                "Content-Disposition": `attachment; filename=invoice-${order._id}.pdf`
            });

            res.end(pdfBuffer);
            console.log("✅ Invoice sent successfully");

        } catch (error) {
            console.error("❌ Invoice Error:", error);
            res.status(500).send("Invoice generation failed");
        }
    }
};
