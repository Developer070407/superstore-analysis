const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const { connectDB } = require("../database/db");

const knowledgeRoute = require("../routers/knowledgeBaseRoute");
const requestRoute = require("../routers/supportRequestRoute");
const technicianRoute = require("../routers/technicianRouter");
const partsRoute = require("../routers/sparePartsRoute");
const authRoute = require("../routers/authenticationRoute");
const userRoute = require("../routers/userRoute");
const jobRoute = require("../routers/jobSchedulingRoute");

const server = express();
const port = process.env.PORT || 3000;

connectDB();
server.use(cors());
server.use(express.json());

server.use("/user", userRoute);
server.use("/auth", authRoute);
server.use("/job", jobRoute);
server.use("/knowledge", knowledgeRoute);
server.use("/parts", partsRoute);
server.use("/request", requestRoute);
server.use("/tech", technicianRoute);

server.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}`);
});