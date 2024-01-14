const mongoose = require("mongoose");
require("dotenv").config();
const MONGO_URI = process.env.MONGO_URI;
mongoose.set("strictQuery", false);

class MongoDB {
    constructor() {
        if (!MongoDB.instance) {
            mongoose.connect(MONGO_URI).then(() => {
                console.log('[+CONNECTION MADE SUCCESSFULLY+]')
            }).catch((err) => {
                console.log('[+CONNECTION REFUSED+] :: ', err)
            })
        }
    }
}

const mongoDB = new MongoDB();
Object.freeze(mongoDB);
module.exports = { mongoDB };