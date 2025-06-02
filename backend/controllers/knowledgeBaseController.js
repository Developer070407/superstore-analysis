const knowledgeBaseService = require("../services/knowledgeBaseService");
const UserModel = require("../models/model").UserModel;
const UpdateKnowledgeBaseSchema = require("../models/model").UpdateKnowledgeBaseSchema;

exports.getKnowledgeBases = async (req, res) => {
    try {
        const knowledgeBases = await knowledgeBaseService.getKnowledgeBases();
        if (!knowledgeBases || knowledgeBases.length === 0) return res.status(404).json({ message: "There is not any knowledge bases!" });
        return res.status(200).json({ message: "User support knowledge bases!", knowledgeBases });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.createKnowledgeBase = async (req, res) => {
    try {
        const userId = req.id;
        const foundUser = await UserModel.findOne({ id: userId });
        if (foundUser.role !== 'admin') return res.status(403).json({ message: "This action cannot be done due to the wrong role of the user!"});
        const { title, symptoms, solutionSteps, category } = req.body;
        if (!title || !symptoms || !solutionSteps || !category)
            return res.status(400).json({ message: "Enter all inputs!" });
        const newKnowledgeBase = await knowledgeBaseService.createKnowledgeBase(title, symptoms, solutionSteps, category);
        return res.status(201).json({ message: "Knowledge base has been created successfully!", newKnowledgeBase });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.getKnowledgeBase = async (req, res) => {
    try {
        const knowledgeBaseId = req.params.id;
        const knowledgeBase = await knowledgeBaseService.getKnowledgeBase(knowledgeBaseId);
        if (!knowledgeBase) return res.status(404).json({ message: "There is not any knowledge base!" })
        return res.status(200).json({ message: "User support knowledge base", knowledgeBase });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.updateKnowledgeBase = async (req, res) => {
    try {
        const body = req.body;
        const foundUser = await UserModel.findOne({ id: req.id });
        if ((foundUser.role !== 'admin')) return res.status(403).json({ message: "This action cannot be done due to the wrong role of the user!"});
        const { error } = UpdateKnowledgeBaseSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
        if(!body) return req.status(403).json({ message: "At least one part to update should be entered!" });
        const knowledgeBaseId = req.params.id;
        const updatedKnowledgeBase = await knowledgeBaseService.updateKnowledgeBase(body, knowledgeBaseId);
        return res.status(200).json({ message: "User support knowledge base is updated successfully", updatedKnowledgeBase });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.deleteKnowledgeBase = async (req, res) => {
    try {
        await knowledgeBaseService.deleteKnowledgeBase(req.params.id);
        return res.status(202).json({ message: "The user support knwoledge base has been deleted successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};