const mongoose = require('mongoose')

const scanSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurant'
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customer'
    },
    scanAmount: {
        type: Number,
        default: 1
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

const Scan = mongoose.model('scan', scanSchema);

module.exports = Scan;