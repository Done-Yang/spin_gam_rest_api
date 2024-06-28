const CustomerModel = require('../../models/customerModel');
const ScanModel = require('../../models/scanModel');
const BillModel = require('../../models/billModel');
const SpinModel = require('../../models/spinModel');
const RestauRant = require('../../models/restaurantModel');
const config = require('../../../config');
const mongoose = require('mongoose');

exports.getCustomers = async (req, res) => {
    try {
        let { createdAtStart, createdAtEnd } = req.query;

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

            findby.$or = [
                {
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
            ];
        }

        const totaCustomer = await CustomerModel.countDocuments(findby).exec();

        // Aggregate the count of male and female customers
        const genderCounts = await CustomerModel.aggregate([
            { $match: findby },
            {
                $group: {
                    _id: '$gender',
                    count: { $sum: 1 },
                },
            },
        ]);

        // Transform the aggregation result into an object
        const counts = genderCounts.reduce((acc, genderCount) => {
            acc[genderCount._id] = genderCount.count;
            return acc;
        }, {});

        // Get the current year
        const currentYear = new Date().getFullYear();

        // Aggregate the count of customers by age groups
        const ageGroups = await CustomerModel.aggregate([
            { $match: findby },
            {
                $addFields: {
                    age: {
                        $subtract: [currentYear, { $toInt: "$birthYear" }]
                    }
                }
            },
            {
                $bucket: {
                    groupBy: "$age",
                    boundaries: [18, 26, 36, 61, Infinity],
                    default: "Other",
                    output: {
                        count: { $sum: 1 }
                    }
                }
            }
        ]);

        // Format the results
        const formattedAgeGroups = {
            '-18': 0,
            '18-25': 0,
            '26-35': 0,
            '36-60': 0,
            '60+': 0
        };


        ageGroups.forEach(group => {
            if (group._id === "Other") {
                formattedAgeGroups['-18'] = group.count;
            } else if (group._id === 18) {
                formattedAgeGroups['18-25'] = group.count;
            } else if (group._id === 26) {
                formattedAgeGroups['26-35'] = group.count;
            } else if (group._id === 36) {
                formattedAgeGroups['36-60'] = group.count;
            } else if (group._id === 61) {
                formattedAgeGroups['60+'] = group.count;
            }
        });

        return res.status(200).json({ message: "GET_CUSTOMER_SUCCESSFUL", totaCustomer, gender: counts, ageGroups: formattedAgeGroups })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};

exports.getTopRestaurants = async (req, res) => {
    try {
        let { createdAtStart, createdAtEnd } = req.query;

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

            findby.$or = [
                {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate // Use $lt to ensure inclusive end date
                    }
                }
            ];
        }

        // const aggregationPipeline = [
        //     {
        //         $lookup: {
        //             from: 'scans',
        //             localField: 'restaurant',
        //             foreignField: 'restaurant',
        //             as: 'scans'
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'bills',
        //             localField: 'restaurant',
        //             foreignField: 'restaurant',
        //             as: 'bills'
        //         }
        //     },
        //     {
        //         $addFields: {
        //             totalScans: { $sum: '$scans.scanAmount' },
        //             totalSpins: { $sum: { $size: '$bills.spinRound' } },
        //             menuList: {
        //                 $reduce: {
        //                     input: '$bills.menuList',
        //                     initialValue: [],
        //                     in: { $concatArrays: ['$$value', '$$this'] }
        //                 }
        //             }
        //         }
        //     },
        //     {
        //         $project: {
        //             restaurant: '$restaurant',
        //             totalScans: 1,
        //             totalSpins: 1,
        //             menuList: 1
        //         }
        //     },
        //     {
        //         $sort: { totalScans: -1, totalSpins: -1 }
        //     },
        //     {
        //         $limit: 20
        //     },

        // ];

        // const aggregationPipeline = [
        //     {
        //         $match: findby
        //     },
        //     {
        //         $lookup: {
        //             from: 'scans',
        //             localField: 'restaurant',
        //             foreignField: 'restaurant',
        //             as: 'scans'
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'bills',
        //             localField: 'restaurant',
        //             foreignField: 'restaurant',
        //             as: 'bills'
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'restaurants',
        //             localField: 'restaurant',
        //             foreignField: '_id',
        //             as: 'restaurant'
        //         }
        //     },
        //     {
        //         $addFields: {
        //             totalScans: { $sum: '$scans.scanAmount' },
        //             totalSpins: {
        //                 $sum: { $map: { input: '$bills.spinRound', as: 'spins', in: { $size: '$$spins' } } }
        //             },
        //             flattenedMenuList: {
        //                 $reduce: {
        //                     input: '$bills.menuList',
        //                     initialValue: [],
        //                     in: { $concatArrays: ['$$value', '$$this'] }
        //                 }
        //             },
        //             count: { $sum: 1 }
        //         }
        //     },
        //     {
        //         $unwind: '$flattenedMenuList'
        //     },
        //     {
        //         $group: {
        //             _id: {
        //                 restaurant: { $arrayElemAt: ['$restaurant', 0] },
        //                 product: '$flattenedMenuList.product',
        //             },
        //             totalAmount: { $sum: '$flattenedMenuList.amount' },
        //             // count: { $sum: 1 },
        //             totalScans: { $first: '$totalScans' },
        //             totalSpins: { $first: '$totalSpins' }
        //         }
        //     },
        //     {
        //         $group: {
        //             _id: '$_id.restaurant',
        //             menuList: {
        //                 $push: {
        //                     product: '$_id.product',
        //                     // totalAmount: { $divide: ["$totalAmount", "$count"] }
        //                     totalAmount: "$totalAmount",
        //                     count: '$count'
        //                 }
        //             },
        //             totalScans: { $first: '$totalScans' },
        //             totalSpins: { $first: '$totalSpins' }
        //         }
        //     },
        //     {
        //         $project: {
        //             _id: 0,
        //             restaurant: '$_id',
        //             menuList: 1,
        //             totalScans: 1,
        //             totalSpins: 1,
        //             count: 0
        //         }
        //     },
        //     {
        //         $sort: { totalScans: -1, totalSpins: -1 }
        //     },
        //     {
        //         $limit: 20
        //     }
        // ];

        // const aggregationPipeline = [
        //     {
        //         $match: findby
        //     },
        //     {
        //         $lookup: {
        //             from: 'scans',
        //             localField: 'restaurant',
        //             foreignField: 'restaurant',
        //             as: 'scans'
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'bills',
        //             localField: 'restaurant',
        //             foreignField: 'restaurant',
        //             as: 'bills'
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'restaurants',
        //             localField: 'restaurant',
        //             foreignField: '_id',
        //             as: 'restaurant'
        //         }
        //     },
        //     {
        //         $addFields: {
        //             totalScans: { $sum: '$scans.scanAmount' },
        //             totalSpins: {
        //                 $sum: { $map: { input: '$bills.spinRound', as: 'spins', in: { $size: '$$spins' } } }
        //             },
        //             flattenedMenuList: {
        //                 $reduce: {
        //                     input: '$bills.menuList',
        //                     initialValue: [],
        //                     in: { $concatArrays: ['$$value', '$$this'] }
        //                 }
        //             }
        //         }
        //     },
        //     {
        //         $addFields: {
        //             menuItemCount: { $size: '$flattenedMenuList' } // Count the number of items before unwind
        //         }
        //     },
        //     {
        //         $unwind: '$flattenedMenuList',
        //         preserveNullAndEmptyArrays: true
        //     },
        //     {
        //         $group: {
        //             _id: {
        //                 restaurant: { $arrayElemAt: ['$restaurant', 0] },
        //                 product: '$flattenedMenuList.product',
        //             },
        //             totalAmount: { $sum: '$flattenedMenuList.amount' },
        //             totalScans: { $first: '$totalScans' },
        //             totalSpins: { $first: '$totalSpins' },
        //             // itemCount: { $sum: 1 } // Count items in each group
        //         }
        //     },
        //     {
        //         $group: {
        //             _id: '$_id.restaurant',
        //             menuList: {
        //                 $push: {
        //                     product: '$_id.product',
        //                     totalAmount: '$totalAmount',
        //                 }
        //             },
        //             count: { $first: '$menuItemCount' }, // Use itemCount for the count after unwind
        //             totalScans: { $first: '$totalScans' },
        //             totalSpins: { $first: '$totalSpins' },
        //         }
        //     },
        //     {
        //         $project: {
        //             _id: 0,
        //             restaurant: '$_id',
        //             menuList: 1,
        //             totalScans: 1,
        //             totalSpins: 1,
        //             count: 1 // Include the overallCount in the final output if needed
        //         }
        //     },
        //     {
        //         $sort: { totalScans: -1, totalSpins: -1 }
        //     },
        //     {
        //         $limit: 20
        //     }
        // ];

        const aggregationPipeline = [
            {
                $match: findby
            },
            {
                $lookup: {
                    from: 'scans',
                    localField: 'restaurant',
                    foreignField: 'restaurant',
                    as: 'scans'
                }
            },
            {
                $lookup: {
                    from: 'bills',
                    localField: 'restaurant',
                    foreignField: 'restaurant',
                    as: 'bills'
                }
            },
            {
                $lookup: {
                    from: 'restaurants',
                    localField: 'restaurant',
                    foreignField: '_id',
                    as: 'restaurant'
                }
            },
            {
                $addFields: {
                    totalScans: { $sum: '$scans.scanAmount' },
                    totalSpins: {
                        $sum: { $map: { input: '$bills.spinRound', as: 'spins', in: { $size: '$$spins' } } }
                    },
                    flattenedMenuList: {
                        $reduce: {
                            input: '$bills.menuList',
                            initialValue: [],
                            in: { $concatArrays: ['$$value', '$$this'] }
                        }
                    },
                    billCount: { $size: '$bills' }
                }
            },
            // {
            //     $addFields: {
            //         menuItemCount: { $size: '$flattenedMenuList' } // Count the number of items before unwind
            //     }
            // },
            {
                $unwind: {
                    path: '$flattenedMenuList',
                    preserveNullAndEmptyArrays: true // Preserve documents even if flattenedMenuList is empty
                }
            },
            {
                $group: {
                    _id: {
                        restaurant: { $arrayElemAt: ['$restaurant', 0] },
                        product: '$flattenedMenuList.product',
                    },
                    totalAmount: { $sum: '$flattenedMenuList.amount' },
                    totalScans: { $first: '$totalScans' },
                    totalSpins: { $first: '$totalSpins' },
                    billCount: { $first: '$billCount' }
                }
            },
            {
                $group: {
                    _id: '$_id.restaurant',
                    menuList: {
                        $push: {
                            product: '$_id.product',
                            totalAmount: { $divide: ["$totalAmount", "$billCount"] }
                        }
                    },
                    totalScans: { $first: '$totalScans' },
                    totalSpins: { $first: '$totalSpins' }
                    // menuItemCount: { $first: '$items' } // Retrieve the item count from the previous stage
                }
            },
            {
                $project: {
                    _id: 0,
                    restaurant: '$_id',
                    menuList: 1,
                    totalScans: 1,
                    totalSpins: 1
                    // menuItemCount: 1// Include the menuItemCount in the final output
                }
            },
            {
                $sort: { totalScans: -1, totalSpins: -1 }
            },
            {
                $limit: 20
            }
        ];
        const topRestaurants = await BillModel.aggregate(aggregationPipeline);

        return res.status(200).json({ message: "GET_TOP_RESTAURANT_SUCCESSFUL", data: topRestaurants })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};

exports.getScanAndSpin = async (req, res) => {
    try {
        let { createdAtStart, createdAtEnd } = req.query;

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

            findby.$or = [
                {
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
            ];
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
        console.log({ scanAggregation })
        console.log({ totalSpin })

        return res.status(200).json({ message: "GET_SCAN_AND_SPIN_SUCCESSFUL", data: { totalSpin, totalScan: totalScanAmount } })
    } catch (error) {
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};

exports.getSpinGiftDetial = async (req, res) => {
    try {
        let { createdAtStart, createdAtEnd } = req.query;

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

            findby.$or = [
                {
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
            ];
        }

        // Define the aggregation pipeline
        const giftGroup = await SpinModel.aggregate([
            {
                $group: {
                    _id: "$gift", // Group by gift
                    totalAmount: { $sum: 1 } // Count each occurrence
                }
            },
            {
                $lookup: {
                    from: 'gifts', // The name of the gift collection
                    localField: '_id',
                    foreignField: '_id',
                    as: 'giftDetails'
                }
            },
            {
                $unwind: '$giftDetails' // Unwind the gift details array
            },
            {
                $project: {
                    _id: 0,
                    gift: "$giftDetails",
                    totalAmount: 1
                }
            }
        ]);

        // Calculate the total number of spins
        const totalGift = await SpinModel.countDocuments();

        return res.status(200).json({ message: "GET_SPIN_GIFT_SUCCESSFUL", data: { totalGift, giftGroup } })
    } catch (error) {
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};

exports.getSales = async (req, res) => {
    try {
        let { createdAtStart, createdAtEnd } = req.query;

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

            findby.$or = [
                {
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
            ];
        }

        const salesGroup = await BillModel.aggregate([
            { $unwind: '$menuList' },
            {
                $group: {
                    _id: '$menuList.product',
                    totalAmount: { $sum: '$menuList.amount' },
                    totalPrice: { $sum: '$menuList.totalPrice' }
                }
            },
            {
                $group: {
                    _id: null,
                    products: {
                        $push: {
                            product: '$_id',
                            totalAmount: '$totalAmount',
                            totalPrice: '$totalPrice'
                        }
                    },
                    overallTotalAmount: { $sum: '$totalAmount' }
                }
            },
            {
                $project: {
                    _id: 0,
                    products: 1,
                    overallTotalAmount: 1
                }
            }
        ]);

        console.log(salesGroup);

        return res.status(200).json({ message: "GET_SALES_SUCCESSFUL", data: salesGroup })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};

exports.getSpinTotalsByHourPeriod = async (req, res) => {
    try {
        let { createdAtStart, createdAtEnd, period, restaurant } = req.query;

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

            findby.$or = [
                {
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
            ];
        }
        // const restaurantObjectId = mongoose.Types.ObjectId(restaurantIdString);
        if (restaurant) {
            findby.restaurant = new mongoose.Types.ObjectId(restaurant);
        }

        const timezone = 'Asia/Vientiane'; // Laos time zone

        let startHour = 0;
        let endHour = 11; // Change to 11 to cover the 12-hour period ending at 11:59

        if (period === 'PM') {
            startHour = 12;
            endHour = 23;
        }

        const spinPipeline = [
            {
                $match: {
                    ...findby
                }
            },
            {
                $addFields: {
                    localHour: {
                        $dateToParts: { date: "$createdAt", timezone: timezone }
                    }
                }
            },
            {
                $project: {
                    hour: "$localHour.hour"
                    // customer: 1
                }
            },
            {
                $match: {
                    hour: { $gte: startHour, $lte: endHour }
                }
            },
            {
                $group: {
                    _id: "$hour",
                    count: { $sum: 1 },
                    // uniqueCustomers: { $addToSet: "$customer" } // get customer
                }
            },
            // { // get customer
            //     $addFields: {
            //         uniqueCustomerCount: { $size: "$uniqueCustomers" }
            //     }
            // },
            {
                $sort: { _id: 1 } // Sort by hour (ascending order)
            }
        ];

        const spinResult = await SpinModel.aggregate(spinPipeline);


        const scanPipeline = [
            {
                $match: {
                    ...findby
                }
            },
            {
                $addFields: {
                    localHour: {
                        $dateToParts: { date: "$createdAt", timezone: timezone }
                    }
                }
            },
            {
                $project: {
                    hour: "$localHour.hour",
                }
            },
            {
                $match: {
                    hour: { $gte: startHour, $lte: endHour }
                }
            },
            {
                $group: {
                    _id: "$hour",
                    count: { $sum: 1 },
                }
            },
            {
                $sort: { _id: 1 } // Sort by hour (ascending order)
            }
        ];

        const scanResult = await ScanModel.aggregate(scanPipeline);

        // Constructing the result object with default counts as 0 for all hours in the period
        const hoursResult = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)
            .reduce((acc, hour) => {
                const formattedHour = (hour % 12 === 0 ? 12 : hour % 12).toString().padStart(2, '0') + ':00';
                const spinHour = spinResult.find(item => item._id === hour);
                const scanHour = scanResult.find(item => item._id === hour);

                // Ensure both spinHour and scanHour are properly handled
                if (spinHour && scanHour) {
                    acc[formattedHour] = { scans: scanHour.count, spins: spinHour.count };
                } else if (spinHour) {
                    acc[formattedHour] = { scans: 0, spins: spinHour.count };
                } else if (scanHour) {
                    acc[formattedHour] = { scans: scanHour.count, spins: 0 };
                } else {
                    acc[formattedHour] = { scans: 0, spins: 0 };
                }
                return acc;
            }, {});

        return res.status(200).json({
            message: `GET_SPIN_TOTALS_${period}_SUCCESSFUL`,
            data: hoursResult
        });
    } catch (error) {
        console.error("Error fetching spin totals:", error);
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};
