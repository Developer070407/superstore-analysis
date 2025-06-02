const jwt = require("jsonwebtoken");
require('dotenv').config();

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({authHeader, message: "Access token missing or malformed" });

    const token = authHeader.split(" ")[1];
    
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.id = decoded.id;
        console.log("Auth: ", req.id);
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};