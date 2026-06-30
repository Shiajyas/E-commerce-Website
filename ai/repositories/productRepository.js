const Product = require("../../models/productSchema");

async function findProducts(query) {

    return await Product.find(query)
        .select(
            "productName brand category salePrice regularPrice model feature quantity productImage"
        )
        .limit(5)
        .lean();

}

module.exports = {

    findProducts

};