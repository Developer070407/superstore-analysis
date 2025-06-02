const sparePartsService = require("../services/sparePartsService");
const UserModel = require("../models/model").UserModel;
const UpdatePartSchema = require("../models/model").UpdatePartSchema;

exports.getParts = async (req, res) => {
    try {
        const parts = await sparePartsService.getParts();
        if (!parts || parts.length === 0) return res.status(404).json({ message: "There is not any parts!" });
        return res.status(200).json({ message: "User support kspare parts!", parts });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.createPart = async (req, res) => {
    try {
        const userId = req.id;
        const foundUser = await UserModel.findOne({ id: userId });
        if (foundUser.role !== 'admin') return res.status(403).json({ message: "This action cannot be done due to the wrong role of the user!"});
        const { partName, stock, price, description } = req.body;
        if (!partName || !stock || !price || !description)
            return res.status(400).json({ message: "Enter all inputs!" });
        const newPart = await sparePartsService.createPart(partName, stock, price, description);
        return res.status(201).json({ message: "Spare part has been created successfully!", newPart });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.getPart = async (req, res) => {
    try {
        const partId = req.params.id;
        const part = await sparePartsService.getPart(partId);
        if (!part) return res.status(404).json({ message: "There is not any knowledge base!" })
        return res.status(200).json({ message: "Spare part", part });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.updatePart = async (req, res) => {
    try {
        const body = req.body;
        const foundUser = await UserModel.findOne({ id: req.id });
        if ((foundUser.role !== 'admin')) return res.status(403).json({ message: "This action cannot be done due to the wrong role of the user!"});
        const { error } = UpdatePartSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
        if(!body) return req.status(403).json({ message: "At least one part to update should be entered!" });
        const partId = req.params.id;
        const updatedpart = await sparePartsService.updatePart(body, partId);
        return res.status(200).json({ message: "Spare part is updated successfully", updatedpart });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.deletePart = async (req, res) => {
    try {
        await sparePartsService.deletePart(req.params.id);
        return res.status(202).json({ message: "The spare part has been deleted successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};