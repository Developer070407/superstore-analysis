const TechnicianModel = require("../models/model").TechnicianModel;
const { text } = require("express");
const { v4: uuidv4 } = require('uuid');

exports.getTechnicians = async () => {
    const technician = await TechnicianModel.find({});
    return technician;
};

exports.createTechnician = async (name) => {
    const technician = new TechnicianModel({
        id: uuidv4(),
        name
    });
    try {
        await technician.save();
        return technician.toJSON();
    } catch (error) {
        console.error(`Error in technician service: ${error.message}`);
        throw new Error(error);
    }
};

exports.deleteTechnician= async (id) => {
    await TechnicianModel.deleteOne({ id });
    return;
};