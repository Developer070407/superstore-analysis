const SparePartModel = require("../models/model").SparePartModel;
const { v4: uuidv4 } = require('uuid');

exports.getParts = async () => {
    const parts = await SparePartModel.find({});
    return parts;
};

exports.createPart = async (partName, stock, price, description) => {
    const part = new SparePartModel({
        id: uuidv4(),
        partName,
        stock,
        price,
        description,
    });
    try {
        await part.save();
        return part.toJSON();
    } catch (error) {
        console.error(`Error in spare part service: ${error.message}`);
        throw new Error(error);
    }
};

exports.getPart = async (partId) => {
    const part = await SparePartModel.findOne({ id: partId });
    return part;
};

exports.updatePart = async (body, partId) => {
    const updatedPart = await SparePartModel.findOneAndUpdate(
        { id: partId },
        body,
        { new: true }
    );
    return updatedPart;
};

exports.deletePart = async (id) => {
    await SparePartModel.deleteOne({ id });
    return;
};