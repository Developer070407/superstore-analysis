const express = require("express");
const router = express.Router();
const requestController = require("../controllers/supportRequestController");
const authenticate = require("../extras/auth");

router.post("/create", authenticate, requestController.createRequest);
router.get("/my-requests", authenticate, requestController.getUserRequests);
router.get("/", authenticate, requestController.viewRequests);
router.get("/:id", authenticate, requestController.viewRequest);
router.put("/:id", authenticate, requestController.updateUserRequest);
router.delete("/:id", authenticate, requestController.deleteUserRequest);

module.exports = router;