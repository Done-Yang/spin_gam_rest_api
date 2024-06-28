const CustomerModel = require('../../models/customerModel');
const config = require('../../../config');

// Create customer
exports.createCustomer = async (req, res) => {
    try {
        const customer = req.body
        if (!customer.name || !customer.gender || !customer.birthYear || !customer.phone) {
            return res.status(400).json({ message: config.messages.BAD_REQUEST })
        }
        if (customer.phone.length != 10) {
            return res.status(400).json({ message: "INVALID_PHONE_NUMBER" });
        }

        const isCustomerExisted = await CustomerModel.findOne({ phone: customer.phone });
        if (isCustomerExisted) {
            const updatedAt = new Date();
            const updateCustomer = await CustomerModel.findByIdAndUpdate(isCustomerExisted._id, { ...customer, updatedAt });

            return res.status(200).json({ message: "UPDATE_CUSTOMER_SUCCESSFUL", data: updateCustomer._id });
        }

        const newCustomer = await CustomerModel.create(customer);

        return res.status(200).json({ message: "CREATE_CUSTOMER_SUCCESSFUL", data: newCustomer._id });
    } catch (error) {
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};

// Get all customer
exports.getCustomers = async (req, res) => {
    try {
        const { skip, limit } = req.params;
        const totalCustomer = await CustomerModel.countDocuments().exec();
        const customers = await CustomerModel.find({})
            .skip(skip ?? 0)
            .limit(limit ?? 25)
            .sort({ createdAt: 'desc' })
            .exec();

        return res.status(200).json({ message: "GET_CUSTOMER_SUCCESSFUL", totalCustomer, data: customers })
    } catch (error) {
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};

// Get  customer by id
exports.getCustomer = async (req, res) => {
    try {
        const id = req.params.id;
        const customer = await CustomerModel.findById(id);

        return res.status(200).json({ message: "GET_CUSTOMER_SUCCESSFUL", data: customer })
    } catch (error) {
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};

// Get  customer by phone
exports.getCustomerByPhone = async (req, res) => {
    try {
        const phone = req.params.phone;
        const customer = await CustomerModel.findOne({ phone });

        return res.status(200).json({ message: "GET_CUSTOMER_BYPHONE_SUCCESSFUL", data: customer })
    } catch (error) {
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};
