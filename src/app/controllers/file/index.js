
const config = require("../../../config");
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({ region: "ap-southeast-1" });

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: "ap-southeast-1",
    signatureVersion: "v4",
    Bucket: process.env.AWS_BUCKET_NAME,
    //   useAccelerateEndpoint: true
});

exports.uploadImage = async (file, res) => {
    try {
        let fileType = file.mimetype;
        if (fileType != "image/jpg" && fileType != "image/png" && fileType != "image/jpeg") {
            return res.status(403).json({ message: "INVALID_IMAGE_FORMAT" });
        }
        const fileData = file.data || file.buffer;
        let _presignedUrl = await getSingedUrl(fileType);

        // Upload image to S3
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME + "/beerlao",
            Key: _presignedUrl.filename, // File name you want to save as in S3
            Body: fileData, // File data
            ContentType: fileType, // MIME type of the file
            ACL: 'public-read' // Optional: Set ACL to make the file public
        };

        await s3.upload(params).promise();

        return _presignedUrl.filename;

    } catch (error) {
        console.log("error: ", error)
        return res.status(500).json({
            message: config.messages.INTERNAL_SERVER_ERROR,
            error: error.toString()
        })
    }
}

exports.getPresignedUrl = async (req, res) => {
    try {
        let fileType = req.body.type;
        if (fileType != "image/jpg" && fileType != "image/png" && fileType != "image/jpeg") {
            return res.status(403).json({ message: "INVALID_IMAGE_FORMAT" });
        }
        let _presignedUrl = await getSingedUrl(req.body.type);
        res.status(200).json(_presignedUrl);

    } catch (error) {
        console.log("error: ", error)
        return res.status(500).json({
            message: config.messages.INTERNAL_SERVER_ERROR,
            error: error.toString()
        })
    }
}

// exports.test = async (req, res) => {
//     console.log(req)
//     res.send(req.body)
// }

const getSingedUrl = async (fileType) => {

    let _splitFileType = fileType.split("/")

    let filename = `${uuidv4()}.${_splitFileType[1]}`

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME + "/beerlao",
        Key: filename,
        Expires: 60 * 5
    };
    try {
        const url = await new Promise((resolve, reject) => {
            s3.getSignedUrl('putObject', params, (err, url) => {
                err ? reject(err) : resolve(url);
            });
        });
        console.log(url);
        // const parts = url.split("?");
        // const baseUrl = parts[0];
        // console.log("Base URL:", baseUrl);
        return { url, filename }
    } catch (err) {
        if (err) {
            console.log({ error: err })
            // res.status(500).json({ err });
        }
    }
}