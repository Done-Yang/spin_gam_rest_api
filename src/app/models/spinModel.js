const mongoose = require('mongoose')

const spinSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customer'
    },
    bill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bill'
    },
    status: {
        type: String,
        enum: ["APPROVED", "PENDING"],
        default: "PENDING"
    },
    gift: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'gift'
    },
    approvedBy: String,
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurant'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})


const Spin = mongoose.model('spin', spinSchema);

module.exports = Spin;