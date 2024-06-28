const SpinModel = require('../../models/spinModel');
const BillModel = require('../../models/billModel');
const config = require('../../../config');
const GiftModel = require('../../models/giftModel');
const CustomerModel = require('../../models/customerModel');
const mongoose = require('mongoose')
const { determineGift } = require('./helper');
const { sendMessageToBeerLaoService } = require('./helper')


// Create Gift
exports.createSpin = async (req, res) => {
    try {
        const spin = req.body

        if (!spin.customer || !spin.bill) {
            return res.status(400).json({ message: config.messages.BAD_REQUEST })
        }

        const customerTotalSpin = await SpinModel.countDocuments({ customer: spin.customer }).exec();

        const billSpinAmount = await BillModel.aggregate([
            { $match: { customer: new mongoose.Types.ObjectId(spin.customer) } },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$spinAmount" },
                    billCount: { $sum: 1 }
                }
            }
        ]);

        console.log({ billSpinAmount, customerTotalSpin })
        if (!billSpinAmount) {
            return res.status(400).json({ message: config.messages.BAD_REQUEST })
        }

        if (customerTotalSpin >= billSpinAmount[0].totalAmount) {
            return res.status(400).json({ message: "SPIN_TIME_OVER", data: { spinAvarable: billSpinAmount[0].totalAmount - customerTotalSpin, customerTotalSpin } });
        }

        const billInformation = await BillModel.findById(spin.bill);

        if (!billInformation) {
            return res.status(400).json({ message: config.messages.BAD_REQUEST })
        }

        if (billInformation.spinAmount <= billInformation.spinRound.length) {
            return res.status(400).json({ message: "BILL_SPIN_AMOUNT_OVER" })
        }

        const totalSpins = await SpinModel.countDocuments({ customer: spin.customer });
        const gifts = await GiftModel.find().sort({ loop: -1 });

        spin.gift = determineGift(totalSpins, gifts);
        spin.restaurant = billInformation.restaurant;

        if (spin.gift) {
            const giftId = await GiftModel.findOne({ giftName: spin.gift });

            await GiftModel.findByIdAndUpdate(giftId._id, { $inc: { currentAmount: -1 } }, { new: true });

            const newSpinGift = await SpinModel.create({ ...spin, gift: giftId._id });

            const newBill = await BillModel.findByIdAndUpdate(
                spin.bill,
                { $push: { spinRound: newSpinGift._id } },
                { new: true }
            ).populate({ path: 'restaurant', select: 'restaurantNo name phone' });

            const getCustomer = await CustomerModel.findById(spin.customer);

            ///TODO: Send whatssap message to the cutomer (already done just uncommend it)
            await sendMessageToBeerLaoService({ customer: getCustomer.name, phone: getCustomer.phone, gift: spin.gift });
            console.log(`Send message to ${getCustomer} succesful`);

            return res.status(200).json({ message: "CREATE_SPIN_SUCCESSFUL", data: { bill: newBill, gift: spin.gift } });
        }

        const newSpin = await SpinModel.create(spin);

        await BillModel.findByIdAndUpdate(
            spin.bill,
            { $push: { spinRound: newSpin._id } },
            { new: true }
        );

        return res.status(200).json({ message: "CREATE_SPIN_SUCCESSFUL", data: { bill: spin.bill, gift: spin.gift } });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};

// Get spin history
exports.getCustomerSpinAmount = async (req, res) => {
    try {
        const customer = req.params.customer;
        if (!customer) {
            return res.status(400).json({ message: config.messages.BAD_REQUEST });
        }

        const customerSpinAmount = await SpinModel.countDocuments({ customer }).exec();

        let bills = await BillModel.aggregate([
            { $match: { customer: new mongoose.Types.ObjectId(customer) } },
            {
                $addFields: {
                    spinRoundLength: { $size: "$spinRound" },
                }
            },
            {
                $match: {
                    $expr: { $lt: ["$spinRoundLength", "$spinAmount"] }
                }
            },
            {
                $group: {
                    _id: null,
                    bills: {
                        $push: {
                            id: '$_id',
                            spinAmount: '$spinAmount',
                            spinRound: { $size: '$spinRound' }
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    bills: 1,
                },
            },
        ]);

        const billSpinAmount = await BillModel.aggregate([
            { $match: { customer: new mongoose.Types.ObjectId(customer) } },
            {
                $group: {
                    _id: null,
                    totalSpinAmount: { $sum: '$spinAmount' }
                },
            },
            {
                $project: {
                    _id: 0,
                    totalSpinAmount: 1,
                },
            },
        ]);

        console.log({ bills })
        console.log({ billSpinAmount })
        // console.log({ BillAmount: billSpinAmount[0].bills })
        if (!billSpinAmount || billSpinAmount.length <= 0) {
            return res.status(400).json({ message: config.messages.BAD_REQUEST })
        }

        console.log({ billSpinAmount: billSpinAmount[0].totalSpinAmount })

        if (bills.length <= 0) {
            bills = [];
        } else {
            bills = bills[0].bills
        }
        let spinAmount = 0;
        if (billSpinAmount[0].totalSpinAmount >= customerSpinAmount) {
            spinAmount = billSpinAmount[0].totalSpinAmount - customerSpinAmount
        }

        return res.status(200).json({ message: "GET_SPIN_AMOUNT_SUCCESSFUL", data: { spinAmount, bills }, })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};

// Get spin history
exports.getSpinHistory = async (req, res) => {
    try {
        const customer = req.params.customer;
        if (!customer) {
            return res.status(400).json({ message: config.messages.BAD_REQUEST });
        }
        const spinHistory = await SpinModel.find({ customer })
            .populate({
                path: 'bill',
                select: 'restaurant',
                populate: { path: 'restaurant', select: 'name phone' }
            })
            .populate({ path: 'customer', select: 'name phone birthYear gender' })
            .populate({ path: 'gift', select: 'giftName whereRecive photo' })
            .sort({ createdAt: -1 })
            .exec();

        return res.status(200).json({ message: "GET_SPIN_HISTORY_SUCCESSFUL", data: spinHistory })
    } catch (error) {
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};

// Get gift by id
exports.approveSpin = async (req, res) => {
    try {
        const spinId = req.params.spinId;
        if (!spinId) {
            return res.status(400).json({ message: config.messages.BAD_REQUEST });
        }

        const spin = await SpinModel.findById(spinId)
            .populate({ path: 'customer', select: 'name' })
            .populate({ path: 'gift', select: 'whereRecive' })
            .exec();

        console.log(spin.customer)
        if (!spin) {
            return res.status(404).json({ message: "INVALID_SPIN_ID" })
        }

        if (spin.status === "PENDING") {
            if (spin.gift.whereRecive === "BEERLAO_SERVICE") {
                return res.status(400).json({ message: "GIFT_CANNOT_RECIVE_FROM_RESTAURAN" })
            }
            const updatedAt = new Date();
            const updateSpin = await SpinModel.findByIdAndUpdate(
                spinId,
                { status: "APPROVED", approvedBy: spin.customer.name, updatedAt }
            );

            return res.status(200).json({ message: "APPROVE_SPIN_SUCCESSFUL", data: updateSpin._id })
        }

        return res.status(400).json({ message: "SPIN_IS_ALREADY_APPROVED" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};