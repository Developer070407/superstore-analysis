const userService = require("../services/userService");
const UserModel = require("../models/model").UserModel;
const UpdateUserSchema = require("../models/model").UpdateUserSchema;

exports.getUsers = async (req, res) => {
    try {
        const userId = req.id;
        const foundUser = await UserModel.findOne({ id: userId });
        if (foundUser.role !== 'admin') return res.status(403).json({ message: "This action cannot be done due to the wrong role of the user!"});
        const users = await userService.getUsers();
        return res.status(202).json({ message: "Here are all users!", users });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.getUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userService.getUser(userId);
        return res.status(202).json({ message: "User info", user });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const body = req.body;
        if(!body) return res.status(403).json({ message: "At least one part to update should be entered!" });
        const { error } = UpdateUserSchema.validate(body);
        if (error) return res.status(400).json({ message: error.details[0].message });
        const userId = req.params.id;
        const updatedUser = await userService.updateUser(body, userId);
        return res.status(202).json({ message: "User info is updated successfully", updatedUser });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const adminId = req.id;
        const foundUser = await UserModel.findOne({ id: adminId });
        if (foundUser.role !== 'admin') return res.status(403).json({ message: "This action cannot be done due to the wrong role of the user!"});
        await userService.deleteUser(req.params.id);
        return res.status(202).json({ message: "The user has been deleted successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};