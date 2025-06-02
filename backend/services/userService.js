const UserModel = require("../models/model").UserModel;

exports.getUsers = async () => {
    const users = await UserModel.find({});
    return users;
};

exports.getUser = async (userId) => {
    const user = await UserModel.findOne({ id: userId });
    return user;
};

exports.updateUser = async (body, userId) => {
    const updatedUser = await UserModel.findOneAndUpdate(
        { id: userId },
        body,
        { new: true }
    );
    return updatedUser;
};

exports.deleteUser = async (userId) => {
    await UserModel.deleteOne({ id: userId });
    return;
};