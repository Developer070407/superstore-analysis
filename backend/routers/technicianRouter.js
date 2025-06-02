const express = require("express");
const router = express.Router();
const technicianController = require("../controllers/technicianController");
const authenticate = require("../extras/auth");

router.delete("/:id", authenticate, technicianController.deleteTechnician);
router.get("/", authenticate, technicianController.getTechnicians);
router.post("/", authenticate, technicianController.createTechnician)

module.exports = router;