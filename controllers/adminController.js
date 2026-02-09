const User = require("../models/userSchema");
const Coupon = require("../models/couponSchema")
const Category = require("../models/categorySchema")
const Product = require("../models/productSchema")
const Order = require("../models/orderSchema")
const moment = require('moment');
const ExcelJS = require("exceljs")
const PDFDocument = require('pdfkit')
const bcrypt = require("bcryptjs");
const Return = require("../models/returnSchema")
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Brand = require("../models/brandSchema")
const puppeteer = require("puppeteer");

// const getDashboard = async (req, res) => {
//     try {
//         res.render("index")
//     } catch (error) {
//         console.log(error.message);
//     }
// }

const getLoginPage = async (req, res) => {
    try {
        res.render("admin-login")
    } catch (error) {
        console.log(error.message);
    }
}


const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        console.log(email)

        const findAdmin = await User.findOne({ email, isAdmin: "1" })
        // console.log("admin data : ", findAdmin);

        if (findAdmin) {
            const passwordMatch = await bcrypt.compare(password, findAdmin.password)
            if (passwordMatch) {
                req.session.admin = true
                console.log("Admin Logged In");
                res.redirect("/admin")
            } else {
                console.log("Password is not correct");
                res.redirect("/admin/login")
            }
        } else {
            console.log("He's not an admin");
        }
    } catch (error) {
        console.log(error.message);
    }
}

const getCouponPageAdmin = async (req, res) => {
    try {
        const findCoupons = await Coupon.find({})
        res.render("coupon", { coupons: findCoupons })
    } catch (error) {
        console.log(error.message);
    }
}

const createCoupon = async (req, res) => {
    try {
        const { couponName, startDate, endDate, offerPrice, minimumPrice } = req.body;

        console.log(req.body)

        // Ensure all required fields are present
        if (!couponName || !startDate || !endDate || !offerPrice || !minimumPrice) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const formattedCouponName = couponName.trim().charAt(0).toUpperCase() + couponName.trim().slice(1);

        const findCoupon = await Coupon.findOne({ name: formattedCouponName });
        if (!findCoupon) {
            const data = {
                couponName: formattedCouponName,
                startDate: new Date(startDate + 'T00:00:00'),
                endDate: new Date(endDate + 'T00:00:00'),
                offerPrice: parseInt(offerPrice),
                minimumPrice: parseInt(minimumPrice)
            };

            const newCoupon = new Coupon({
                name: data.couponName,
                createdOn: data.startDate,
                expireOn: data.endDate,
                offerPrice: data.offerPrice,
                minimumPrice: data.minimumPrice
            });

            await newCoupon.save();
            res.status(200).json({ success: true });
        } else {
            res.status(400).json({ success: false, message: "Coupon already exists" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "An error occurred" });
    }
}

const deletCoupon = async(req,res)=>{
    const { id } = req.body;

    try {
      const result = await Coupon.findByIdAndDelete(id);
      if (result) {
        res.json({ success: true, message: 'Coupon deleted successfully' });
      } else {
        res.json({ success: false, message: 'Coupon not found' });
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
}





const getLogout = async (req, res) => {
    try {
        req.session.admin = null
        res.redirect("/admin/login")
    } catch (error) {
        console.log(error.message);
    }
}


const getSalesReportPage = async (req, res) => {
    try {
        // const orders = await Order.find({ status: "Delivered" }).sort({ createdOn: -1 })
        // console.log(orders);

        // res.render("salesReport", { data: currentOrder, totalPages, currentPage })

        // console.log(req.query.day);
        let filterBy = req.query.day
        if (filterBy) {
            res.redirect(`/admin/${req.query.day}`)
        } else {
            res.redirect(`/admin/salesMonthly`)
        }
    } catch (error) {
        console.log(error.message);
    }
}


// Helper function to enrich orders with product details
const enrichOrders = async (orders) => {
  return await Promise.all(
    orders.map(async (order) => {
      const productRef = order.product?.[0]?._id || order.product?.[0]?.productId;
      const product = productRef
        ? await Product.findById(productRef)
            .select("productName brand category price")
            .lean()
        : null;

      return {
        ...order,
        productName: product?.productName || "Unknown",
        brand: product?.brand || "Unknown",
        category: product?.category || "Unknown",
        productPrice: product?.price || 0
      };
    })
  );
};

const paginateOrders = (orders, page = 1, itemsPerPage = 5) => {
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const currentOrder = orders.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  return { currentOrder, totalPages };
};

// SALES TODAY
const salesToday = async (req, res) => {
  try {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    let orders = await Order.find({
      createdOn: { $gte: start, $lte: end },
      status: "Delivered"
    }).sort({ createdOn: -1 }).lean();

    orders = await enrichOrders(orders);

    const { currentOrder, totalPages } = paginateOrders(orders, parseInt(req.query.page) || 1);

    res.render("salesReport", {
      data: currentOrder,
      totalPages,
      currentPage: parseInt(req.query.page) || 1,
      salesToday: true,
      filterQuery: buildFilterQuery(req)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
};

// SALES WEEKLY
const salesWeekly = async (req, res) => {
  try {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - today.getDay()), 23, 59, 59, 999);

    let orders = await Order.find({
      createdOn: { $gte: start, $lte: end },
      status: "Delivered"
    }).sort({ createdOn: -1 }).lean();

    orders = await enrichOrders(orders);
    const { currentOrder, totalPages } = paginateOrders(orders, parseInt(req.query.page) || 1);

    res.render("salesReport", {
      data: currentOrder,
      totalPages,
      currentPage: parseInt(req.query.page) || 1,
      salesWeekly: true,
      filterQuery: buildFilterQuery(req)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
};

// SALES MONTHLY
const salesMonthly = async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    let orders = await Order.find({
      createdOn: { $gte: start, $lte: end },
      status: "Delivered"
    }).sort({ createdOn: -1 }).lean();

    orders = await enrichOrders(orders);
    const { currentOrder, totalPages } = paginateOrders(orders, parseInt(req.query.page) || 1);

    res.render("salesReport", {
      data: currentOrder,
      totalPages,
      currentPage: parseInt(req.query.page) || 1,
      salesMonthly: true,
      filterQuery: buildFilterQuery(req)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
};

// SALES YEARLY
const salesYearly = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);

    let orders = await Order.find({
      createdOn: { $gte: start, $lte: end },
      status: "Delivered"
    }).sort({ createdOn: -1 }).lean();

    orders = await enrichOrders(orders);
    const { currentOrder, totalPages } = paginateOrders(orders, parseInt(req.query.page) || 1);

    res.render("salesReport", {
      data: currentOrder,
      totalPages,
      currentPage: parseInt(req.query.page) || 1,
      salesYearly: true,
      filterQuery: buildFilterQuery(req)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
};

// DATE RANGE FILTER
const dateRangeFilter = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).send("Start date and end date are required");

    const from = new Date(startDate + "T00:00:00");
    const to = new Date(endDate + "T23:59:59");

    let orders = await Order.find({
      createdOn: { $gte: from, $lte: to },
      status: "Delivered"
    }).sort({ createdOn: -1 }).lean();

    orders = await enrichOrders(orders);
    const { currentOrder, totalPages } = paginateOrders(orders, parseInt(req.query.page) || 1);

    res.render("salesReport", {
      data: currentOrder,
      totalPages,
      currentPage: parseInt(req.query.page) || 1,
      startDate,
      endDate,
      filterQuery: buildFilterQuery(req)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
};

// DATE WISE FILTER
const dateWiseFilter = async (req, res) => {
  try {
    const date = moment(req.query.date).startOf('day').toDate();
    const endOfDay = moment(date).endOf('day').toDate();

    let orders = await Order.find({
      createdOn: { $gte: date, $lte: endOfDay },
      status: "Delivered"
    }).sort({ createdOn: -1 }).lean();

    orders = await enrichOrders(orders);
    const { currentOrder, totalPages } = paginateOrders(orders, parseInt(req.query.page) || 1);

    res.render("salesReport", {
      data: currentOrder,
      totalPages,
      currentPage: parseInt(req.query.page) || 1,
      date,
      filterQuery: buildFilterQuery(req)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
};



function buildFilterQuery(req) {
    const query = [];
    if (req.query.day) query.push(`day=${req.query.day}`);
    if (req.query.date) query.push(`date=${req.query.date}`);
    if (req.query.startDate && req.query.endDate)
        query.push(`startDate=${req.query.startDate}&endDate=${req.query.endDate}`);
    return query.length > 0 ? '&' + query.join('&') : '';
}





const generatePdf = async (req, res) => {
  try {
    const { day, date, startDate, endDate } = req.query;

    /* ------------------------------
       1️⃣ BUILD FILTER
    -------------------------------*/
    let filter = { status: "Delivered" };

    if (day === "salesToday") {
      filter.createdOn = {
        $gte: moment().startOf("day").toDate(),
        $lte: moment().endOf("day").toDate(),
      };
    }

    if (day === "salesWeekly") {
      filter.createdOn = {
        $gte: moment().startOf("week").toDate(),
        $lte: moment().endOf("week").toDate(),
      };
    }

    if (day === "salesMonthly") {
      filter.createdOn = {
        $gte: moment().startOf("month").toDate(),
        $lte: moment().endOf("month").toDate(),
      };
    }

    if (day === "salesYearly") {
      filter.createdOn = {
        $gte: moment().startOf("year").toDate(),
        $lte: moment().endOf("year").toDate(),
      };
    }

    if (date) {
      filter.createdOn = {
        $gte: moment(date).startOf("day").toDate(),
        $lte: moment(date).endOf("day").toDate(),
      };
    }

    if (startDate && endDate) {
      filter.createdOn = {
        $gte: moment(startDate).startOf("day").toDate(),
        $lte: moment(endDate).endOf("day").toDate(),
      };
    }

    /* ------------------------------
       2️⃣ FETCH ORDERS
    -------------------------------*/
    const orders = await Order.find(filter).lean();
    if (!orders.length) return res.status(400).send("No sales data found");

    /* ------------------------------
       3️⃣ PRELOAD CATEGORY OFFERS
    -------------------------------*/
    const categories = await Category.find().lean();
    const categoryOfferMap = {};
    categories.forEach(c => {
      categoryOfferMap[c.name] = c.categoryOffer || 0;
    });

    /* ------------------------------
       4️⃣ ENRICH ORDERS
    -------------------------------*/
    const enrichedOrders = [];

    for (const order of orders) {
      for (const item of order.product) {

        const basePrice = Number(item.regularPrice || item.price);
        const qty = Number(item.quantity || 1);

        const productDiscount = Number(item.productOffer || 0);
        const categoryOfferPercent = categoryOfferMap[item.category] || 0;
        const categoryDiscount =
          ((basePrice - productDiscount) * categoryOfferPercent) / 100;

        const couponDiscount = order.couponDiscount || 0;

        const finalPrice =
          (basePrice - productDiscount - categoryDiscount - couponDiscount) * qty;

        enrichedOrders.push({
          customer: order.address?.[0]?.name || "Unknown",
          productName: item.name,
          brand: item.brand,
          category: item.category,
          orderDate: moment(order.createdOn).format("DD-MM-YYYY"),
deliveredDate: order.deliveredAt
  ? moment(order.deliveredAt).format("DD-MM-YYYY")
  : moment(order.updatedAt).format("DD-MM-YYYY"),

          qty,
          basePrice,
          productDiscount,
          categoryDiscount,
          couponDiscount,
          finalPrice,
        });
      }
    }

    /* ------------------------------
       5️⃣ AGGREGATION
    -------------------------------*/
    let totalRevenue = 0,
        totalProductDiscount = 0,
        totalCategoryDiscount = 0,
        totalCouponDiscount = 0;

    const brandSummary = {};
    const categorySummary = {};
    const productSummary = {};

    enrichedOrders.forEach(o => {
      totalRevenue += o.finalPrice;
      totalProductDiscount += o.productDiscount;
      totalCategoryDiscount += o.categoryDiscount;
      totalCouponDiscount += o.couponDiscount;

      brandSummary[o.brand] ??= { count: 0, revenue: 0 };
      brandSummary[o.brand].count++;
      brandSummary[o.brand].revenue += o.finalPrice;

      categorySummary[o.category] ??= { count: 0, revenue: 0 };
      categorySummary[o.category].count++;
      categorySummary[o.category].revenue += o.finalPrice;

      productSummary[o.productName] ??= { count: 0, revenue: 0 };
      productSummary[o.productName].count++;
      productSummary[o.productName].revenue += o.finalPrice;
    });

    /* ------------------------------
       6️⃣ PDF HTML
    -------------------------------*/
    const tableRows = enrichedOrders.map(o => `
      <tr>
        <td>${o.customer}</td>
        <td>${o.productName}</td>
       <td>${o.orderDate}</td>
<td>${o.deliveredDate}</td>

        <td>${o.brand}</td>
        <td>${o.category}</td>
        <td>${o.qty}</td>
        <td>₹${o.basePrice}</td>
        <td>₹${o.productDiscount}</td>
        <td>₹${o.categoryDiscount.toFixed(2)}</td>
        <td>₹${o.couponDiscount}</td>
        <td><b>₹${o.finalPrice.toFixed(2)}</b></td>
      </tr>
    `).join("");

    const summaryTable = `
      <tr><th>Total Revenue</th><td>₹${totalRevenue.toFixed(2)}</td></tr>
      <tr><th>Product Discount</th><td>₹${totalProductDiscount.toFixed(2)}</td></tr>
      <tr><th>Category Discount</th><td>₹${totalCategoryDiscount.toFixed(2)}</td></tr>
      <tr><th>Coupon Discount</th><td>₹${totalCouponDiscount.toFixed(2)}</td></tr>
    `;

    const buildSummary = obj =>
      Object.entries(obj).map(([k, v]) =>
        `<tr><td>${k}</td><td>${v.count}</td><td>₹${v.revenue.toFixed(2)}</td></tr>`
      ).join("");

    const html = `
    <html>
    <head>
      <style>
        body { font-family: Arial; padding: 25px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ccc; padding: 6px; font-size: 11px; text-align: center; }
        th { background: #f2f2f2; }
        h2 { margin-top: 35px; }
      </style>
    </head>
    <body>

    <h1>Sales Report</h1>

    <table>
    <tr>
  <th>Customer</th>
  <th>Product</th>
  <th>Order Date</th>
  <th>Delivered Date</th>
  <th>Brand</th>
  <th>Category</th>
  <th>Qty</th>
  <th>Base</th>
  <th>Prod Off</th>
  <th>Cat Off</th>
  <th>Coupon</th>
  <th>Final</th>
</tr>

      ${tableRows}
    </table>

    <h2>Overall Summary</h2>
    <table>${summaryTable}</table>

    <h2>Brand Summary</h2>
    <table><tr><th>Brand</th><th>Count</th><th>Revenue</th></tr>${buildSummary(brandSummary)}</table>

    <h2>Category Summary</h2>
    <table><tr><th>Category</th><th>Count</th><th>Revenue</th></tr>${buildSummary(categorySummary)}</table>

    <h2>Product Summary</h2>
    <table><tr><th>Product</th><th>Count</th><th>Revenue</th></tr>${buildSummary(productSummary)}</table>

    </body>
    </html>`;
const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
});

    const page = await browser.newPage();
    await page.setContent(html);
    const pdf = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=sales-report.pdf");
    res.end(pdf);

  } catch (err) {
    console.error(err);
    res.status(500).send("PDF generation failed");
  }
};

const downloadExcel = async (req, res) => {
  try {
    const { day, date, startDate, endDate } = req.query;

    /* ------------------------------
       1️⃣ BUILD FILTER
    -------------------------------*/
    let filter = { status: "Delivered" };

    if (day === "salesToday") {
      filter.createdOn = {
        $gte: moment().startOf("day").toDate(),
        $lte: moment().endOf("day").toDate(),
      };
    }

    if (day === "salesWeekly") {
      filter.createdOn = {
        $gte: moment().startOf("week").toDate(),
        $lte: moment().endOf("week").toDate(),
      };
    }

    if (day === "salesMonthly") {
      filter.createdOn = {
        $gte: moment().startOf("month").toDate(),
        $lte: moment().endOf("month").toDate(),
      };
    }

    if (day === "salesYearly") {
      filter.createdOn = {
        $gte: moment().startOf("year").toDate(),
        $lte: moment().endOf("year").toDate(),
      };
    }

    if (date) {
      filter.createdOn = {
        $gte: moment(date).startOf("day").toDate(),
        $lte: moment(date).endOf("day").toDate(),
      };
    }

    if (startDate && endDate) {
      filter.createdOn = {
        $gte: moment(startDate).startOf("day").toDate(),
        $lte: moment(endDate).endOf("day").toDate(),
      };
    }

    /* ------------------------------
       2️⃣ FETCH ORDERS
    -------------------------------*/
    const orders = await Order.find(filter).lean();
    if (!orders.length) {
      return res.status(400).send("No sales data found");
    }

    /* ------------------------------
       3️⃣ PRELOAD CATEGORY OFFERS
    -------------------------------*/
    const categories = await Category.find().lean();
    const categoryOfferMap = {};
    categories.forEach(c => {
      categoryOfferMap[c.name] = c.categoryOffer || 0;
    });

    /* ------------------------------
       4️⃣ ENRICH ORDERS (ITEM LEVEL)
    -------------------------------*/
    const enrichedOrders = [];

    for (const order of orders) {
      for (const item of order.product) {

        const basePrice = Number(item.regularPrice || item.price || 0);
        const qty = Number(item.quantity || 1);

        const productDiscount = Number(item.productOffer || 0);
        const categoryOfferPercent = categoryOfferMap[item.category] || 0;

        const categoryDiscount =
          ((basePrice - productDiscount) * categoryOfferPercent) / 100;

        const couponDiscount =
          order.couponDiscount
            ? order.couponDiscount / order.product.length
            : 0;

        const finalPrice =
          (basePrice - productDiscount - categoryDiscount - couponDiscount) * qty;

        enrichedOrders.push({
          customer: order.address?.[0]?.name || "Unknown",
          productName: item.name,
          brand: item.brand,
          category: item.category,
          orderDate: moment(order.createdOn).format("DD-MM-YYYY"),
          deliveredDate: order.deliveredAt
            ? moment(order.deliveredAt).format("DD-MM-YYYY")
            : moment(order.updatedAt).format("DD-MM-YYYY"),
          qty,
          basePrice,
          productDiscount,
          categoryDiscount,
          couponDiscount,
          finalPrice
        });
      }
    }

    /* ------------------------------
       5️⃣ AGGREGATION
    -------------------------------*/
    let totalRevenue = 0;
    let totalProductDiscount = 0;
    let totalCategoryDiscount = 0;
    let totalCouponDiscount = 0;

    const brandSummary = {};
    const categorySummary = {};
    const productSummary = {};

    enrichedOrders.forEach(o => {
      totalRevenue += o.finalPrice;
      totalProductDiscount += o.productDiscount;
      totalCategoryDiscount += o.categoryDiscount;
      totalCouponDiscount += o.couponDiscount;

      brandSummary[o.brand] ??= { count: 0, revenue: 0 };
      brandSummary[o.brand].count++;
      brandSummary[o.brand].revenue += o.finalPrice;

      categorySummary[o.category] ??= { count: 0, revenue: 0 };
      categorySummary[o.category].count++;
      categorySummary[o.category].revenue += o.finalPrice;

      productSummary[o.productName] ??= { count: 0, revenue: 0 };
      productSummary[o.productName].count++;
      productSummary[o.productName].revenue += o.finalPrice;
    });

    /* ------------------------------
       6️⃣ WORKBOOK – SALES SHEET
    -------------------------------*/
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sales Report");

    sheet.columns = [
      { header: "Customer", key: "customer", width: 20 },
      { header: "Product", key: "productName", width: 25 },
      { header: "Order Date", key: "orderDate", width: 15 },
      { header: "Delivered Date", key: "deliveredDate", width: 15 },
      { header: "Brand", key: "brand", width: 15 },
      { header: "Category", key: "category", width: 15 },
      { header: "Qty", key: "qty", width: 10 },
      { header: "Base Price", key: "basePrice", width: 15 },
      { header: "Product Discount", key: "productDiscount", width: 18 },
      { header: "Category Discount", key: "categoryDiscount", width: 18 },
      { header: "Coupon Discount", key: "couponDiscount", width: 18 },
      { header: "Final Price", key: "finalPrice", width: 15 }
    ];

    sheet.getRow(1).font = { bold: true };
    enrichedOrders.forEach(o => sheet.addRow(o));

    /* ------------------------------
       7️⃣ OVERALL SUMMARY
    -------------------------------*/
    sheet.addRow({});
    sheet.addRow({ customer: "OVERALL SUMMARY" }).font = { bold: true };
    sheet.addRow({ customer: "Total Revenue", productName: totalRevenue });
    sheet.addRow({ customer: "Product Discount", productName: totalProductDiscount });
    sheet.addRow({ customer: "Category Discount", productName: totalCategoryDiscount });
    sheet.addRow({ customer: "Coupon Discount", productName: totalCouponDiscount });
    sheet.addRow({
      customer: "Net Credited Amount",
      productName: totalRevenue
    });

    /* ------------------------------
       8️⃣ BRAND SUMMARY SHEET
    -------------------------------*/
    const brandSheet = workbook.addWorksheet("Brand Summary");
    brandSheet.columns = [
      { header: "Brand", key: "brand", width: 25 },
      { header: "Sales Count", key: "count", width: 15 },
      { header: "Revenue", key: "revenue", width: 20 }
    ];
    brandSheet.getRow(1).font = { bold: true };

    Object.entries(brandSummary).forEach(([brand, v]) =>
      brandSheet.addRow({ brand, count: v.count, revenue: v.revenue })
    );

    /* ------------------------------
       9️⃣ CATEGORY SUMMARY SHEET
    -------------------------------*/
    const categorySheet = workbook.addWorksheet("Category Summary");
    categorySheet.columns = [
      { header: "Category", key: "category", width: 25 },
      { header: "Sales Count", key: "count", width: 15 },
      { header: "Revenue", key: "revenue", width: 20 }
    ];
    categorySheet.getRow(1).font = { bold: true };

    Object.entries(categorySummary).forEach(([category, v]) =>
      categorySheet.addRow({ category, count: v.count, revenue: v.revenue })
    );

    /* ------------------------------
       🔟 PRODUCT SUMMARY SHEET
    -------------------------------*/
    const productSheet = workbook.addWorksheet("Product Summary");
    productSheet.columns = [
      { header: "Product", key: "product", width: 30 },
      { header: "Sales Count", key: "count", width: 15 },
      { header: "Revenue", key: "revenue", width: 20 }
    ];
    productSheet.getRow(1).font = { bold: true };

    Object.entries(productSummary).forEach(([product, v]) =>
      productSheet.addRow({ product, count: v.count, revenue: v.revenue })
    );

    /* ------------------------------
       1️⃣1️⃣ SEND FILE
    -------------------------------*/
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales-report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("Excel Export Error:", err);
    res.status(500).send("Internal Server Error");
  }
};



const generateLedgerPdf= async (req, res) => {
  try {
    const { day, date, startDate, endDate } = req.query;

    /* ------------------------------------------------
       1️⃣ BUILD FILTER (Delivered orders)
    -------------------------------------------------*/
    let filter = { status: "Delivered" };

    if (day === "salesToday") {
      filter.createdOn = {
        $gte: moment().startOf("day").toDate(),
        $lte: moment().endOf("day").toDate()
      };
    }

    if (day === "salesWeekly") {
      filter.createdOn = {
        $gte: moment().startOf("week").toDate(),
        $lte: moment().endOf("week").toDate()
      };
    }

    if (day === "salesMonthly") {
      filter.createdOn = {
        $gte: moment().startOf("month").toDate(),
        $lte: moment().endOf("month").toDate()
      };
    }

    if (day === "salesYearly") {
      filter.createdOn = {
        $gte: moment().startOf("year").toDate(),
        $lte: moment().endOf("year").toDate()
      };
    }

    if (date) {
      filter.createdOn = {
        $gte: moment(date).startOf("day").toDate(),
        $lte: moment(date).endOf("day").toDate()
      };
    }

    if (startDate && endDate) {
      filter.createdOn = {
        $gte: moment(startDate).startOf("day").toDate(),
        $lte: moment(endDate).endOf("day").toDate()
      };
    }

    /* ------------------------------------------------
       2️⃣ FETCH ORDERS
    -------------------------------------------------*/
    const orders = await Order.find(filter)
      .populate("product.productId", "productName brand category")
      .lean();

    /* ------------------------------------------------
       3️⃣ ENRICH ORDERS
    -------------------------------------------------*/
    const enrichedOrders = orders.length
      ? await Promise.all(
          orders.map(async (order) => {
            const productId =
              order.product?.[0]?._id ||
              order.product?.[0]?.productId;

            const product = productId
              ? await Product.findById(productId)
                  .select("productName brand category")
                  .lean()
              : null;

            return {
              customer: order.address?.[0]?.name || "Unknown",
              productName: product?.productName || "Unknown",
              brand: product?.brand || "Unknown",
              category: product?.category || "Unknown",
              payment: order.payment,
              status: order.status,
              orderDate: moment(order.createdOn).format("DD-MM-YYYY"),
              deliveredDate: order.deliveredAt
                ? moment(order.deliveredAt).format("DD-MM-YYYY")
                : moment(order.updatedAt).format("DD-MM-YYYY"),
              totalAmount: order.totalPrice + order.couponDiscount,
              productDiscount: order.productDiscount || 0,
              couponDiscount: order.couponDiscount || 0,
              finalPrice: order.totalPrice
            };
          })
        )
      : [];

    /* ------------------------------------------------
       4️⃣ AGGREGATIONS
    -------------------------------------------------*/
    let totalRevenue = 0;
    let totalProductDiscount = 0;
    let totalCouponDiscount = 0;

    const brandSummary = {};
    const categorySummary = {};
    const productSummary = {};

    enrichedOrders.forEach((o) => {
      totalRevenue += o.finalPrice;
      totalProductDiscount += o.productDiscount;
      totalCouponDiscount += o.couponDiscount;

      // Brand
      brandSummary[o.brand] ??= { count: 0, revenue: 0 };
      brandSummary[o.brand].count++;
      brandSummary[o.brand].revenue += o.finalPrice;

      // Category
      categorySummary[o.category] ??= { count: 0, revenue: 0 };
      categorySummary[o.category].count++;
      categorySummary[o.category].revenue += o.finalPrice;

      // Product
      productSummary[o.productName] ??= { count: 0, revenue: 0 };
      productSummary[o.productName].count++;
      productSummary[o.productName].revenue += o.finalPrice;
    });

    const logoPath = `file://${process.cwd()}/public/user-assets/imgs/theme/ThinkThankz-logo/cover.png`;

    /* ------------------------------------------------
       5️⃣ HTML TEMPLATE WITH CHARTS
    -------------------------------------------------*/
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          header { display: flex; justify-content: space-between; align-items: center; }
          header img { height: 60px; }
          h1, h2 { margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { border: 1px solid #ddd; padding: 6px; font-size: 12px; text-align: center; }
          th { background: #f3f4f6; }
          canvas { display: block; margin: 20px auto; }
          .summary { padding: 15px; background: #f9fafb; margin-bottom: 30px; }
        </style>
      </head>
      <body>
        <header>
          <img src="${logoPath}" onerror="this.style.display='none'" />
          <h1>Sales Report</h1>
        </header>

        <div class="summary">
          <p><strong>Total Revenue:</strong> ₹${totalRevenue.toFixed(2)}</p>
          <p><strong>Product Discount:</strong> ₹${totalProductDiscount.toFixed(2)}</p>
          <p><strong>Coupon Discount:</strong> ₹${totalCouponDiscount.toFixed(2)}</p>
          <p><strong>Net Revenue:</strong> ₹${(totalRevenue - totalProductDiscount - totalCouponDiscount).toFixed(2)}</p>
          <p><strong>Orders Count:</strong> ${enrichedOrders.length}</p>
        </div>

        <h2>Brand Wise Summary</h2>
        <canvas id="brandChart" width="600" height="300"></canvas>
        <table>
          <thead>
            <tr><th>Brand</th><th>Sales Count</th><th>Revenue</th></tr>
          </thead>
          <tbody>
            ${Object.entries(brandSummary).map(([b,v]) => `<tr><td>${b}</td><td>${v.count}</td><td>₹${v.revenue.toFixed(2)}</td></tr>`).join("")}
          </tbody>
        </table>

        <h2>Category Wise Summary</h2>
        <canvas id="categoryChart" width="600" height="300"></canvas>
        <table>
          <thead>
            <tr><th>Category</th><th>Sales Count</th><th>Revenue</th></tr>
          </thead>
          <tbody>
            ${Object.entries(categorySummary).map(([c,v]) => `<tr><td>${c}</td><td>${v.count}</td><td>₹${v.revenue.toFixed(2)}</td></tr>`).join("")}
          </tbody>
        </table>

        <h2>Product Wise Summary</h2>
        <table>
          <thead>
            <tr><th>Product</th><th>Sales Count</th><th>Revenue</th></tr>
          </thead>
          <tbody>
            ${Object.entries(productSummary).map(([p,v]) => `<tr><td>${p}</td><td>${v.count}</td><td>₹${v.revenue.toFixed(2)}</td></tr>`).join("")}
          </tbody>
        </table>

        <script>
          new Chart(document.getElementById('brandChart').getContext('2d'), {
            type: 'bar',
            data: {
              labels: ${JSON.stringify(Object.keys(brandSummary))},
              datasets: [{
                label: 'Revenue (₹)',
                data: ${JSON.stringify(Object.values(brandSummary).map(v => v.revenue.toFixed(2)))},
                backgroundColor: 'rgba(54, 162, 235, 0.6)'
              }]
            }
          });

          new Chart(document.getElementById('categoryChart').getContext('2d'), {
            type: 'pie',
            data: {
              labels: ${JSON.stringify(Object.keys(categorySummary))},
              datasets: [{
                data: ${JSON.stringify(Object.values(categorySummary).map(v => v.revenue.toFixed(2)))},
                backgroundColor: ${JSON.stringify(Object.keys(categorySummary).map((_,i) => `hsl(${i*50%360},70%,60%)`))}
              }]
            }
          });
        </script>
      </body>
      </html>
    `;

    /* ------------------------------------------------
       6️⃣ Puppeteer PDF
    -------------------------------------------------*/
    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox","--disable-setuid-sandbox"], executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.emulateMediaType("screen");

    const pdf = await page.pdf({ format: "A4", printBackground: true, margin: { top:"20mm", bottom:"20mm" } });
    await browser.close();

    /* ------------------------------------------------
       7️⃣ Send PDF
    -------------------------------------------------*/
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=sales-report.pdf");
    res.end(pdf);

  } catch (err) {
    console.error("Sales PDF Error:", err);
    res.status(500).send("PDF generation failed");
  }
};




const adminDashboard = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        let { year = currentYear, month } = req.query;

        // Convert year to number
        year = Number(year);
        if (isNaN(year) || year < 2000 || year > currentYear) {
            return res.status(400).send("Invalid year");
        }

        // Convert month to number if provided
        if (month !== undefined && month !== "") {
            month = Number(month);
            if (isNaN(month) || month < 1 || month > 12) {
                console.log("Invalid month:", month);
                return res.status(400).send("Invalid month");
            }
        } else {
            // Month not provided → treat as "all months"
            month = null;
        }

        // Define date ranges
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year + 1, 0, 1);

        let startOfMonth, endOfMonth;
        if (month) {
            startOfMonth = new Date(year, month - 1, 1);
            endOfMonth = new Date(year, month, 0, 23, 59, 59);
        }

        // Aggregation filter
        const orderFilter = {
            status: "Delivered",
            createdOn: month ? { $gte: startOfMonth, $lte: endOfMonth } : { $gte: startOfYear, $lt: endOfYear }
        };

        const [
            categories,
            deliveredOrders,
            products,
            users,
            monthlySales,
            latestOrders,
            bestSellingProducts,
            bestSellingCategories,
            bestSellingBrands
        ] = await Promise.all([
            Category.find({ isListed: true }),
            Order.find(orderFilter),
            Product.find({}),
            User.find({}),
            Order.aggregate([
                { $match: orderFilter },
                {
                    $group: {
                        _id: { year: { $year: "$createdOn" }, month: { $month: "$createdOn" } },
                        count: { $sum: 1 },
                        totalRevenue: { $sum: "$totalPrice" }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ]),
            Order.find().sort({ createdOn: -1 }).limit(5),
            Order.aggregate([
                { $match: orderFilter },
                { $unwind: "$product" },
                {
                    $group: {
                        _id: "$product.name",
                        totalSold: { $sum: "$product.quantity" }
                    }
                },
                { $sort: { totalSold: -1 } },
                { $limit: 10 }
            ]),
            Order.aggregate([
                { $match: orderFilter },
                { $unwind: "$product" },
                {
                    $group: {
                        _id: "$product.category",
                        totalSold: { $sum: "$product.quantity" }
                    }
                },
                { $sort: { totalSold: -1 } },
                { $limit: 10 }
            ]),
            Order.aggregate([
                { $match: orderFilter },
                { $unwind: "$product" },
                {
                    $group: {
                        _id: "$product.brand",
                        totalSold: { $sum: "$product.quantity" }
                    }
                },
                { $sort: { totalSold: -1 } },
                { $limit: 10 }
            ])
        ]);

        // Total revenue
        const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.totalPrice, 0);

        // Products per month
        const productPerMonth = Array(12).fill(0);
        products.forEach(p => {
            const monthIndex = new Date(p.createdOn).getMonth();
            productPerMonth[monthIndex]++;
        });

        // Sales per month (for chart)
        const monthlySalesArray = Array.from({ length: 12 }, (_, i) => {
            const monthData = monthlySales.find(
                item => item._id.year === year && item._id.month === i + 1
            );
            return monthData ? monthData.count : 0;
        });

        res.render("index", {
            orderCount: deliveredOrders.length,
            productCount: products.length,
            categoryCount: categories.length,
            totalRevenue,
            monthlyRevenue: totalRevenue,
            monthlySalesArray,
            productPerMonth,
            latestOrders,
            bestSellingProducts,
            bestSellingCategories,
            bestSellingBrands,
            year,
            month // null if all months
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};

// Separate: date-wise filter for reports

const returnRequest = async (req, res) => {
    try {
        // Fetch and sort return requests by creation date in descending order
        const returnRequests = await Return.find({})
            .populate('userId')
            .populate('productId')
            .sort({ createdAt: -1 });

        // Render the results to the view
        res.render('adminReturnRequests', { returnRequests });
    } catch (error) {
        res.status(500).send('Error fetching return requests');
    }
};

const approveReturnRequest = async (req, res) => {
    const { returnId } = req.params;

    try {
        const returnRequest = await Return.findById(returnId);
        if (!returnRequest) {
            return res.status(404).json({ message: 'Return request not found' });
        }

        // Update the return request status to approved
        returnRequest.status = 'Approved';
        await returnRequest.save();

        // Update the order and product stock as necessary
        const order = await Order.findById(returnRequest.orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const user = await User.findById(returnRequest.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the product in the order
        const productIndex = order.product.findIndex(p => p._id.toString() === returnRequest.productId.toString());
        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found in order' });
        }

        const product = order.product[productIndex];
        console.log('Product before update:', product); // Debugging log

        // Calculate the return amount
        const returnAmount = product.price * returnRequest.quantity;

        // Update the product quantity in the order or remove if all returned
        if (returnRequest.quantity < product.quantity) {
            order.product[productIndex].quantity -= returnRequest.quantity;
            console.log('Product quantity after decrement:', order.product[productIndex].quantity); // Debugging log
        } else {
            order.product.splice(productIndex, 1);
            console.log('Product removed from order'); // Debugging log
        }

        // Adjust the order's total price
        order.totalPrice -= returnAmount;
        console.log('Order total price after adjustment:', order.totalPrice); // Debugging log

        // Mark the nested product array as modified
        order.markModified('product');

        // Update the order status to "Returned" if all products are returned
        if (order.product.length === 0) {
            order.status = "Returned";
            console.log('Order status set to Returned'); // Debugging log
        }

        // Save the updated order
        await order.save();

        // Update the product stock by incrementing the returned quantity
        await Product.findByIdAndUpdate(returnRequest.productId, {
            $inc: { quantity: returnRequest.quantity }
        });

        // Add money to user's wallet if payment method is wallet or online
        if (order.payment === "wallet" || order.payment === "online") {
            user.wallet += returnAmount;

            const newHistory = {
                amount: returnAmount,
                status: "credit",
                date: Date.now()
            };
            user.history.push(newHistory);

            await user.save();
        }

        res.status(200).json({ message: 'Return request approved successfully' });
    } catch (error) {
        console.error('Error approving return request:', error);
        res.status(500).json({ message: 'Error approving return request' });
    }
};



// Decline return request
const declineReturnRequest = async (req, res) => {
    const { returnId } = req.params;
 
    try {
        const returnRequest = await Return.findById(returnId);

        if (!returnRequest) {
            return res.status(404).json({ message: 'Return request not found' });
        }

        // Update the return request status to declined
        returnRequest.status = 'Declined';
        await returnRequest.save();

        res.status(200).json({ message: 'Return request declined successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error declining return request' });
    }
};



module.exports = {
    adminDashboard,
    getLoginPage,
    verifyLogin,
    getCouponPageAdmin,
    createCoupon,
    deletCoupon,
    getLogout,
    getSalesReportPage,
    salesToday,
    salesWeekly,
    salesMonthly,
    salesYearly,
    dateWiseFilter,
    generatePdf,
    downloadExcel,
    approveReturnRequest,
    declineReturnRequest,
    returnRequest,
    dateRangeFilter,
    generateLedgerPdf 
}