const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productNo: Number,
  productName: String,
  amount: {
    type: Number,
    min: 1,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to auto-increment the productNo
productSchema.pre("save", async function (next) {
  if (this.isNew) {
    const maxProduct = await Product.findOne().sort("-productNo").exec();
    this.productNo = maxProduct ? maxProduct.productNo + 1 : 1;
  }
  next();
});

const Product = mongoose.model("product", productSchema);

module.exports = Product;
