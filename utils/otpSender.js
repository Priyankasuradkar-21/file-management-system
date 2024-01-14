const sgMail = require("@sendgrid/mail");
const User = require("../model/user");
require("dotenv").config();

const apiKey = process.env.apiKey;
const otpSender = async (email) => {
    const otp = Math.floor(1000 + Math.random() * 9000);
    console.log("OTP:::", otp);

    const msg = {
        to: email,
        from: {
            email: "t3511183@gmail.com",
            name: "File-system",
        },
        subject: "OTP to your account",
        text: `Your OTP is: ${otp}`,
    };

    try {
        sgMail.setApiKey(apiKey);
        await sgMail.send(msg);
        await User.updateOne({ email: email }, {
            otpVerifier: {
                otp: otp,
                isVerified: false
            }
        }
        );
        return 1;
    } catch (error) {
        console.error("ERROR::", error);
        return 0;
    }
};

module.exports = otpSender;
