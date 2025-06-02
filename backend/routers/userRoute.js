const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticate = require("../extras/auth");

router.put("/:id", authenticate, userController.updateUser);
router.delete("/:id", authenticate, userController.deleteUser);
router.get("/", authenticate, userController.getUsers);
router.get("/:id", authenticate, userController.getUser);

module.exports = router;