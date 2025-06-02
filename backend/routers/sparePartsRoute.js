const express = require("express");
const router = express.Router();
const partsController = require("../controllers/sparePartsController");
const authenticate = require("../extras/auth");

router.get("/", authenticate, partsController.getParts);
router.get("/:id", authenticate, partsController.getPart);
router.post("/", authenticate, partsController.createPart);
router.put("/:id", authenticate, partsController.updatePart);
router.delete("/:id", authenticate, partsController.deletePart);

module.exports = router;