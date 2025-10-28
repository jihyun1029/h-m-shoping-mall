const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const cartController = require("../controllers/cart.controller");

router.post("/", authController.authenticate, cartController.addItemToCart); // 로그인한 유저만 카트 추가 할 수 있다.

module.exports = router;