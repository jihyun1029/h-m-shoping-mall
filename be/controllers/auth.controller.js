const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authController = {}

authController.loginWithEmail = async (req, res) => {
    try {
        const {email, password} = req.body
        let user = await User.findOne({email})
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password)
            if(isMatch) {
                // token
                const token = await user.generateToken()
                return res.status(200).json({status:"success", user, token});
            }
        }
        throw new Error("invalid email or password");
    } catch(error) {
        res.status(400).json({status:"fail", error:error.message});
    }
};

authController.authenticate = async (req, res, next) => {
    try {
        const tokenString = req.headers.authorization;
        if(!tokenString) throw new Error("Token not found");

        const token = tokenString.replace("Bearer ", "");

        jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
            if(error) throw new Error("invalid token");
            req.userId = payload._id;
            next();
        });
    } catch(error) {
        res.status(400).json({status:"fail", error:error.message})
    }
};

authController.checkAdminPermission = async (req, res, next) => {
    try {
        // 어떤 유저인지 어디서 알 수 있나? token 값으로 찾을 수 있다.
        // 그럼 token 값을 가지고 userId를 찾아내는 것을 여기서 또 할 필요 있을까?
        // 위에서 했기 때문에 다시 가져다 쓰면 됨.
        const {userId} = req;
        const user = await User.findById(userId);
        if(user.level !== "admin") throw new Error("no permission");
        next();
    } catch(error) {
        res.status(400).json({status:"fail", error:error.message});
    }
}

module.exports = authController;