const mongoose = require('mongoose')

const giftSchema = new mongoose.Schema({
    giftName: String,
    loop: Number,
    unvisualAmount: Number,
    currentAmount: Number,
    photo: String,
    whereRecive: {
        type: String,
        enum: ["RESTAURANT", "BEERLAO_SERVICE"]
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

const Gift = mongoose.model('gift', giftSchema);

module.exports = Gift;