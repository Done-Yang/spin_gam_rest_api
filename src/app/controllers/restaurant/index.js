const Restaurant = require('../../models/restaurantModel');
const config = require('../../../config');

// Create restaurant
exports.createRestaurant = async (req, res) => {
    try {
        const restaurant = req.body
        if (!restaurant.name || !restaurant.phone) {
            return res.status(400).json({ message: config.messages.BAD_REQUEST })
        }

        console.log(restaurant);
        const newRestaurant = await Restaurant.create(restaurant);
        // const datas = { ...gift, currentAmount }

        return res.status(200).json({ message: "CREATE_RESTAURANT_SUCCESSFUL", data: newRestaurant._id });
    } catch (error) {
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};
