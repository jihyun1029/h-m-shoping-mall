const Cart = require("../models/Cart");

const cartController = {}

cartController.addItemToCart = async (req, res) => {
    try {
        // 정보 가져오기
        const {userId} = req;
        const {productId, size, qty} = req.body;

        // 유저를 가지고 카트 찾기 (userId로 cart 찾기)
        let cart = await Cart.findOne({userId}) // {userId:userId}

        if (!cart) {
            // 유저가 만든 카트가 없다, 만들어주기
            cart = new Cart({userId, items: []}); // items 초기화
            await cart.save();
        }

        // cart.items가 없을 경우 대비
        if (!cart.items) {
            cart.items = [];
        }

        // 이미 카트에 들어가 있는 아이템이냐? productId, size
        const existItem = cart.items.find(
            (item) => item.productId.equals(productId) && item.size === size
        );
        if (existItem) {
            // 그렇다면 에러 ('이미 아이템이 카트에 있습니다')
            throw new Error("아이템이 이미 카트에 담겨 있습니다!");
        }

        // 카트에 아이템을 추가
        cart.items = [...cart.items, {productId, size, qty}];
        await cart.save();

        res.status(200).json({status: "success", data: cart, cartItemQty: cart.items.length});

    } catch (error) {
        return res.status(400).json({status: "fail", error: error.message});
    }
};

cartController.getCart = async (req, res) => {
    try {
        const {userId} = req;
        const cart = await Cart.findOne({userId}).populate({
            path: 'items',
            populate: {
                path: "productId",
                model: "Product",
            },
        });

        // cart가 없을 수도 있으니 예외 처리 추가
        if (!cart) {
            return res.status(200).json({status: "success", data: []});
        }

        return res.status(200).json({status: "success", data: cart.items});
    } catch (error) {
        return res.status(400).json({status: "fail", error: error.message});
    }
};

cartController.editCartItem = async (req, res) => {
    try {
        const {userId} = req;
        const {id} = req.params;
        const {qty} = req.body;

        const cart = await Cart.findOne({userId}).populate({
            path: 'items',
            populate: {
                path: "productId",
                model: "Product",
            },
        });
        if (!cart) {
            throw new Error("There is no cart for this user");
        }

        // 해당 아이템의 수량 업데이트
        const item = cart.items.find(item => item._id.equals(id));
        if (!item) {
            throw new Error("Item not found");
        }

        item.qty = qty;
        await cart.save();

        res.status(200).json({status: "success", data: cart.items});
    } catch (error) {
        return res.status(400).json({status: "fail", error: error.message});
    }
};

cartController.deleteCartItem = async (req, res) => {
    try {
        const {userId} = req;
        const {id} = req.params;

        const cart = await Cart.findOne({userId});
        if (!cart) {
            throw new Error("Cart not found");
        }

        // 해당 아이템을 카트에서 제거
        cart.items = cart.items.filter(item => !item._id.equals(id));
        await cart.save();

        res.status(200).json({status: "success", message: "Item deleted successfully", cartItemQty: cart.items.length});
    } catch (error) {
        return res.status(400).json({status: "fail", error: error.message});
    }
}

cartController.getCartQty = async (req, res) => {
    try {
        const {userId} = req;
        const cart = await Cart.findOne({userId: userId});
        if (!cart) throw new Error("There is no cart!");
        res.status(200).json({status: 200, qty: cart.items.length});
    } catch (error) {
        return res.status(400).json({status: "fail", error: error.message});
    }
};

module.exports = cartController;