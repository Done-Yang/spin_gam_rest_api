const BillModel = require('../../models/billModel');
const RestaurantModel = require('../../models/restaurantModel');
const SpinModel = require('../../models/spinModel');
const CustomerModel = require('../../models/customerModel');
const ScanModel = require('../../models/scanModel');
const { getUserDataOnToken } = require('../../middlewares');
const config = require('../../../config');

exports.getReports = async (req, res) => {
    try {
        const { skip, limit } = req.params;
        let { createdAtStart, createdAtEnd, restaurant, gift, gender, status } = req.query;

        let findby = {}
        if (createdAtStart) {
            // Parse the createdAtStart string into a Date object
            const createdAtDate = new Date(createdAtStart);

            // Extract year, month, and day from createdAtDate
            const year = createdAtDate.getFullYear();
            const month = createdAtDate.getMonth();
            const day = createdAtDate.getDate();

            // Set createdAt field in findby object
            const startOfDay = new Date(Date.UTC(year, month, day));
            const endOfDay = new Date(Date.UTC(year, month, day + 1));

            // Set the $or condition for both createdAt and updatedAt fields
            findby = {
                ...findby,
                $or: [
                    {
                        createdAt: {
                            $gte: startOfDay,
                            $lt: endOfDay
                        }
                    },
                    {
                        updatedAt: {
                            $gte: startOfDay,
                            $lt: endOfDay
                        }
                    }
                ]
            };
        }
        if (createdAtStart && createdAtEnd) {
            const startDate = new Date(createdAtStart);
            const endDate = new Date(createdAtEnd);

            // Move end date to the start of the next day
            endDate.setDate(endDate.getDate() + 1);

            findby = {
                ...findby,
                $or: [{
                    createdAt: {
                        $gte: startDate,
                        $lt: endDate // Use $lt to ensure inclusive end date
                    }
                },
                {
                    updatedAt: {
                        $gte: startDate,
                        $lt: endDate // Use $lt to ensure inclusive end date
                    }
                }
                ]
            };
        }


        if (restaurant) {
            const restaurantRegex = new RegExp(restaurant, 'i');
            const restaurants = await RestaurantModel.find({ name: { $regex: restaurantRegex } });
            const restaurantIds = restaurants.map(restaurant => restaurant._id);

            findby.restaurant = { $in: restaurantIds };
        }


        if (gender) {
            const spinsWithCustomerGender = await CustomerModel.find({ gender });
            const customerIds = spinsWithCustomerGender.map(spin => spin._id);

            // Add spinRound filtering to findby
            findby.customer = { $in: customerIds };
        }

        if (status) {

            const spinsWithStatus = await SpinModel.find({ status });
            const spinIds = spinsWithStatus.map(spin => spin._id);

            // Add spinRound filtering to findby
            findby.spinRound = { $in: spinIds };
        }
        if (gift) {
            // Fetch the spin entries with the specific gift ID
            const spinsWithGift = await SpinModel.find({ gift });
            const spinIds = spinsWithGift.map(spin => spin._id);

            // Add spinRound filtering to findby
            findby.spinRound = { $in: spinIds };
        }
        if (status && gift) {
            // Fetch the spin entries with the specific gift ID
            const spinsWithGift = await SpinModel.find({ gift, status });
            const spinIds = spinsWithGift.map(spin => spin._id);

            // Add spinRound filtering to findby
            findby.spinRound = { $in: spinIds };
        }

        const totalReports = await BillModel.countDocuments(findby);
        const reports = await BillModel.find(findby)
            .populate({
                path: 'spinRound',
                select: 'status gift',
                populate: {
                    path: 'gift',
                    select: 'giftName'
                }
            })
            .populate({ path: 'restaurant', select: 'restaurantNo name phone' })
            .populate({ path: 'customer', select: 'name phone birthYear gender' })
            .skip(skip ?? 0)
            .limit(limit ?? 25)
            .sort({ createdAt: 'desc' })
            .exec();;

        return res.status(200).json({ message: "GET_REPORTS_SUCCESSFUL", totalReports, data: reports })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};

exports.getReportById = async (req, res) => {
    try {
        const id = req.params.id
        const reports = await BillModel.findById(id)
            .populate({
                path: 'spinRound',
                select: 'status gift',
                populate: {
                    path: 'gift',
                    select: 'giftName'
                }
            })
            .populate({ path: 'restaurant', select: 'name' })
            .populate({ path: 'customer', select: 'name phone birthYear gender' })
            .exec();;

        return res.status(200).json({ message: "GET_REPORT_BY_ID_SUCCESSFUL", data: reports })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};

exports.updateReport = async (req, res) => {
    try {
        const spins = req.body;

        const userData = getUserDataOnToken(req, res);
        console.log({ userData })

        if (!Array.isArray(spins) || spins.length === 0) {
            return res.status(400).json({ message: config.messages.BAD_REQUEST });
        }

        const updatedAt = new Date();
        const updateSpins = spins.map(({ _id, status }) => ({
            updateOne: {
                filter: { _id },
                update: { $set: { status, approvedBy: userData.name, updatedAt } }
            }
        }));

        await SpinModel.bulkWrite(updateSpins);

        return res.status(200).json({ message: "UPDATE_REPORT_SUCCESSFUL" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};
exports.reportSpinAndScan = async (req, res) => {
    try {
        let { createdAtStart, createdAtEnd, restaurant } = req.query;

        let findby = {}
        if (restaurant) {
            const restaurantRegex = new RegExp(restaurant, 'i');
            const restaurants = await RestaurantModel.find({ name: { $regex: restaurantRegex } });
            const restaurantIds = restaurants.map(restaurant => restaurant._id);

            findby.restaurant = { $in: restaurantIds };
        }
        if (createdAtStart) {
            // Parse the createdAtStart string into a Date object
            const createdAtDate = new Date(createdAtStart);

            // Extract year, month, and day from createdAtDate
            const year = createdAtDate.getFullYear();
            const month = createdAtDate.getMonth();
            const day = createdAtDate.getDate();

            // Set createdAt field in findby object
            const startOfDay = new Date(Date.UTC(year, month, day));
            const endOfDay = new Date(Date.UTC(year, month, day + 1));

            // Set the $or condition for both createdAt and updatedAt fields
            findby = {
                ...findby,
                $or: [
                    {
                        createdAt: {
                            $gte: startOfDay,
                            $lt: endOfDay
                        }
                    },
                    {
                        updatedAt: {
                            $gte: startOfDay,
                            $lt: endOfDay
                        }
                    }
                ]
            };
        }
        if (createdAtStart && createdAtEnd) {
            const startDate = new Date(createdAtStart);
            const endDate = new Date(createdAtEnd);

            // Move end date to the start of the next day
            endDate.setDate(endDate.getDate() + 1);

            findby = {
                ...findby,
                $or: [{
                    createdAt: {
                        $gte: startDate,
                        $lt: endDate // Use $lt to ensure inclusive end date
                    }
                },
                {
                    updatedAt: {
                        $gte: startDate,
                        $lt: endDate // Use $lt to ensure inclusive end date
                    }
                }
                ]
            };
        }

        // Aggregate scanAmount from Scan schema
        const scanAggregation = await ScanModel.aggregate([
            {
                $match: findby
            },
            {
                $group: {
                    _id: null,
                    totalScanAmount: { $sum: "$scanAmount" }
                }
            }
        ]);
        const totalScanAmount = scanAggregation.length > 0 ? scanAggregation[0].totalScanAmount : 0;
        const totalSpin = await SpinModel.countDocuments(findby).exec();

        return res.status(200).json({ message: "GET_REPORT_SCANS_SPINS_SUCCESSFUL", data: { totalScanAmount, totalSpin } })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};

