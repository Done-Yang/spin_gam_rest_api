const mongoose = require("mongoose");
const { stringify } = require("uuid");

const restaurantSchema = new mongoose.Schema({
  restaurantNo: String,
  name: String,
  phone: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Restaurant = mongoose.model("restaurant", restaurantSchema);

module.exports = Restaurant;
