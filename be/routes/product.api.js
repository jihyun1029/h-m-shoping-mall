const express = require("express");
const authController = require("../controllers/auth.controller");
const productController = require("../controllers/product.controller");
const router = express.Router();

router.post(
    "/",
    authController.authenticate,
    authController.checkAdminPermission,
    productController.createProduct
); // 상품 관리는 admin만 할 수 있기 때문에 admin인지 아닌지 확인.

module.exports = router;