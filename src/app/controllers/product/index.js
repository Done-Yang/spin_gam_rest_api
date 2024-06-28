const ProductModel = require('../../models/productModel');
const config = require('../../../config');

// Create product
exports.createProduct = async (req, res) => {
    try {
        const product = req.body
        if (!product.productName || !product.amount) {
            return res.status(400).json({ message: config.messages.BAD_REQUEST })
        }

        const isProductExisted = await ProductModel.findOne({ productName: product.productName });
        if (isProductExisted) {
            return res.status(400).json({ message: "PRODUCT_ALREADY_EXISTS" });
        }
        const newProduct = await ProductModel.create(product);
        // const datas = { ...gift, currentAmount }

        return res.status(200).json({ message: "CREATE_PRODUCT_SUCCESSFUL", data: newProduct._id });
    } catch (error) {
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};

// Get all products
exports.getProducts = async (req, res) => {
    try {
        const { skip, limit } = req.params;
        const productName = req.query.productName
        let findby = {}

        if (productName) {
            const regexPattern = new RegExp(productName, 'i');
            findby = { productName: regexPattern };
        }

        const totaProduct = await ProductModel.countDocuments(findby).exec();
        const products = await ProductModel.find(findby)
            .skip(skip ?? 0)
            .limit(limit ?? 25)
            .sort({ createdAt: 'desc' })
            .exec();

        if (!products) {
            return res.status(400).json({ message: "NO_PRODUCT_EXIST" })
        }

        return res.status(200).json({ message: "GET_PRODUCTS_SUCCESSFUL", totaProduct, data: products })
    } catch (error) {
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};

// Get gift by id
exports.getProduct = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: config.messages.BAD_REQUEST });
        }
        const product = await ProductModel.findById(id);

        return res.status(200).json({ message: "GET_PRODUCT_SUCCESSFUL", data: product })
    } catch (error) {
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};

// Update Product
exports.updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: config.messages.BAD_REQUEST });
        }
        const productUpdate = req.body;

        const isProductExisted = await ProductModel.findOne({ productName: productUpdate.productName });
        if (isProductExisted) {
            return res.status(400).json({ message: "PRODUCT_ALREADY_EXISTS" });
        }
        const updatedAt = new Date();
        const product = await ProductModel.findByIdAndUpdate(id, { ...productUpdate, updatedAt });

        return res.status(200).json({ message: "UPDATE_PRODUCT_SUCCESSFUL", data: product._id })
    } catch (error) {
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: config.messages.BAD_REQUEST });
        }
        const product = await ProductModel.findByIdAndDelete(id);

        return res.status(200).json({ message: "DELETE_PRODUCT_SUCCESSFUL", data: product._id })
    } catch (error) {
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};