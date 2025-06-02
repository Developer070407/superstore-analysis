const KnowledgeBaseModel = require("../models/model").KnowledgeBaseModel;
const { v4: uuidv4 } = require('uuid');

exports.getKnowledgeBases = async () => {
    const knowledgeBases = await KnowledgeBaseModel.find({});
    return knowledgeBases;
};

exports.createKnowledgeBase = async (title, symptoms, solutionSteps, category) => {
    const knowledgeBase = new KnowledgeBaseModel({
        id: uuidv4(),
        title,
        symptoms,
        solutionSteps,
        category,
    });
    try {
        await knowledgeBase.save();
        return knowledgeBase.toJSON();
    } catch (error) {
        console.error(`Error in knowledge base service: ${error.message}`);
        throw new Error(error);
    }
};

exports.getKnowledgeBase = async (knowledgeBaseId) => {
    const knowledgeBase = await KnowledgeBaseModel.findOne({ id: knowledgeBaseId });
    return knowledgeBase;
};

exports.updateKnowledgeBase = async (body, knowledgeBaseId) => {
    const updatedKnowledgeBase = await KnowledgeBaseModel.findOneAndUpdate(
        { id: knowledgeBaseId },
        body,
        { new: true }
    );
    return updatedKnowledgeBase;
};

exports.deleteKnowledgeBase = async (id) => {
    await KnowledgeBaseModel.deleteOne({ id });
    return;
};