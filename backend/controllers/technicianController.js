const technicianService = require("../services/technicianService");
const TechnicianModel = require("../models/model").TechnicianModel;
const UserModel = require("../models/model").UserModel;


exports.getTechnicians = async (req, res) => {
    try {
        const userId = req.id;
        const foundUser = await UserModel.findOne({ id: userId });
        if (foundUser.role !== 'admin') return res.status(403).json({ message: "This action cannot be done due to the wrong role of the user!"});
        const technicians = await technicianService.getTechnicians();
        return res.status(202).json({ message: "Here are all technicians!", technicians });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.createTechnician = async (req, res) => {
    try {
        const userId = req.id;
        const foundUser = await UserModel.findOne({ id: userId });
        if (foundUser.role !== 'admin') return res.status(403).json({ message: "This action cannot be done due to the wrong role of the user!"});
        const { name } = req.body;
        if (!name)
            return res.status(400).json({ message: "Enter all inputs!" });
        const newTechnician = await technicianService.createTechnician(name);
        return res.status(201).json({ message: "Technician has been created successfully!", newTechnician });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.deleteTechnician = async (req, res) => {
    try {
        const adminId = req.id;
        const foundUser = await UserModel.findOne({ id: adminId });
        if (foundUser.role !== 'admin') return res.status(403).json({ message: "This action cannot be done due to the wrong role of the user!"});
        await technicianService.deleteTechnician(req.params.id);
        return res.status(202).json({ message: "The technician has been deleted successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};