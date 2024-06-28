const kafka = require('kafka-node');
const chatGPT = require('./chatGPT');
const { Consumer, Offset } = kafka;
const BillModel = require("../models/billModel");
const RestaurantModel = require("../models/restaurantModel");
const ProductModel = require("../models/productModel");
const ScanModel = require("../models/scanModel");
const { response } = require('express');

const pendingRequests = new Map(); // Initialize pendingRequests

exports.connectKafkaConsumer = async () => {
    try {
        const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_URL });

        client.on('ready', () => {
            console.log('Kafka Client is ready');
        });

        client.on('error', (err) => {
            console.error('Kafka Client error', err);
        });

        const consumer = new Consumer(
            client,
            [{ topic: 'appzap-queue', partition: 0 }],
            { autoCommit: true }
        );

        const offset = new Offset(client);

        consumer.on('message', (message) => {
            console.log('Consumer received message');
            const parsedMessage = JSON.parse(message.value);

            try {
                const response = imageProcessing(parsedMessage);
                handleResponse(response, parsedMessage.correlationId);
            } catch {
                console.error('Error in message processing:', error);
                handleResponse({ response: 'INTERNAL_SERVER_ERROR' }, parsedMessage.correlationId);
            }
        });

        consumer.on('error', (err) => {
            console.error('Consumer error', err);
        });

        consumer.on('offsetOutOfRange', (err) => {
            console.error('Consumer offsetOutOfRange', err);

            const topic = err.topic;
            const partition = err.partition;

            offset.fetch([{ topic, partition }], (error, offsets) => {
                if (error) {
                    console.error('Error fetching offset:', error);
                    return;
                }
                const minOffset = Math.min(...offsets[topic][partition]);
                consumer.setOffset(topic, partition, minOffset);
            });
        });
    } catch (error) {
        console.error('Error connecting Kafka consumer:', error);
    }
}

const imageProcessing = async (message) => {
    const reqData = JSON.parse(message);
    const correlationId = reqData.correlationId;
    let response = { correlationId };

    try {
        const jsonData = await chatGPT(reqData.base64Data);
        console.log(jsonData);

        if (jsonData.error) {
            await ScanModel.create({ customer: reqData.customerId });
            response = jsonData;
            console.log({ response })
            return handleResponse(response, correlationId);
        }

        const restaurantDoc = await RestaurantModel.findOne({
            restaurantNo: jsonData.restaurantNo,
        });

        if (!restaurantDoc) {
            await ScanModel.create({ customer: reqData.customerId });
            response.message = "RESTAURANT_NOT_FOUND";
            return handleResponse(response, correlationId);
        }

        const newScan = await ScanModel.create({
            restaurant: restaurantDoc._id,
            scanAmount: 1,
            customer: reqData.customerId
        });

        console.log({ newScan })
        let billDoc;
        if (jsonData.billNo) {
            billDoc = await BillModel.findOne({
                restaurant: restaurantDoc._id,
                billNo: jsonData.billNo,
            });
        } else {
            billDoc = await BillModel.findOne({
                restaurant: restaurantDoc._id,
                billNo: jsonData.billNo,
                billDate: jsonData.date,
                table: jsonData.table
            });
        }

        if (billDoc) {
            response.message = "BILL_ALREADY_EXISTS";
            return handleResponse(response, correlationId);
        }

        const ordersCarlsberg = jsonData.orders.filter(e => e.match);

        if (ordersCarlsberg.length <= 0) {
            response.message = "ORDERS_NOT_MATCH";
            return handleResponse(response, correlationId);
        }

        let spin = 0;
        const products = await ProductModel.find();
        for (let order of ordersCarlsberg) {
            const matchedProduct = products.find(e => e.productNo == order.productNo);
            if (matchedProduct) {
                const productSpin = matchedProduct.amount;
                const spinSum = parseInt(order.amount / productSpin);
                spin += spinSum;
                ordersCarlsberg[0].product = matchedProduct.productName;
            }
        }

        if (spin <= 0) {
            response.message = "CAN_NOT_SPIN";
            response.data = { spinAmount: spin };
            return handleResponse(response, correlationId);
        }

        billDoc = new BillModel({
            restaurant: restaurantDoc._id,
            billNo: jsonData.billNo,
            billDate: jsonData.date,
            phone: jsonData.phone,
            spinAmount: spin,
            menuList: ordersCarlsberg,
            photo: reqData.photo,
            table: jsonData.table,
            customer: reqData.customerId
        });
        billDoc.spinAmount = spin;

        await billDoc.save();

        response.message = "CREATE_BILL_SUCCESSFUL";
        response.data = { spinAmount: billDoc.spinAmount, bill: billDoc._id };
        handleResponse(response, correlationId);
    } catch (error) {
        console.error('Error processing image:', error);
        response.error = 'INTERNAL_SERVER_ERROR';
        handleResponse(response, correlationId);
    }
}

const handleResponse = (response, correlationId) => {
    if (pendingRequests.has(correlationId)) {
        const res = pendingRequests.get(correlationId);
        res.status(response.error ? 500 : 200).json(response);
        pendingRequests.delete(correlationId);
    } else {
        // If no pending request, log the response or take other appropriate actions
        console.log('Response:', response);
    }
}
