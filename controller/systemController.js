const Configuration = require("../model/systemConfig");

const createSystemConfig = async (req, res) => {
    try {
        const { storageService } = req.body;
        const isSystemConfigExists = await Configuration.findOne({ userId: req.user._id.toString() });

        if (isSystemConfigExists)
            return res.status(400).json({ err: "Storage config already exists" });

        const systemObject = {
            storageService,
            userId: req.user._id.toString()
        }

        const systemConfig = new Configuration(systemObject);
        await systemConfig.save();

        return res.status(200).json({ msg: "Storage config created successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ err: err });
    }
}

const getSystemConfig = async (req, res) => {
    try {

        const getSystemDetails = await Configuration.findOne({ userId: req.user._id.toString() });
        if (!getSystemDetails)
            return res.status(400).json({ err: "Storage config not found" });

        return res.status(200).json({ StorageInfo: getSystemDetails });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ err: err });
    }
}

const updateSystemConfig = async (req, res) => {
    try {
        const { storageService } = req.body;
        const isSystemConfigExists = await Configuration.findOne({ userId: req.user._id.toString() });

        if (!isSystemConfigExists)
            return res.status(400).json({ err: "Storage config not found" });

        await Configuration.updateOne({ userId: req.user._id.toString() }, {
            $set: {
                storageService
            }
        })

        return res.status(200).json({ msg: "Storage config updated successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ err: err });
    }
}


module.exports = {
    createSystemConfig,
    getSystemConfig,
    updateSystemConfig
}