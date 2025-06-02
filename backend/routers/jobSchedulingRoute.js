const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobSchedulingController");
const authenticate = require("../extras/auth");

router.get("/", authenticate, jobController.getJobs);
router.get("/:id", authenticate, jobController.getJob);
router.post("/", authenticate, jobController.createJob);
router.put("/:id", authenticate, jobController.updateJob);
router.delete("/:id", authenticate, jobController.deleteJob);

module.exports = router;