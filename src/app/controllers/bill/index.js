const BillModel = require("../../models/billModel");
const RestaurantModel = require("../../models/restaurantModel");
const ProductModel = require("../../models/productModel");
const ScanModel = require("../../models/scanModel");
// const CustomerModel = require("../../models/customerModel");
const config = require("../../../config");
const { uploadImage } = require("../file");
const chatGPT = require("../../helpers/chatGPT");

// Create bill demo
exports.createBill = async (req, res) => {
  try {
    const customer = req.body.customer;
    if (!customer) {
      return res.status(400).json({ message: config.messages.BAD_REQUEST });
    }

    const billData = {
      restaurant: "Windy Café Bar & Restaurant",
      table: 2,
      phone: "020123422",
      billNo: "fsdsddf",
      billDate: "25-05-2024",
      menuList: [
        {
          product: "CARLSBERG 330 ML",
          amount: 100000,
          price: 20000,
          totalPrice: 200000,
        },
      ],
    };

    billData.customer = customer;
    const isRestaurantExisted = await RestaurantModel.findOne({
      name: billData.restaurant,
    });

    if (!isRestaurantExisted) {
      const createScan = await ScanModel.create({});
      console.log("restaurant not exist 'create new restaturant'");
      console.log(createScan);
      return res
        .status(400)
        .json({ message: "INVALID_RESTAURANT", data: { scanAmount: "+1" } });
    } else {
      billData.restaurant = isRestaurantExisted._id;
      const scanAmountPlusOne = await ScanModel.findOneAndUpdate(
        { restaurant: isRestaurantExisted._id },
        {
          $inc: { scanAmount: 1 },
          $set: { updatedAt: Date.now() },
        },
        { new: true } // Return the updated document
      );
      console.log("restaurant exist'update reataurant scan amount'");
      console.log(scanAmountPlusOne);
    }

    const [day, month, year] = billData.billDate.split("-");
    billData.billDate = new Date(`${year}-${month}-${day}`);

    //TODO: Check this line is work well or not and comfirm the formular with team
    const isBillExisted = await BillModel.findOne({
      restaurant: billData.restaurant,
      table: billData.table,
      phone: billData.phone,
      billNo: billData.billNo,
      billDate: billData.billDate,
    });

    if (isBillExisted) {
      return res.status(400).json({ message: "BILL_IS_EXISTED" });
    }

    // const products = await ProductModel.distinct('productName amount');
    const products = await ProductModel.aggregate([
      {
        $group: {
          _id: { id: "$_id", productName: "$productName", amount: "$amount" },
        },
      },
      {
        $project: {
          _id: "$_id.id",
          productName: "$_id.productName",
          amount: "$_id.amount",
        },
      },
    ]);

    // Function to check and log existing products
    let menuList = [];
    const logExistingProducts = (menu, products) => {
      let spinAmount = 0;
      products.forEach((productsItem) => {
        menu.forEach((menuItem) => {
          if (menuItem.product === productsItem.productName) {
            const spinCheck = menuItem.amount / productsItem.amount;
            spinAmount += parseInt(spinCheck);
            menuItem._id = productsItem._id;
            menuList.push(menuItem);
          }
        });
      });
      return spinAmount;
    };
    console.log({ menuList });
    const spinAmount = logExistingProducts(billData.menuList, products);
    if (spinAmount <= 0) {
      return res
        .status(400)
        .json({ message: "CONDITION_NOT_PASSED", spinAmount });
    }

    //TODO: uncommand the upload image to s3
    // const photo = getPresignedUrl(req, res);
    const photo = "testDemoImage.png";
    billData.menuList = menuList;
    console.log({ billDatAMenuList: billData.menuList });
    const newBill = await BillModel.create({ ...billData, spinAmount, photo });

    return res.status(200).json({
      message: "CREATE_BILL_SUCCESSFUL",
      data: { spinAmount, bill: newBill._id },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: config.messages.INTERNAL_SERVER_ERROR });
  }
};


///Create bill by detecting bill
exports.uploadBill = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ error: "NO FILE UPLOADED" });
    }

    if (!req.body.customerId) {
      return res.status(400).send({ error: "CUSTOMER NOT FOUND" });
    }

    // const customerScan = await CustomerModel.countDocuments().exec();

    const encodedData = req.file.buffer.toString("base64");
    const base64Data = `data:image/jpeg;base64,${encodedData}`;

    const jsonData = await chatGPT(base64Data);
    console.log(jsonData);

    if (jsonData.error) {
      await ScanModel.create({ customer: req.body.customerId });
      return res.status(400).send(jsonData);
    }

    const _restaurantDoc = await RestaurantModel.findOne({
      restaurantNo: jsonData.restaurantNo,
    });
    // console.log({ _restaurantDoc })
    if (!_restaurantDoc) {
      await ScanModel.create({ customer: req.body.customerId });
      return res.status(400).json({ message: "RESTAURANT_NOT_FOUND" });
    }

    console.log({ customer: req.body.customerId })
    const newScan = await ScanModel.create({
      restaurant: _restaurantDoc._id,
      scanAmount: 1,
      customer: req.body.customerId
    });
    console.log({ newScan })


    const _ordersCarlsberg = jsonData.orders.filter((e) => e.match);

    if (_ordersCarlsberg.length <= 0) {
      return res.status(400).json({ message: "ORDERS_NOT_MATCH" });
    };


    // TODO: ຄິດໄລຈຳນວນທີ່ໄດ້ spin
    let _spin = 0;
    const products = await ProductModel.find();
    for (let order of _ordersCarlsberg) {
      const _matchOrderWithProduct = products.find(
        (e) => e.productNo == order.productNo
      );
      if (_matchOrderWithProduct) {
        let _productSpin = _matchOrderWithProduct.amount; // ຈຳນວນອໍເດີຕໍ່ 1 spin
        const _spinSum = parseInt(order.amount / _productSpin); // ຈຳນວນ spin ທີ່ໄດ້
        _spin += _spinSum;
        _ordersCarlsberg[0].product = _matchOrderWithProduct.productName
        // console.log({ _ordersCarlsberg })
      }
    }


    // TODO: ກວດສອບບິນນີ້ ມີການນຳໃຊ້ແລ້ວບໍ
    let _billDoc = await BillModel.findOne({
      restaurant: _restaurantDoc._id,
      billNo: jsonData.billNo,
      billDate: jsonData.date,
      table: jsonData.table
    });
    if (_billDoc) {
      return res.status(400).json({ message: "BILL_ALREADY_EXISTS" });
    };

    if (_spin <= 0) {
      return res.status(400).json({ message: "CAN_NOT_SPIN", data: { spinAmount: _spin } })
    }

    const photo = await uploadImage(req.file, res);
    console.log(photo)
    _billDoc = new BillModel({
      restaurant: _restaurantDoc._id,
      billNo: jsonData.billNo,
      billDate: jsonData.date,
      phone: jsonData.phone,
      spinAmount: _spin,
      menuList: _ordersCarlsberg,
      photo: photo,
      table: jsonData.table,
      customer: req.body.customerId
    });
    _billDoc.spinAmount = _spin;

    await _billDoc.save();
    // return res.status(200).send(jsonData);
    return res.status(200).json({
      message: "CREATE_BILL_SUCCESSFUL",
      data: { spinAmount: _billDoc.spinAmount, bill: _billDoc._id },
    });
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message });
  }
};

// exports.uploadBill = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).send({ error: "NO FILE UPLOADED" });
//     }

//     if (!req.body.customerId) {
//       return res.status(400).send({ error: "CUSTOMER NOT FOUND" });
//     }

//     const totalRequests = 10;  // Total number of requests to send (for example purposes)
//     const delay = 1000;  // Delay in milliseconds (1000 ms = 1 second)

//     // Perform the load test
//     for (let i = 0; i < totalRequests; i++) {
//       await new Promise(resolve => setTimeout(resolve, delay));
//     }

//     // return res.status(200).send(jsonData);
//     return res.status(200).json({
//       message: "CREATE_BILL_SUCCESSFUL",
//     });
//   } catch (error) {
//     return res.status(500).send({ error: true, message: error.message });
//   }
// };

// Get all products
// exports.getProducts = async (req, res) => {
//     try {
//         const { skip, limit } = req.params;

//         const totaProduct = await BillModel.countDocuments().exec();
//         const products = await BillModel.find({})
//             .skip(skip ?? 0)
//             .limit(limit ?? 25)
//             .sort({ createdAt: 'desc' })
//             .exec();

//         if (!products) {
//             return res.status(400).json({ message: "NO_PRODUCT_EXIST" })
//         }

//         return res.status(200).json({ message: "GET_PRODUCTS_SUCCESSFUL", totaProduct, data: products })
//     } catch (error) {
//         return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
//     }
// };

// Get gift by id
// exports.getProduct = async (req, res) => {
//     try {
//         const id = req.params.id;
//         if (!id) {
//             return res.status(400).json({ message: config.messages.BAD_REQUEST });
//         }
//         const product = await BillModel.findById(id);

//         return res.status(200).json({ message: "GET_PRODUCT_SUCCESSFUL", data: product })
//     } catch (error) {
//         return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
//     }
// };

// Update Product
// exports.updateProduct = async (req, res) => {
//     try {
//         const id = req.params.id;
//         if (!id) {
//             return res.status(400).json({ message: config.messages.BAD_REQUEST });
//         }
//         const productUpdate = req.body;
//         const product = await BillModel.findByIdAndUpdate(id, productUpdate);

//         return res.status(200).json({ message: "UPDATE_PRODUCT_SUCCESSFUL", data: product._id })
//     } catch (error) {
//         return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
//     }
// };

// Delete Product
// exports.deleteProduct = async (req, res) => {
//     try {
//         const id = req.params.id;
//         if (!id) {
//             return res.status(400).json({ message: config.messages.BAD_REQUEST });
//         }
//         const product = await BillModel.findByIdAndDelete(id);

//         return res.status(200).json({ message: "DELETE_PRODUCT_SUCCESSFUL", data: product._id })
//     } catch (error) {
//         return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
//     }
// };
