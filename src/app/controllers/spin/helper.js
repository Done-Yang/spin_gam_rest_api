const axios = require('axios');
// Function to determine the gift based on modulo operation (start new count when the total amount is match the hieghes of gift loop)
// exports.determineGift = (totalSpins, gifts) => {
//     // Get the highest loop value to reset the spins
//     const highestLoopValue = Math.max(...gifts.map(gift => gift.loop));
//     console.log({ highestLoopValue })
//     // Calculate the effective spin position within the loop
//     const effectiveSpinPosition = totalSpins % highestLoopValue;
//     console.log({ effectiveSpinPosition })
//     // Check if the effective spin position matches any gift loop value
//     for (const gift of gifts) {
//         console.log({ giftLoop: gift.loop })
//         if (effectiveSpinPosition === gift.loop) {
//             return gift.giftName;
//         }
//     }
//     return;
// };

/// Function to determine the gift based on customer total spins and the gift loop
exports.determineGift = (totalSpins, gifts) => {
    for (const gift of gifts) {
        if (totalSpins === 0) {
            totalSpins = 1;
        }
        if (totalSpins % gift.loop === 0) {
            return gift.giftName;
        }
    }
    return;
};

exports.sendMessageToBeerLaoService = async ({ customer, phone, gift }) => {
    try {
        const response = await axios.post(process.env.WHATSAPP_URL, {
            messaging_product: "whatsapp",
            to: `856${phone}`,
            type: "template",
            template: {
                name: "appzap_carlsberg_promotion",
                language: {
                    code: "en"
                },
                components: [{
                    type: "body",
                    parameters: [
                        {
                            type: "text",
                            text: `${customer}`
                        },
                        {
                            type: "text",
                            text: `${gift}`
                        }
                    ]
                }]
            }
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(response.data)
    } catch (error) {
        console.log(error);
    }
}