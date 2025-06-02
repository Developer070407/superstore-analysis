const express = require("express");
const router = express.Router();
const knowledgeController = require("../controllers/knowledgeBaseController");
const authenticate = require("../extras/auth");

router.get("/", authenticate, knowledgeController.getKnowledgeBases);
router.get("/:id", authenticate, knowledgeController.getKnowledgeBase);
router.post("/", authenticate, knowledgeController.createKnowledgeBase);
router.put("/:id", authenticate, knowledgeController.updateKnowledgeBase);
router.delete("/:id", authenticate, knowledgeController.deleteKnowledgeBase);

module.exports = router;