const GiftModel = require('../../models/giftModel');
const config = require('../../../config');

// Create Gift
exports.createGift = async (req, res) => {
    try {
        const gift = req.body
        if (!gift.giftName || !gift.loop || !gift.unvisualAmount || !gift.photo) {
            return res.status(400).json({ message: config.messages.BAD_REQUEST })
        }

        const isGiftExisted = await GiftModel.findOne({ giftName: gift.giftName });
        if (isGiftExisted) {
            return res.status(400).json({ message: "GIFT_ALREADY_EXISTS" });
        }

        const currentAmount = gift.unvisualAmount;

        const newGift = await GiftModel.create({ ...gift, currentAmount });
        // const datas = { ...gift, currentAmount }

        return res.status(200).json({ message: "CREATE_GIFT_SUCCESSFUL", data: newGift._id });
    } catch (error) {
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};

// Get all gifts
exports.getGifts = async (req, res) => {
    try {
        const { skip, limit } = req.params;
        const { giftName } = req.query;

        let findby = {}; // Use let to allow reassignment

        if (giftName) {
            const regexPattern = new RegExp(giftName, 'i');
            findby = { giftName: regexPattern }; // Correct field name to giftName
        }

        console.log(findby);

        const totalGifts = await GiftModel.countDocuments(findby).exec();
        const gifts = await GiftModel.find(findby)
            .skip(parseInt(skip) || 0) // ParseInt to convert string to number
            .limit(parseInt(limit) || 25) // ParseInt to convert string to number
            .sort({ createdAt: 'desc' })
            .exec();

        return res.status(200).json({ message: "GET_GIFTS_SUCCESSFUL", totalGifts, data: gifts });
    } catch (error) {
        console.error("Error fetching gifts:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


// Get gift by id
exports.getGift = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: config.messages.BAD_REQUEST });
        }
        const gift = await GiftModel.findById(id);

        return res.status(200).json({ message: "GET_GIFT_SUCCESSFUL", data: gift })
    } catch (error) {
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};

// Update gift
exports.updateGift = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: config.messages.BAD_REQUEST });
        }


        const updateGift = req.body;
        const isGiftExisted = await GiftModel.findOne({ giftName: updateGift.giftName });
        if (isGiftExisted) {
            return res.status(400).json({ message: "GIFT_ALREADY_EXISTS" });
        }

        const updatedAt = new Date();

        updateGift.currentAmount = updateGift.unvisualAmount;

        const gift = await GiftModel.findByIdAndUpdate(id, { ...updateGift, updatedAt });

        //////it will be increments to the unvisualAmount and currentAmount
        // const gift = await GiftModel.findByIdAndUpdate(id, {
        //     giftName: updateGift.giftName,
        //     $inc: {
        //         unvisualAmount: updateGift.unvisualAmount,
        //         currentAmount: updateGift.unvisualAmount
        //     },
        //     updatedAt
        // });

        return res.status(200).json({ message: "UPDATE_GIFT_SUCCESSFUL", data: gift._id })
    } catch (error) {
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};

// Delete Gift  //TODO: when delete gift just set gift status to isDeleted = True
// exports.deleteGift = async (req, res) => {
//     try {
//         const id = req.params.id;
//         if (!id) {
//             return res.status(400).json({ message: config.messages.BAD_REQUEST });
//         }
//         const gift = await GiftModel.findByIdAndDelete(id);

//         return res.status(200).json({ message: "DELETE_GIFT_SUCCESSFUL", data: gift._id })
//     } catch (error) {
//         return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
//     }
// };