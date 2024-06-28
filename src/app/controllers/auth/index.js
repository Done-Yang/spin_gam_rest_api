const { generateTokens } = require('../../middlewares')
const config = require('../../../config');

const userData = { name: "BeerLao", email: "beerlao01@gmail.com", password: "beerlao@2024" }
exports.login = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: config.messages.BAD_REQUEST
            })
        }

        // let user = email === userData.email;
        if (email !== userData.email) {
            return res.status(400).json({
                message: config.messages.INVALID_EMAIL_OR_PASSWORD
            })
        }
        // const isValidPassword = await bcrypt.compare(password, user.password);
        //check member or email
        // const isValidPassword = password === userData.password;
        // console.log({ password: isValidPassword })
        if (password !== userData.password) {
            return res.status(400).json({
                message: config.messages.INVALID_EMAIL_OR_PASSWORD
            })
        }

        const { accessToken } = await generateTokens({ name: userData.name });


        return res.status(200).json({
            data: { name: userData.name },
            accessToken
        });
    } catch (error) {
        console.log("error: ", error)
        return res.status(500).json({ message: config.messages.INTERNAL_SERVER_ERROR });
    }
};
