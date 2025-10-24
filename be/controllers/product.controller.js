const Product = require("../models/Product");

const productController = {}

productController.createProduct = async (req, res) => {
    try {
        const {
            sku,
            name,
            size,
            image,
            category,
            description,
            price,
            stock,
            status
        } = req.body;
        const product = new Product({
            sku,
            name,
            size,
            image,
            category,
            description,
            price,
            stock,
            status
        });

        await  product.save();
        res.status(200).json({status:"success", product});
    } catch(error) {
        res.status(400).json({status:"fail", error:error.message});
    }
};

productController.getProducts = async (req, res) => {
    try {
        // 쿼리값 읽어오기
        const {page, name} = req.query;

        // 만약에 다른 조건들이 추가로 생기면 if문이 더 늘어나야하는 구조
        /*
            if(name) {
                // const products = await Product.find({name:name}); // 이렇게 한다면 키워드가 이것만.
                const products = await Product.find({name:{$regex:name, $options:"i"}}); // 키워드를 포한해서 검색
            } else {
                const products = await Product.find({});
            }
        */

        // 검색 조건이 추가되는 것을 고려해서, 검색 조건을 모아서
        // 검색 조건을 cond에 다 모을 것이다. 만약에 이름이 있다? 검색조건은
        const cond = name ? { name: { $regex: name, $options: "i" } } : {};
        // query는 컨디션을 추가해주겠다.
        let query = Product.find(cond);

        // 쿼리를 따로 실행할 수 있다. 실행을 시키고 싶을때 선언과 실행을 따로 하고 싶을때
        const productList = await query.exec();
        res.status(200).json({status:"success", data: productList});
    } catch(error) {
        res.status(400).json({status:"fail", error:error.message});
    }
};


module.exports = productController;