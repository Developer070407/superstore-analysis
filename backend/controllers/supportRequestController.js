const supportRequestService = require("../services/supportRequestService");
const UserModel = require("../models/model").UserModel;
const UpdateRequestSchema = require("../models/model").UpdateRequestSchema;

exports.createRequest = async (req, res) => {
    try {
        const userId = req.id;
        const { deviceType, problemDescription, quote='', scheduledDate, status } = req.body;

        if (!deviceType || !problemDescription || !scheduledDate || !status)
            return res.status(400).json({ message: "Enter all inputs!" });

        const newSupportRequest = await supportRequestService.createRequest(userId, deviceType, problemDescription, quote, scheduledDate, status);
        return res.status(201).json({ message: "Support request has been created successfully!", newSupportRequest });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.viewRequests = async (req, res) => {
    try {
        const userId = req.id;
        const foundUser = await UserModel.findOne({ id: userId });
        if (foundUser.role !== 'admin') return res.status(403).json({ message: "This action cannot be done due to the wrong role of the user!"});
        const requests = await supportRequestService.viewRequests();
        if (!requests || requests.length === 0) return res.status(404).json({ message: "There is not any support requests!"});
        return res.status(200).json({ message: "User support requests", requests });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.getUserRequests = async (req, res) => {
    try {
        const userId = req.id;
        const requests = await supportRequestService.getUserRequests(userId);
        if (!requests || requests.length === 0) {
            return res.status(404).json({ message: "There are no support requests for this user." });
        }

        return res.status(200).json({ message: "User support requests retrieved successfully.", requests });
    } catch (error) {
        console.error("Error fetching user support requests:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.viewRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        const request = await supportRequestService.viewRequest(requestId);
        if (!request) return res.status(404).json({ message: "There is not any support request!"});
        return res.status(200).json({ message: "User support request", request });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.updateUserRequest = async (req, res) => {
    try {
        const body = req.body;
        const foundUser = await UserModel.findOne({ id: req.id });
        if ((foundUser.role !== 'admin') && (Object.keys(body).includes("status") || Object.keys(body).includes("quote"))) return res.status(403).json({ message: "This action cannot be done due to the wrong role of the user!"});
        const { error } = UpdateRequestSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
        if (!body || Object.keys(body).length === 0) {
            return res.status(400).json({ message: "At least one field must be provided to update!" });
        }        
        const requestId = req.params.id;
        const updatedRequest = await supportRequestService.updateUserRequest(body, requestId);
        return res.status(200).json({ message: "User support request is updated successfully", updatedRequest });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.deleteUserRequest = async (req, res) => {
    try {
        await supportRequestService.deleteUserRequest(req.params.id);
        return res.status(202).json({ message: "The user support request has been deleted successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};