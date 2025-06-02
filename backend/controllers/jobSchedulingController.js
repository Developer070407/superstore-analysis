const { UserModel } = require("../models/model");
const jobSchedulingService = require("../services/jobSchedulingService");
const JobsModel = require("../models/model").JobsModel;
const UpdateJobSchema = require("../models/model").UpdateJobSchema;

exports.getJobs = async (req, res) => {
    try {
        const jobs = await jobSchedulingService.getJobs();
        if (!jobs || jobs.length === 0) return res.status(404).json({ message: "There is not any jobs!" });
        return res.status(200).json({ message: "Jobs!", jobs });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.getJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await jobSchedulingService.getJob(jobId);
        if (!job) return res.status(404).json({ message: "There is not any job!" })
        return res.status(200).json({ message: "User support job", job });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.createJob = async (req, res) => {
    try {
        const userId = req.id;
        const foundUser = await UserModel.findOne({ id: userId });
        if (foundUser.role !== 'admin') return res.status(403).json({ message: "This action cannot be done due to the wrong role of the user!"});
        const { supportRequestId, technician, priority, scheduledDate, completedAt } = req.body;
        if (!supportRequestId || !technician || !priority || !scheduledDate || !completedAt)
            return res.status(400).json({ message: "Enter all inputs!" });
        const newJob = await jobSchedulingService.createJob(supportRequestId, technician, priority, scheduledDate, completedAt);
        return res.status(201).json({ message: "Job has been created successfully!", newJob });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const body = req.body;
        const foundUser = await UserModel.findOne({ id: req.id });
        if ((foundUser.role !== 'admin')) return res.status(403).json({ message: "This action cannot be done due to the wrong role of the user!"});
        const { error } = UpdateJobSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
        if(!body) return req.status(403).json({ message: "At least one part to update should be entered!" });
        const jobId = req.params.id;
        const updatedJob = await jobSchedulingService.updateJob(body, jobId);
        return res.status(200).json({ message: "Job is updated successfully", updatedJob });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const foundUser = await UserModel.findOne({ id: req.id });
        if ((foundUser.role !== 'admin')) return res.status(403).json({ message: "This action cannot be done due to the wrong role of the user!"});
        await jobSchedulingService.deleteJob(req.params.id);
        return res.status(202).json({ message: "The job has been deleted successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};