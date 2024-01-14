const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.secretKey;
const User = require("../model/user");

module.exports = (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ error: "Unauthorized User" });
    }

    const token = authorization.replace("Bearer ", "");
    jwt.verify(token, secretKey, async (err, payload) => {
        if (err) {
            return res.status(401).json({ error: "Unauthorized User" });
        }

        const { id } = payload;
        const userDetails = await User.findById(id);
        if (!userDetails) {
            return res.status(401).json({ error: "Unauthorized User" });
        }

        if (!userDetails.isAccountVerified) {
            return res.status(401).json({ error: "Please verify your account first" });
        }
        req.user = userDetails;
        next();
    });
};