const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customer",
  },
  billNo: String,
  table: String,
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "restaurant",
  },
  phone: String,
  billDate: String,
  menuList: Array,
  photo: String,
  spinAmount: Number,
  spinRound: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "spin",
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

const Bill = mongoose.model("bill", billSchema);

module.exports = Bill;
