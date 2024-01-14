const User = require("../model/user");
const otpSender = require("../utils/otpSender");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const userRegistration = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const isEmailAlreadyExists = await User.findOne({ email });
        if (isEmailAlreadyExists) {
            return res.status(400).json({ err: "Email already exists" });
        }

        const encryptedPassword = await bcrypt.hash(password, 10);
        const userObject = {
            username,
            password: encryptedPassword,
            email
        }

        const newUser = new User(userObject);
        await newUser.save();
        await otpSender(email);
        return res.status(200).json({ msg: "Please verify OTP sent on your mail" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ err: err });
    }
}

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userDetails = await User.findOne({ email });

        if (!userDetails)
            return res.status(400).json({ err: "User not found" });

        if (!userDetails.isAccountVerified)
            return res.status(400).json({ err: "User not verified, Please verify first" });

        const isPasswordMatched = await bcrypt.compare(password, userDetails.password);
        if (!isPasswordMatched)
            return res.status(400).json({ err: "Password not matched" });

        const token = jwt.sign({ id: userDetails._id, email: email }, process.env.secretKey);
        return res.status(200).json({
            token,
            email
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ err: err });
    }
}

const verifyOTP = async (req, res) => {
    try {
        const { otp, email } = req.body;
        const userDetails = await User.findOne({ email });

        if (!userDetails)
            return res.status(400).json({ err: "User not found" });

        if (userDetails.otpVerifier.isVerified)
            return res.status(400).json({ err: "User already verified" });

        if (userDetails.otpVerifier.otp === otp) {
            await User.updateOne({ email }, { $set: { "otpVerifier.isVerified": true, "isAccountVerified": true } });
            return res.status(200).json({ msg: "User verified" });
        }

        return res.status(400).json({ err: "OTP not matched" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ err: err });
    }
}

const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const userDetails = await User.findOne({ email });
        if (!userDetails)
            return res.status(400).json({ err: "User not found" });

        await otpSender(email);
        return res.status(200).json({ msg: "OTP sent" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ err: err });
    }
}
module.exports = {
    userRegistration,
    userLogin,
    verifyOTP,
    resendOTP
}