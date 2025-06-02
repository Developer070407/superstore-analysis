const UserModel = require("../models/model").UserModel;
const { v4: uuidv4 } = require('uuid');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

exports.register = async (name, email, password, isBusiness, address, businessName) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({
        id: uuidv4(),
        name,
        email,
        password: hashedPassword,
        isBusiness,
        businessName: isBusiness ? businessName : undefined,
        address,
        role: 'user'
    });
    try {
        await newUser.save();
        return newUser.toJSON();
    } catch (error) {
        console.error(`Error in authentication service: ${error.message}`);
        throw new Error(error);
    }
};


exports.login = async (email, password) => {
    const foundUser = await UserModel.findOne({ email });
    if (!foundUser) return null;
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) return null;
    const token = jwt.sign({ id: foundUser.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
    return { token, id: foundUser.id, foundUser };
};

exports.generateTokens = (user) => {
    const accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken };
};

exports.verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new Error("Invalid or expired refresh token");
    }
};

exports.checkEmail = (email) => {
    const banned = ['(', ')', ',', ':', ';', '<', '>', '[', ']', " "];
    if (
        !email ||
        email.length < 6 ||
        email.length > 320 ||
        email.startsWith('.') ||
        email.startsWith('@') ||
        email.endsWith('.') ||
        email.endsWith('@') ||
        email.includes('..')
    ) return null;

    for (let char of banned) {
        if (email.includes(char)) return null;
    }

    const atIndex = email.indexOf('@');
    const domainPart = email.slice(atIndex + 1);
    if (atIndex === -1 || domainPart.length === 0 || !domainPart.includes('.') || domainPart.startsWith('.') || domainPart.endsWith('.')) {
        return null;
    }

    return true;
};

exports.checkPassword = (password) => {
    let hasUpper = false, hasNum = false, hasSpecial = false;

    if (password.length < 8) return null;

    for (const ch of password) {
        if (ch.toUpperCase() === ch && ch.toLowerCase() !== ch) hasUpper = true;
        else if (!isNaN(ch)) hasNum = true;
        else if (!/[A-Za-z0-9]/.test(ch)) hasSpecial = true;
    }

    return (hasUpper && hasNum && hasSpecial) ? true : null;
};