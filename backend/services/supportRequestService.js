const SupportRequestModel = require("../models/model").SupportRequestModel;
const { v4: uuidv4 } = require('uuid');

exports.createRequest = async (userId, deviceType, problemDescription, quote, scheduledDate, status) => {
    const supportRequest = new SupportRequestModel({
        id: uuidv4(),
        userId,
        deviceType,
        problemDescription,
        quote,
        scheduledDate,
        status
    });
    try {
        await supportRequest.save();
        return supportRequest.toJSON();
    } catch (error) {
        console.error(`Error in support request service: ${error.message}`);
        throw new Error(error);
    }
};

exports.viewRequests = async () => {
    const requests = await SupportRequestModel.find({});
    return requests;
};

exports.getUserRequests = async (userId) => {
    const requests = await SupportRequestModel.find({ userId: userId });
    return requests;
};

exports.viewRequest = async (requestId) => {
    const request = await SupportRequestModel.findOne({ id: requestId });
    return request;
};

exports.updateUserRequest = async (body, requestId) => {
    const updatedRequest = await SupportRequestModel.findOneAndUpdate(
        { id: requestId },
        body,
        { new: true }
    );
    return updatedRequest;
};

exports.deleteUserRequest = async (requestId) => {
    await SupportRequestModel.deleteOne({ id: requestId });
    return;
};