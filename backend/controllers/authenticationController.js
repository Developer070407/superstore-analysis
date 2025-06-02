const userService = require("../services/authenticationService");

exports.register = async (req, res) => {
    try {
        const { name, email, password, isBusiness, address, businessName } = req.body;
        if (!name || !email || !password || !address)
            return res.status(400).json({ message: "Enter all inputs!" });
        if (isBusiness === true && !businessName)
            return res.status(400).json({ message: "Business name is required for business accounts!" });
        if (!userService.checkEmail(email))
            return res.status(400).json({ message: "Invalid Email!" });

        if (!userService.checkPassword(password))
            return res.status(400).json({
                message: "Invalid Password! Password must include at least one uppercase letter, special character, and number.",
            });

        const newUser = await userService.register( name, email, password, isBusiness, address, businessName );
        return res.status(201).json({ message: "User registered successfully!", newUser });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = await userService.login(email, password);

        if (!data) return res.status(401).json({ message: "Invalid credentials" });
        return res.status(200).json({ data, message: "Login successful!" });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

exports.refreshToken = (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });

        const userData = userService.verifyRefreshToken(refreshToken);
        const tokens = userService.generateTokens(userData);
        return res.json(tokens);
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired refresh token" });
    }
};