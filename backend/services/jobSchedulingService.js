const JobsModel = require("../models/model").JobsModel;
const { v4: uuidv4 } = require('uuid');

exports.getJobs = async () => {
    const jobs = await JobsModel.find({});
    return jobs;
};

exports.getJob = async (jobId) => {
    const job = await JobsModel.findOne({ id: jobId });
    return job;
};

exports.createJob = async (supportRequestId, technician, priority, scheduledDate, completedAt) => {
    const job = new JobsModel({
        id: uuidv4(),
        supportRequestId,
        technician,
        priority,
        scheduledDate,
        completedAt
    });
    try {
        await job.save();
        return job.toJSON();
    } catch (error) {
        console.error(`Error in job scheduling service: ${error.message}`);
        throw new Error(error);
    }
};

exports.updateJob = async (body, jobId) => {
    const updatedjob = await JobsModel.findOneAndUpdate(
        { id: jobId },
        body,
        { new: true }
    );
    return updatedjob;
};

exports.deleteJob = async (id) => {
    await JobsModel.deleteOne({ id });
    return;
};