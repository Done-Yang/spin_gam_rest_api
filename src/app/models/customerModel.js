const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema({
    name: String,
    gender: {
        type: String,
        enum: ["MALE", "FEMALE"]
    },
    birthYear: String,
    phone: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

const Customer = mongoose.model('customer', customerSchema);

module.exports = Customer;